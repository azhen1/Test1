import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'

let AlreadyView = React.createClass({
    getInitialState () {
        return {}
    },
    // 发送入职邀请
    finishInterview (id) {
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
    // 不合适
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
    render () {
        let {dataSource, pageSizeTotal, curPagination} = this.props
        return (
            <div className={dataSource.length === 0 ? 'AlreadyView nullContent' : 'AlreadyView'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine' onClick={() => this.finishInterview(v.id)}>发送入职邀请</div>
                                <div className='noGood' onClick={() => this.improper(v.id)}>不合适</div>
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

export default AlreadyView
