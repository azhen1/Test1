import React from 'react'
import {DatePicker, Select, Icon, Pagination, Input, message} from 'antd'
import './balanceManager.less'
import {getRequest, postRequest} from '../../common/ajax'
import $ from 'jquery'
const {RangePicker} = DatePicker
const Option = Select.Option

let resourceList = {0: '其他', 1: '面试', 2: '入职', 3: '充值', 4: '提现', 5: '提现失败', 6: '房租', 7: '面试冻结', 8: '入职冻结', 9: '面试解冻', 10: '入职解冻'}
let BalanceManager = React.createClass({
    getInitialState () {
        return {
            mingxiBalanceList: [],
            curPage: 'manager',
            memberId: '',
            searchList: {
                resourceType: undefined,
                date: undefined
            },
            chongZhiPay: '',
            drawbackPay: '',
            drawbackZhanghao: '',
            dataTotleList: {},
            curPagination: 1,   // 当前页
            pageTotal: 0,   // 总数据
            pageSize: 20   // 每页显示的数据数
        }
    },
    componentDidMount () {
        let memberId = localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        })
        this.reqDataFn()
        this.reqDataTotleList()
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
        let memberId = localStorage.getItem('memberId')
        let formData = {}
        formData.companyId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    dataTotleList: {...res.data}
                })
            } else if (code !== 401) {
                message.error(res.message)
            }
        })
    },
    // 当前用户余额明细
    reqDataFn () {
        let memberId = localStorage.getItem('memberId')
        let URL = 'member/platformMemberMoneyRecord/queryByPage'
        let _th = this
        let {curPagination, searchList, pageSize} = _th.state
        let formData = {}
        if (searchList.resourceType !== undefined) {
            formData.resource = searchList.resourceType
        }
        if (searchList.date !== undefined) {
            formData.startTime = searchList.date[0] !== '' ? searchList.date[0] + ' 00:00:00' : ''
            formData.endTime = searchList.date[1] !== '' ? searchList.date[1] + ' 23:59:59' : ''
        }
        formData.memberId = memberId
        formData.page = curPagination
        formData.pageSize = pageSize
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    mingxiBalanceList: res.data.list,
                    pageTotal: res.data.total
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录!')
            } else {
                message.error(res.message)
            }
        })
    },
    // 分页
    ChangePagination (val) {
        this.setState({
            curPagination: val
        }, () => {
            this.reqDataFn()
        })
    },
    searchFn () {
        this.setState({
            curPagination: 1
        }, () => {
            this.reqDataFn()
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
            message.warning('充值金额最少为1000!')
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
        let memberId = localStorage.getItem('memberId')
        let {drawbackZhanghao, drawbackPay} = _th.state
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
                _th.reqDataTotleList()
            } else {
                message.error(res.message)
            }
        })
    },
    // 根据消息类型判断金额显示符号 7面试冻结：冻结30   9面试解冻：解冻30    1面试：-30   8入职冻结：冻结300   10入职解冻：解冻300    2入职：-300
    showMoney (type, resource, money) {
        if (resource === 7 || resource === 8) {
            return `冻结-${money}`
        } else if (resource === 9 || resource === 10) {
            return `解冻+${money}`
        } else {
            if (type === 0) {
                return `+${money}`
            } else if (type === 1) {
                return `-${money}`
            }
        }
    },
    render () {
        let {mingxiBalanceList, curPage, searchList, chongZhiPay, memberId, dataTotleList, drawbackPay, drawbackZhanghao, pageTotal, curPagination, pageSize} = this.state
        return (
            <div className="BalanceManager">
                <div className='content'>
                    {curPage === 'manager' ? <div>
                        <div className='header'>
                            <div className='curBalance'>
                                <div className='val_b'>
                                    当前余额
                                    <span>{dataTotleList.CompanyCurrentMoney ? dataTotleList.CompanyCurrentMoney : 0}</span>
                                </div>
                                {dataTotleList.CompanyCurrentMoney && dataTotleList.CompanyCurrentMoney < 325 ? <div className='warm'>
                                    当前余额不多，为保证正常面试及入职，请提前充值
                                </div> : null}
                            </div>
                            <div className='freezeBalance'>
                                <div className='freeze_b'>
                                    冻结余额
                                    <span>{dataTotleList.CompanyFrozenMoney ? dataTotleList.CompanyFrozenMoney : 0}</span>
                                </div>
                                <div className='tongJiList'>
                                    <span>待面试<i>{dataTotleList.CompanyInterviewNum ? dataTotleList.CompanyInterviewNum : 0}</i>人</span>
                                    <span>待入职<i>{dataTotleList.CompanyEntryNum ? dataTotleList.CompanyEntryNum : 0}</i>人</span>
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
                                <span className='btn' onClick={this.searchFn}>
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
                                            {v.remark}
                                        </span>
                                        <span className='count'>{this.showMoney(v.type, v.resource, v.money)}</span>
                                    </div>
                                )
                            })}
                        </div>
                        {
                            mingxiBalanceList.length === 0
                            ? null
                            : <div className='my_pagination' style={{textAlign: 'right'}}>
                                  <Pagination current={parseInt(curPagination)} total={pageTotal} pageSize={pageSize} onChange={this.ChangePagination}/>
                              </div>
                        }
                        <div className='operate'>
                            <span className='rechargeBtn' onClick={() => this.togglePage('rechargePage')}>立即充值</span>
                            <span className='refundBtn' onClick={() => this.togglePage('refundPage')}>申请退款</span>
                        </div>
                    </div> : null}
                    {curPage === 'rechargePage' ? <div className='rechargePage'>
                        <div className='backpageMain'>
                            <a className='backBox' onClick={() => this.togglePage('manager')}></a>
                        </div>
                        <div className="rechargePageMain">
                            <div className='title'>
                                <span className='c_count'>充值金额</span>
                                <span className='c_type'>目前仅支持支付宝</span>
                            </div>
                            {/* https://api.jingpipei.com/member/ali/webPay */}
                            {/* http://116.62.136.23 */}
                            <form action="https://api.jingpipei.com/member/ali/webPay" method='post'>
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
                        </div>
                    </div> : null}
                    {curPage === 'refundPage' ? <div className='refundPage'>
                        <div className='backpageMain'>
                            <a className='backBox' onClick={() => this.togglePage('manager')}></a>
                        </div>
                        <div className='refundPageMain'>
                            <div className='title'>
                                <span className='c_count'>退款金额</span>
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
                        </div>
                    </div> : null}
                </div>
            </div>
        )
    }
})

export default BalanceManager
