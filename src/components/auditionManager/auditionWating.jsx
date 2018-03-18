import React from 'react'
import {Pagination, message} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'

let basicURl = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'

let AuditionWating = React.createClass({
    getInitialState () {
        return {}
    },
    // 完成面试
    finishInterview (id) {
        let _th = this
        let URL = '/job/platformInterview/finishInterview'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('面试已完成!')
                _th.props.reqDataSouce()
            } else {
                message.error(res.message)
            }
        })
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    render () {
        let {dataSource, pageSizeTotal, curPagination, pageSizePer} = this.props
        return (
            <div className={dataSource.length === 0 ? 'AuditionWating nullContent' : 'AuditionWating'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine' onClick={() => this.finishInterview(v.id)}>完成面试</div>
                                <div className='noGood' onClick={() => this.itemClickFn(`chatWindow?id=${v.fromMemberId}&name=${v.hrName}&headUrl=${v.personHeadUrl}&positionId=${v.positionId}`)}>联系推荐人</div>
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

export default AuditionWating
