import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'
import util from '../../common/util'

let AlreadyEntry = React.createClass({
    getInitialState () {
        return {
            checkDay: 0,
            isChecked: false
        }
    },
    componentDidMount () {
        this._isMounted = true
    },
    // 已离职
    entryImproper (v) {
        let _th = this
        let URL = '/job/platformInterview/entryImproper'
        let formData = {}
        formData.id = v.id
        if (util.timeDifference(v.entryTime) + 1 >= 4) {
            message.error('处理时间已过，已通过考核期')
            _th.setState({
                isChecked: true
            })
        } else {
            postRequest(true, URL, formData).then((res) => {
                let code = res.code
                if (code === 0) {
                    message.success('状态更新成功!')
                    _th.props.reqDataSouce()
                } else {
                    message.error(res.message)
                }
            })
        }
    },
    componentWillUnmount () {
        this._isMounted = false
    },
    render () {
        let {dataSource, pageSizeTotal, curPagination, pageSizePer} = this.props
        let {checkDay, isChecked} = this.state
        return (
            <div className={dataSource.length === 0 ? 'AlreadyEntry nullContent' : 'AlreadyEntry'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.length > 0 && dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                {util.timeDifference(v.entryTime) + 1 >= 4 ? null : <div className='onLine'>考核{util.timeDifference(v.entryTime) + 1}天</div>}
                                {util.timeDifference(v.entryTime) + 1 >= 4 || isChecked ? <div className='noGood unGood'>考核期已过</div> : <div className='noGood' onClick={() => this.entryImproper(v)}>已离职</div>}
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

export default AlreadyEntry
