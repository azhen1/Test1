import React from 'react'
import './agent.less'
import {Pagination, Select, Icon, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {getRequest, postRequest} from '../../common/ajax'
const Option = Select.Option

let MyAgentPage = React.createClass({
    getInitialState () {
        return {
            dataSource: [],
            curFollow: 'followByMy',
            memberId: '',
            curPage: '1',
            pageTotal: 0
        }
    },
    onFollowClick (val) {
        this.setState({
            curFollow: val,
            curPage: '1'
        }, () => {
            let {curFollow, curPage, memberId} = this.state
            let formData = {}
            formData.memberId = parseInt(memberId)
            formData.page = curPage
            if (curFollow === 'followByMy') {
                this.reqDataFnByMy(formData)
            } else {
                this.reqDataFnByOther(formData)
            }
        })
    },
    onPleaceTui (id, name, headUrl) {
        window.location.hash = `chatWindow?id=${id}`
    },
    componentDidMount () {
        let memberId = localStorage.getItem('memberId')
        let formData = {}
        formData.memberId = parseInt(memberId)
        formData.page = 1
        this.reqDataFnByMy(formData)
        this.setState({
            memberId: memberId
        })
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    // 我关注的
    reqDataFnByMy (formData) {
        let URL = 'member/follow/companyFHr'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSource: data.list,
                    pageTotal: data.total
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录!')
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 关注我的
    reqDataFnByOther (formData) {
        let URL = 'member/follow/hrFCompanyByCompany'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSource: data.list,
                    pageTotal: data.total
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 取消关注
    onNoGood (toId) {
        let URL = 'member/follow/companyUnfollowHr'
        let _th = this
        let {memberId, curPage} = _th.state
        let formData = {}
        formData.fromId = parseInt(memberId)
        formData.toId = toId
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('取消关注成功!')
                let formDataQ = {}
                formDataQ.memberId = parseInt(memberId)
                formDataQ.page = curPage
                _th.reqDataFnByMy(formDataQ)
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 分页--我关注的
    ChangePaginationByMy (val) {
        let {memberId} = this.state
        let formData = {}
        formData.memberId = parseInt(memberId)
        formData.page = val
        this.reqDataFnByMy(formData)
        this.setState({
            curPage: val
        })
    },
    // 分页--关注我的
    ChangePaginationByOther (val) {
        let {memberId} = this.state
        let formData = {}
        formData.memberId = parseInt(memberId)
        formData.page = val
        this.reqDataFnByOther(formData)
        this.setState({
            curPage: val
        })
    },
    render () {
        let {dataSource, curFollow, pageTotal, curPage} = this.state
        return (
            <div className='MyAgentPage' style={dataSource.length === 0 ? {height: '100%'} : {minHeight: 'calc(~"100% + 10px")'}}>
                <div className={dataSource.length === 0 ? 'content nullContent' : 'content'} style={dataSource.length === 0 ? {height: '100%', backgroundColor: '#fff'} : {minHeight: 'calc(~"100% + 10px")'}}>
                    <div className='til tilFollow' style={dataSource.length === 0 ? {borderBottom: '1px solid #e6f5ff'} : {}}>
                        <span className={curFollow === 'followByMy' ? 'follow active' : 'follow'}
                              onClick={() => this.onFollowClick('followByMy')}>
                            我关注的
                        </span>
                        <span className={curFollow === 'followByOther' ? 'follow active' : 'follow'}
                              onClick={() => this.onFollowClick('followByOther')}>
                            关注我的
                        </span>
                        <span className='add' onClick={() => this.itemClickFn('lookAgentPage')}>
                            <Icon type="plus" style={{fontSize: '20px', verticalAlign: 'middle', margin: '0 12px 0 16px'}}/>
                            添加经纪人
                        </span>
                    </div>
                    {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                    {dataSource.map((v, index) => {
                        return (
                            <div className='item' key={index}>
                                <CommonTpl itemData={v}/>
                                {
                                    curFollow === 'followByMy'
                                        ? <div className='operate'>
                                            <div className='onLine' onClick={() => this.onPleaceTui(v.memberId)}>请他推荐</div>
                                            <div className='noGood' onClick={() => this.onNoGood(v.memberId)}>
                                                <span className='yiGuanZhuPic'></span>
                                                取消
                                            </div>
                                        </div>
                                        : <div className='operate' style={{paddingTop: '34px'}}>
                                            <div className='onLine' onClick={() => this.onPleaceTui(v.memberId)}>请他推荐</div>
                                        </div>
                                }
                            </div>
                        )
                    })}
                    {dataSource.length === 0 ? null : curFollow === 'followByMy' ? <div className='my_pagination'>
                        <Pagination current={parseInt(curPage)} total={pageTotal} pageSize={20} size='large' onChange={this.ChangePaginationByMy}/>
                    </div> : <div className='my_pagination'>
                        <Pagination current={parseInt(curPage)} total={pageTotal} pageSize={20} size='large' onChange={this.ChangePaginationByOther}/>
                    </div>}
                </div>
            </div>
        )
    }
})

export default MyAgentPage
