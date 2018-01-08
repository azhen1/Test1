import React from 'react'
import {Pagination, message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import CommonTpl from './common/commonTpl'
let HandleWating = React.createClass({
    getInitialState () {
        return {}
    },
    // 发送邀请
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
    // 拒绝面试
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
    render () {
        let {dataSource, pageSizeTotal, curPagination} = this.props
        return (
            <div className={dataSource.length === 0 ? 'HandleWating nullContent' : 'HandleWating'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine' onClick={() => this.sendInvite(v.id)}>同意面试</div>
                                <div className='noGood' onClick={() => this.rejectSendInvite(v.id)}>拒绝面试</div>
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

export default HandleWating
