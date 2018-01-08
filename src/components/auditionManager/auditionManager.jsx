import React from 'react'
import {Tabs, message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import './auditionManager.less'
import AlreadyEntry from './alreadyEntry'
import AlreadyView from './alreadyView'
import AuditionWating from './auditionWating'
import EntryWating from './entryWating'
import RecommendAll from './recommendAll'
import HandleWating from './handleWating'

const TabPane = Tabs.TabPane

let AuditionManager = React.createClass({
    getInitialState () {
        return {
            curTab: '1',
            dataSource: [],
            pageSizeTotal: 0,
            curPagination: 1,
            memberId: '',
            curHeight: ''
        }
    },
    onTabChange (val) {
        this.setState({
            curTab: val,
            curPagination: 1
        }, () => {
            let {curTab, curPagination} = this.state
            curTab = parseInt(curTab)
            if (curTab !== 6) {
                this.reqDataSouceFn(curPagination, curTab)
            } else {
                this.reqWaitEntryList()
            }
        })
    },
    // 待入职列表
    reqWaitEntryList () {
        let _th = this
        let {memberId} = _th.state
        let URL = '/job/platformInterview/companyWaitingEntry'
        let formData = {}
        formData.companyId = memberId
        getRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                let data = res.data
                let list = data.list
                _th.setState({
                    dataSource: [...list],
                    pageSizeTotal: data.total
                })
            } else {
                message.error(res.message)
            }
        })
    },
    componentDidMount () {
        let memberId = localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        }, () => {
            let {curTab, curPagination} = this.state
            curTab = parseInt(curTab)
            this.reqDataSouceFn(curPagination, curTab)
        })
    },
    // 分页切换
    paginationChange (val) {
        this.setState({
            curPagination: val
        }, () => {
            let {curTab, curPagination} = this.state
            curTab = parseInt(curTab)
            this.reqDataSouceFn(curPagination, curTab)
        })
    },
    // 待处理；待面试；已面试；已入职；全部推荐list查询
    reqDataSouceFn (curPagination, state) {
        let URL = '/job/platformInterview/interviewManager'
        let formData = {}
        let _th = this
        let {curTab, memberId} = _th.state
        formData.page = curPagination
        if (parseInt(curTab) !== 1000) {
            formData.state = state
        } else {
            formData.state = ''
        }
        formData.companyId = memberId
        getRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                let data = res.data
                let list = data.list
                _th.setState({
                    dataSource: [...list],
                    pageSizeTotal: data.total
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    render () {
        let {curTab, dataSource, pageSizeTotal, curPagination, memberId, curHeight} = this.state
        let propertyList = {dataSource: dataSource, reqDataSouce: this.reqDataSouceFn, pageSizeTotal: pageSizeTotal, paginationChange: this.paginationChange, curPagination: curPagination, curTab: curTab, memberId: memberId}
        return (
            <div className='auditionManager' style={dataSource.length === 0 ? {height: '100%'} : {minHeight: '100%'}}>
                <div className='content' style={dataSource.length === 0 ? {backgroundColor: '#fff', height: '100%'} : {height: 'auto'}}>
                    <div className='til'>
                        <Tabs defaultActiveKey={curTab} onChange={this.onTabChange}>
                            <TabPane tab="待处理" key="1"> </TabPane>
                            <TabPane tab="待面试" key="2"> </TabPane>
                            <TabPane tab="已面试(待处理)" key="4"> </TabPane>
                            <TabPane tab="待入职" key="6"> </TabPane>
                            <TabPane tab="已入职(考核3天)" key="7"> </TabPane>
                            <TabPane tab="全部推荐" key="1000"> </TabPane>
                        </Tabs>
                    </div>
                    {curTab === '1' ? <HandleWating {...propertyList}/> : null}
                    {curTab === '2' ? <AuditionWating {...propertyList}/> : null}
                    {curTab === '4' ? <AlreadyView {...propertyList}/> : null}
                    {curTab === '6' ? <EntryWating {...propertyList}/> : null}
                    {curTab === '7' ? <AlreadyEntry {...propertyList}/> : null}
                    {curTab === '1000' ? <RecommendAll {...propertyList}/> : null}
                </div>
            </div>
        )
    }
})

export default AuditionManager
