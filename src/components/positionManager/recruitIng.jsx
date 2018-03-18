import React from 'react'
import {Pagination} from 'antd'
import ListItemTpl from './common/listItemTpl'

let RecruitIng = React.createClass({
    getInitialState () {
        return {}
    },
    itemClickFn (e, router) {
        e.stopPropagation()
        window.location.hash = router
    },
    render () {
        let {curTab, dataSouce, paginationTotal, cruPagination, pageSize} = this.props
        return (
            <div className={dataSouce.length === 0 ? 'recruitIng nullContent' : 'recruitIng'}>
                {dataSouce.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSouce.map((v, index) => {
                    return (
                        <div key={index} >
                            <div className='listBox'>
                                <ListItemTpl listItemArr={v} curTab={curTab}/>
                                <div className='line'></div>
                                <div className='operate_right'>
                                    <div className='mianShi'>
                                        <i style={{backgroundColor: '#25CCF6'}}>面试</i>
                                        <span title={`${v.interviewBid}元`}>{`${v.interviewBid}元`}</span>
                                    </div>
                                    <div className='entry'>
                                        <i style={{backgroundColor: '#48D2A0'}}>入职</i>
                                        <span title={`${v.entryBid}元`}>{`${v.entryBid}元`}</span>
                                    </div>
                                    <div className='operate_items'>
                                        <span className='upDate' onClick={() => this.props.onRefresh(v.id)}>刷新</span>
                                        <span className='edit' onClick={(e) => this.itemClickFn(e, `/positionManager/recruitIngEdit?type=edit&id=${v.id}`)}>编辑</span>
                                        <span className='down' onClick={() => this.props.onUnder(v.id)}>下架</span>
                                    </div>
                                </div>
                            </div>
                            <div className='jianGe'></div>
                        </div>
                    )
                })}
                {
                    paginationTotal === 0
                        ? null
                        : <div className='my_pagination'>
                            <Pagination total={paginationTotal} onChange={this.props.cruPaginationChange} pageSize={pageSize} current={parseInt(cruPagination)}/>
                        </div>
                }
            </div>
        )
    }
})

export default RecruitIng
