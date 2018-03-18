import React from 'react'
import {Tabs, message, Menu} from 'antd'
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
            pageSizePer: 10,
            memberId: '',
            curHeight: ''
        }
    },
    onTabChange (val) {
        sessionStorage.setItem('curTab', val)
        this.setState({
            curTab: val,
            dataSource: [],
            pageSizeTotal: 0,
            curPagination: 1
        }, () => {
            this.reqDataSouceFn()
        })
    },
    componentDidMount () {
        let memberId = localStorage.getItem('memberId')
        let curTab = sessionStorage.getItem('curTab') ? sessionStorage.getItem('curTab') : this.state.curTab
        this.setState({
            memberId: memberId,
            curTab: curTab
        }, () => {
            this.reqDataSouceFn()
        })
    },
    // 分页切换
    paginationChange (val) {
        this.setState({
            curPagination: val
        }, () => {
            this.reqDataSouceFn()
        })
    },
    // 待处理1；待面试2；已面试4；待入职6；已入职7；全部推荐list查询1000
    reqDataSouceFn () {
        let URL = '/job/platformInterview/interviewManager'
        let formData = {}
        let _th = this
        let {curTab, memberId, pageSizePer, curPagination} = _th.state
        formData.page = curPagination
        if (parseInt(curTab) === 2) {
            URL = '/job/platformInterview/companyWaitingInterview'
        } else if (parseInt(curTab) === 6) {
            URL = '/job/platformInterview/companyWaitingEntry'
        } else {
            if (parseInt(curTab) !== 1000) {
                formData.state = parseInt(curTab)
            } else {
                formData.state = ''
            }
        }
        formData.companyId = memberId
        formData.pageSize = pageSizePer
        getRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                console.log(res)
                let data = res.data
                let list = data.list
                _th.setState({
                    dataSource: [...list],
                    pageSizeTotal: data.total
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error(res.message)
            }
        })
    },
    render () {
        let {curTab, dataSource, pageSizeTotal, curPagination, memberId, curHeight, pageSizePer} = this.state
        let propertyList = {dataSource: dataSource, reqDataSouce: this.reqDataSouceFn, pageSizeTotal: pageSizeTotal, paginationChange: this.paginationChange, curPagination: curPagination, curTab: curTab, memberId: memberId, pageSizePer: pageSizePer}
        return (
            <div className='auditionManager' style={dataSource.length === 0 ? {height: '100%'} : {minHeight: 'calc(100% + 10px)'}}>
                <div className='content' style={dataSource.length === 0 ? {backgroundColor: '#fff', height: '100%'} : {height: 'auto'}}>
                    <div className='til'>
                        <Tabs defaultActiveKey={curTab} activeKey={curTab} onChange={this.onTabChange}>
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
