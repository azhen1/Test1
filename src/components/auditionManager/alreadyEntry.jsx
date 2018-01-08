import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'
import util from '../../common/util'

let AlreadyEntry = React.createClass({
    getInitialState () {
        return {}
    },
    // 已离职
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
            <div className={dataSource.length === 0 ? 'AlreadyEntry nullContent' : 'AlreadyEntry'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.length > 0 && dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine'>考核{util.timeDifference(v.entryTime)}天</div>
                                <div className='noGood' onClick={() => this.entryImproper(v.id)}>已离职</div>
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

export default AlreadyEntry
