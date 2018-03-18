import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'

let EntryWating = React.createClass({
    getInitialState () {
        return {}
    },
    // 已办理入职
    finishEntry (id) {
        let _th = this
        let URL = '/job/platformInterview/finishEntry'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('状态修改成功!')
                _th.props.reqDataSouce()
            } else {
                message.error(res.message)
            }
        })
    },
    render () {
        let {dataSource, pageSizeTotal, curPagination, pageSizePer, curTab} = this.props
        return (
            <div className={dataSource.length === 0 ? 'EntryWating nullContent' : 'EntryWating'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.length > 0 && dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine onLineEW' style={v.state === 5 ? {color: '#25CCF6'} : {color: '#999999'}}>
                                    {v.state === 6 ? '待候选人接受' : '候选人已接受'}
                                </div>
                                <div className='noGood' onClick={() => this.finishEntry(v.id)}>已办理入职</div>
                            </div>
                        </div>
                    )
                })}
                {
                    pageSizeTotal === 0
                        ? null
                        : <div className='my_pagination'>
                            <Pagination current={curPagination} total={pageSizeTotal} pageSize={pageSizePer} size='large' onChange={this.props.paginationChange}/>
                        </div>
                }
            </div>
        )
    }
})

export default EntryWating
