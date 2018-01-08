import React from 'react'
import {DatePicker, Select, Icon, Pagination, Input, message} from 'antd'
import './balanceManager.less'
import {getRequest, postRequest} from '../../common/ajax'
import $ from 'jquery'
const {RangePicker} = DatePicker
const Option = Select.Option

let resourceList = {0: '其他', 1: '面试', 2: '入职', 3: '充值', 4: '提现', 5: '提现失败', 6: '房租', 7: '面试冻结', 8: '入职冻结', 9: '面试解冻', 10: '入职冻结'}
let BalanceManager = React.createClass({
    getInitialState () {
        return {
            mingxiBalanceList: [],
            curPage: 'manager',
            memberId: '',
            curPagination: 1,
            searchList: {
                resourceType: undefined,
                date: undefined
            },
            chongZhiPay: '',
            drawbackPay: '',
            drawbackZhanghao: '',
            dataTotleList: {},
            pageTotal: 0
        }
    },
    componentDidMount () {
        let memberId = localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        }, () => {
            this.reqDataFn()
            this.reqDataTotleList()
        })
    },
    onDateChange (date, dateString) {
        let {searchList} = this.state
        searchList.date = dateString
        this.setState({
            searchList: searchList
        })
    },
    handleSelectChange (value) {
        let {searchList} = this.state
        searchList.resourceType = value
        this.setState({
            searchList: searchList
        })
    },
    togglePage (val) {
        this.setState({
            curPage: val
        })
    },
    // 当前金额；冻结金额；待入职；待面试
    reqDataTotleList () {
        let URL = 'job/platformInterview/moneyRecordAndCompanyInfo'
        let _th = this
        let {memberId} = _th.state
        let formData = {}
        formData.companyId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    dataTotleList: {...res.data}
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 当前用户余额明细
    reqDataFn (search) {
        let URL = 'member/platformMemberMoneyRecord/queryByPage'
        let _th = this
        let {memberId, curPagination, searchList} = _th.state
        let formData = {}
        if (search === 'search') {
            if (searchList.resourceType !== undefined) {
                formData.resource = searchList.resourceType
            }
        }
        formData.memberId = memberId
        formData.page = curPagination
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    mingxiBalanceList: res.data.list,
                    pageTotal: res.data.total
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 分页
    ChangePagination (val) {
        let {memberId} = this.state
        let formData = {}
        formData.memberId = memberId
        formData.page = val
        this.reqDataFn(formData)
        this.setState({
            curPagination: val
        })
    },
    resourceListFn () {
        let result = []
        for (let key in resourceList) {
            result.push(<Option value={key} key={key}>{resourceList[key]}</Option>)
        }
        return result
    },
    // 余额类型转换
    toggleType (value) {
        let result = ''
        for (let key in resourceList) {
            if (value === parseInt(key)) {
                result = resourceList[key]
            }
        }
        return result
    },
    onSearch () {
        let {searchList} = this.state
        if (searchList.date === undefined && searchList.resourceType === undefined) {
            this.reqDataFn()
        } else {
            this.reqDataFn('search')
        }
    },
    // 验证金额是否为空
    onChongZhi () {
        let {chongZhiPay} = this.state
        if (chongZhiPay === '') {
            message.warning('请输入金额!')
        }
    },
    // 充值金额验证
    onChongZhiBlur (e) {
        let val = e.target.value
        let reg = new RegExp('^\\d+(\\.\\d+)?$')
        if (!reg.test(val)) {
            message.warning('请输入正确的金额!')
            this.setState({
                chongZhiPay: ''
            })
            return false
        }
        if (val < 1000) {
            message.warning('充值金额必须大于1000!')
            this.setState({
                chongZhiPay: ''
            })
            return false
        }
        this.setState({
            chongZhiPay: val
        })
    },
    // 退款金额验证
    onDrawbackBlur (e, type) {
        let val = e.target.value
        let reg = new RegExp('^\\d+(\\.\\d+)?$')
        if (!reg.test(val)) {
            message.warning('请输入正确的金额!')
            this.setState({
                drawbackPay: ''
            })
            return false
        }
        this.setState({
            drawbackPay: val
        })
    },
    onChongZhiChange (e) {
        let val = e.target.value
        this.setState({
            chongZhiPay: val
        })
    },
    onDrawbackChange (e) {
        let val = e.target.value
        this.setState({
            drawbackPay: val
        })
    },
    zhangHaoChange (e) {
        let val = e.target.value
        this.setState({
            drawbackZhanghao: val
        })
    },
    // 退款
    onDrawback () {
        let _th = this
        let {drawbackZhanghao, drawbackPay, memberId} = _th.state
        let URL = 'member/currentMoney/webWithdrawMoney'
        let formData = {}
        if (drawbackZhanghao === '' || drawbackPay === '') {
            message.warning('请将信息填写完整!')
            return false
        }
        formData.memberId = memberId
        formData.money = drawbackPay
        formData.alipayAccount = drawbackZhanghao
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('申请成功!')
                _th.togglePage('manager')
                _th.reqDataFn()
            } else {
                message.error(res.message)
            }
        })
    },
    widthBalanceManager () {
        let doc = document
        let [BalanceManager] = doc.getElementsByClassName('BalanceManager')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (content !== undefined && BalanceManager !== undefined) {
            if (content.offsetHeight > BalanceManager.offsetHeight) {
                result = true
            }
        }
        return result
    },
    render () {
        let {mingxiBalanceList, curPage, searchList, chongZhiPay, memberId, dataTotleList, drawbackPay, drawbackZhanghao, pageTotal, curPagination} = this.state
        return (
            <div className="BalanceManager" style={this.widthBalanceManager() ? {height: 'auto'} : {height: 'calc(~"100% + 10px")'}}>
                <div className='content'>
                    {curPage === 'manager' ? <div>
                        <div className='header'>
                            <div className='curBalance'>
                                <div className='val_b'>
                                    当前余额
                                    <span>{dataTotleList.CompanyCurrentMoney && dataTotleList.CompanyCurrentMoney}</span>
                                </div>
                                {dataTotleList.CompanyCurrentMoney && dataTotleList.CompanyCurrentMoney < 325 ? <div className='warm'>
                                    当前余额不多，为保证正常面试及入职，请提前充值
                                </div> : null}
                            </div>
                            <div className='freezeBalance'>
                                <div className='freeze_b'>
                                    冻结余额
                                    <span>{dataTotleList.CompanyFrozenMoney && dataTotleList.CompanyFrozenMoney}</span>
                                </div>
                                <div className='tongJiList'>
                                    <span>待面试<i>{dataTotleList.CompanyInterviewNum && dataTotleList.CompanyInterviewNum}</i>人</span>
                                    <span>待入职<i>{dataTotleList.CompanyEntryNum && dataTotleList.CompanyEntryNum}</i>人</span>
                                    <span style={{marginLeft: '10px'}}>(如候选人爽约余额将解冻)</span>
                                </div>
                            </div>
                        </div>
                        <div className='detail'>
                            <div className='search'>
                            <span className='detailBalance'>
                                余额明细
                            </span>
                                <span className='date'>
                                日期
                            </span>
                                <RangePicker onChange={this.onDateChange} size='large'/>
                                <Select placeholder='分类' style={{width: '128px', marginRight: '10px'}}
                                        value={searchList.resourceType}
                                        allowClear={true}
                                        onChange={this.handleSelectChange} size='large'>
                                    {this.resourceListFn()}
                                </Select>
                                <span className='btn' onClick={this.onSearch}>
                                    <Icon type="search" style={{fontSize: '18px', margin: '0 20px', verticalAlign: 'middle'}}/>
                                    搜索
                                </span>
                            </div>
                        </div>
                        <div className='itemBalance'>
                            {mingxiBalanceList.map((v, index) => {
                                return (
                                    <div className='itemBox' key={index}>
                                        <span className='type'>{this.toggleType(v.resource)}</span>
                                        <span className='shuoMing'>
                                            {v.resource === 0 || v.resource === 3 || v.resource === 4 || v.resource === 5 ? '' : v.remark}
                                        </span>
                                        <span className='count'>{v.type === 0 ? `+${v.money}` : `-${v.money}`}</span>
                                    </div>
                                )
                            })}
                        </div>
                        {
                            mingxiBalanceList.length === 0
                            ? null
                            : <div className='my_pagination' style={{textAlign: 'right'}}>
                                  <Pagination current={parseInt(curPagination)} total={pageTotal} pageSize={20} onChange={this.ChangePagination}/>
                              </div>
                        }
                        <div className='operate'>
                            <span className='rechargeBtn' onClick={() => this.togglePage('rechargePage')}>立即充值</span>
                            <span className='refundBtn' onClick={() => this.togglePage('refundPage')}>申请退款</span>
                        </div>
                    </div> : null}
                    {curPage === 'rechargePage' ? <div className='rechargePage'>
                        <div className='title'>
                            <span className='c_count'>充值金额</span>
                            <span className='c_type'>目前仅支持支付宝</span>
                        </div>
                        <form action="http://192.168.0.102/member/ali/webPay" method='post'>
                            <div className='ipt'>
                                <Input onBlur={this.onChongZhiBlur} value={chongZhiPay} onChange={this.onChongZhiChange} name='totalMoney' autoComplete='off'/>
                            </div>
                            <input value='充值' name='subject' style={{display: 'none'}}/>
                            <input value={memberId} name='memberId' style={{display: 'none'}}/>
                            <div className='qiChong'>
                                1000起冲
                            </div>
                            <div className='confirm'>
                                {chongZhiPay === '' ? <span onClick={this.onChongZhi}>确认充值</span> : <input type="submit" value="确认充值" />}
                            </div>
                        </form>
                        <div className='xieYi'>
                            <Icon type="check-circle-o" style={{fontSize: '16px', marginRight: '12px'}}/>
                            充值即表示同意《鲸城网络增值服务协议》
                        </div>
                    </div> : null}
                    {curPage === 'refundPage' ? <div className='refundPage'>
                        <div className='title'>
                            <span className='c_count'>退款金额</span>
                            <span className='c_type'>目前仅支持支付宝</span>
                        </div>
                        <div className='iptRefund'>
                            <Input onBlur={this.onDrawbackBlur} value={drawbackPay} onChange={this.onDrawbackChange}/>
                        </div>
                        <div className='iptRefund iptRefund1'>
                            <span className='c_count'>退款账号</span>
                            <Input value={drawbackZhanghao} onChange={this.zhangHaoChange}/>
                        </div>
                        <div className='confirm'>
                            <span onClick={this.onDrawback}>申请退款</span>
                        </div>
                        <div className='xieYi'>
                            <Icon type="check-circle-o" style={{fontSize: '16px', marginRight: '12px'}}/>
                            充值即表示同意《鲸城网络增值服务协议》
                        </div>
                    </div> : null}
                </div>
            </div>
        )
    }
})

export default BalanceManager
