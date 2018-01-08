import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'
import util from '../../common/util'

let RecommendAll = React.createClass({
    getInitialState () {
        return {}
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    // 待处理---点击同意面试
    sendInvite (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/transformToWaitingInterview'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('发送邀请成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 待处理---点击拒绝面试
    rejectSendInvite (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/personRefuseInvitation'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('取消成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 待面试---点击完成面试
    finishInterview (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/finishInterview'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('发送邀请成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error(res.message)
            }
        })
    },
    // 已面试---点击发送入职邀请
    finishInterviewS (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/entryInvitation'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('发送邀请成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error(res.message)
            }
        })
    },
    // 已面试---点击不合适
    improper (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/improper'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('取消成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error(res.message)
            }
        })
    },
    // 待入职---点击已办理入职
    finishEntry (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/finishEntry'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('状态修改成功 !')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error(res.message)
            }
        })
    },
    // 已入职---点击已离职
    entryImproper (id) {
        let _th = this
        let {curPagination, curTab} = _th.props
        let URL = '/job/platformInterview/entryImproper'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('状态更新成功!')
                _th.props.reqDataSouce(curPagination, curTab)
            } else {
                message.error(res.message)
            }
        })
    },
    render () {
        let {dataSource, pageSizeTotal, curPagination} = this.props
        return (
            <div className={dataSource.length === 0 ? 'RecommendAll nullContent' : 'RecommendAll'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                {v.state === 1 ? <div>
                                    <div className='onLine' onClick={() => this.sendInvite(v.id)}>同意面试</div>
                                    <div className='noGood' onClick={() => this.rejectSendInvite(v.id)}>拒绝面试</div>
                                </div> : null}
                                {v.state === 2 ? <div>
                                    <div className='onLine' onClick={() => this.finishInterview(v.id)}>完成面试</div>
                                    <div className='noGood' onClick={() => this.itemClickFn(`chatWindow?id=${v.fromMemberId}&name=${v.hrName}&headUrl=${v.personHeadUrl}`)}>联系推荐人</div>
                                </div> : null}
                                {v.state === 4 ? <div>
                                    <div className='onLine' onClick={() => this.finishInterviewS(v.id)}>发送入职邀请</div>
                                    <div className='noGood' onClick={() => this.improper(v.id)}>不合适</div>
                                </div> : null}
                                {v.state === 6 || v.state === 5 ? <div>
                                    <div className='onLine' style={v.state === 5 ? {border: '0', color: '#25CCF6'} : {border: '0', color: '#999999'}}>
                                        {v.state === 5 ? '候选人已接受' : '待候选人接受'}
                                    </div>
                                    <div className='noGood' onClick={() => this.finishEntry(v.id)}>已办理入职</div>
                                </div> : null}
                                {v.state === 7 ? <div>
                                    <div className='onLine'>考核{util.timeDifference(v.entryTime)}天</div>
                                    <div className='noGood' onClick={() => this.entryImproper(v.id)}>已离职</div>
                                </div> : null}
                            </div>
                        </div>
                    )
                })}
                {
                    pageSizeTotal === 0
                    ? null
                    : <div className='my_pagination'>
                            <Pagination current={curPagination} total={pageSizeTotal} size='large' onChange={this.props.paginationChange}/>
                      </div>
                }
            </div>
        )
    }
})

export default RecommendAll
