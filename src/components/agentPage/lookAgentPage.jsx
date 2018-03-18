import React from 'react'
import './agent.less'
import {Pagination, Select, Icon, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {getRequest, postRequest} from '../../common/ajax'
import addressData from '../../common/area'

const Option = Select.Option

let LookAgentPage = React.createClass({
    getInitialState () {
        return {
            dataSource: [],
            searchList: {
                province: undefined,
                city: undefined,
                hangYe: undefined,
                leval: undefined,
                memberId: ''
            },
            tradeList: [],
            provinceList: [],
            cityList: [],
            isZhiXiaShi: false,
            curPage: 1,
            pageTotal: 0
        }
    },
    handleChange (val, type) {
        let {searchList} = this.state
        if (type === 'province') {
            if (val === '110100' || val === '120100' || val === '500100' || val === '310100') {
                this.setState({
                    isZhiXiaShi: true
                })
            } else {
                this.setState({
                    isZhiXiaShi: false
                })
                this.cityListFn(val)
            }
        }
        searchList[type] = val
        this.setState({
            searchList: searchList
        })
    },
    componentDidMount () {
        let {searchList} = this.state
        let formData = {}
        let memberId = localStorage.getItem('memberId')
        searchList.memberId = memberId
        formData.memberId = memberId
        formData.page = 1
        this.reqDataFn(formData)
        this.reqMeiJUListFn()
        this.provinceListFn()
        this.setState({
            searchList: searchList
        })
    },
    // 省市列表
    provinceListFn () {
        let {provinceList} = this.state
        addressData.map((v, index) => {
            provinceList.push({id: v.id, value: v.value})
        })
        this.setState({
            provinceList: provinceList
        })
    },
    // 城市--city列表
    cityListFn (val) {
        let {cityList, searchList} = this.state
        if (val !== undefined) {
            cityList = []
            addressData.map((v, index) => {
                if (v.id === val) {
                    v.children.map((vC, indexC) => {
                        cityList.push({id: vC.id, value: vC.value})
                    })
                }
            })
            searchList.city = cityList[0].id
            this.setState({
                cityList: cityList,
                searchList: searchList
            })
        } else {
            searchList.city = undefined
            this.setState({
                searchList: searchList
            })
        }
    },
    reqDataFn (formData) {
        let URL = 'member/platformMemberHr/queryByPageAndRecommendNum'
        let _th = this
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                console.log(res)
                let data = res.data
                _th.setState({
                    dataSource: data.list,
                    pageTotal: data.total
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
        let {memberId} = this.state
        let formData = {}
        formData.memberId = memberId
        formData.page = val
        this.reqDataFn(formData)
        this.setState({
            curPage: val
        })
    },
    // 行业下拉框枚举接口
    reqMeiJUListFn () {
        let URL = 'member/platformDict/selectDictionariesGroupByType'
        let _th = this
        let formData = {}
        formData.types = '12'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                let tradeList = [...data['12']]
                _th.setState({
                    tradeList: tradeList
                })
            } else if (code !== 401) {
                message.error(res.message)
            }
        })
    },
    onSearch () {
        let {searchList, isZhiXiaShi} = this.state
        let formData = {}
        formData.memberId = searchList.memberId
        formData.page = 1
        if (searchList.leval !== undefined) {
            formData.level = searchList.leval
        }
        if (searchList.hangYe !== undefined) {
            formData.trade = searchList.hangYe
        }
        if (isZhiXiaShi && searchList.province !== undefined) {
            formData.city = searchList.province
        } else if (!isZhiXiaShi && searchList.city !== undefined) {
            formData.city = searchList.city
        }
        console.log(formData)
        this.reqDataFn(formData)
    },
    onPleaceTui (id, name, headUrl) {
        window.location.hash = `chatWindow?id=${id}`
    },
    clickDuanZhu (toId, state) {
        if (state === 0 || state === null) {
            let {searchList, curPage} = this.state
            let URL = 'member/follow/companyFollowHr'
            let _th = this
            let formData = {}
            formData.fromId = searchList.memberId
            formData.toId = toId
            postRequest(true, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    let formDataQ = {}
                    formDataQ.memberId = searchList.memberId
                    formDataQ.page = curPage
                    _th.reqDataFn(formDataQ)
                } else {
                    message.error(res.message)
                }
            })
        }
    },
    render () {
        let {dataSource, searchList, tradeList, provinceList, cityList, isZhiXiaShi, curPage, pageTotal} = this.state
        let selectStyle = {width: '120px', marginRight: '10px', marginTop: '10px'}
        return (
            <div className='LookAgentPage' style={dataSource.length === 0 ? {height: '100%'} : {minHeight: 'calc(~"100% + 10px")'}}>
                <div className={dataSource.length === 0 ? 'content nullContent' : 'content'} style={dataSource.length === 0 ? {height: '100%', backgroundColor: '#fff'} : {minHeight: 'calc(~"100% + 10px")'}}>
                    <div className='til' style={dataSource.length === 0 ? {borderBottom: '1px solid #e6f5ff'} : {}}>
                        <Select placeholder="省份" style={selectStyle}
                                value={searchList.province}
                                allowClear={true}
                                onChange={(val) => this.handleChange(val, 'province')} size='large'>
                            {provinceList.length > 0 ? provinceList.map((v, index) => {
                                return <Option value={v.id} key={index}>{v.value}</Option>
                            }) : null}
                        </Select>
                        {
                            isZhiXiaShi
                            ? null
                            : <Select placeholder="城市" style={selectStyle}
                                      value={searchList.city}
                                      notFoundContent='请选择省份'
                                      allowClear={true}
                                      onChange={(val) => this.handleChange(val, 'city')} size='large'>
                                    {cityList.length > 0 ? cityList.map((v, index) => {
                                        return <Option value={v.id} key={index}>{v.value}</Option>
                                    }) : null}
                              </Select>
                        }
                        <Select placeholder="行业" style={selectStyle}
                                value={searchList.hangYe}
                                allowClear={true}
                                onChange={(val) => this.handleChange(val, 'hangYe')} size='large'>
                            {tradeList.length > 0 ? tradeList.map((v, index) => {
                                return <Option value={v.content} key={index}>{v.content}</Option>
                            }) : null}
                        </Select>
                        <Select placeholder="等级" style={selectStyle} value={searchList.leval}
                                allowClear={true}
                                onChange={(val) => this.handleChange(val, 'leval')} size='large'>
                            <Option value="1">Lv1</Option>
                            <Option value="2">Lv2</Option>
                            <Option value="3">Lv3</Option>
                            <Option value="4">Lv4</Option>
                            <Option value="5">Lv5</Option>
                            <Option value="6">Lv6</Option>
                        </Select>
                        <Icon type="search" className='searchIcon' onClick={this.onSearch}/>
                    </div>
                    {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                    {dataSource.map((v, index) => {
                        return (
                            <div className='item' key={index}>
                                <CommonTpl itemData={v}/>
                                <div className='operate'>
                                    <div className='onLine' onClick={() => this.onPleaceTui(v.memberId)}>请他推荐</div>
                                    <div className='noGood' onClick={() => this.clickDuanZhu(v.memberId, v.followRelationNum)}
                                         style={v.followRelationNum === 0 || v.followRelationNum === null ? {} : {cursor: 'not-allowed'}}>
                                        <span className={v.followRelationNum === 0 || v.followRelationNum === null ? 'weiGuanZhuPic' : 'yiGuanZhuPic'}></span>
                                        {v.followRelationNum === 0 || v.followRelationNum === null ? '关注' : '已关注'}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {
                        dataSource.length === 0
                        ? null
                        : <div className='my_pagination'>
                             <Pagination current={curPage} total={pageTotal} pageSize={20} size='large' onChange={this.ChangePagination}/>
                          </div>
                    }
                </div>
            </div>
        )
    }
})

export default LookAgentPage
