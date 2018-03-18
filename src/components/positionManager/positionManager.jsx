import React from 'react'
import {Tabs, Icon, message} from 'antd'
import {Link} from 'react-router'
import {getRequest, postRequest} from '../../common/ajax'
import './positionManager.less'
import LookThrough from './lookThrough'
import Undercarriaged from './undercarriaged'
import RecruitIng from './recruitIng'

const TabPane = Tabs.TabPane

let PositionManager = React.createClass({
    getInitialState () {
        return {
            curTab: window.location.hash.indexOf('newSkip=true') === -1 ? '1' : '0',
            dataSouce: [],
            paginationTotal: 0,
            cruPagination: 1,
            pageSize: 10,
            memberId: ''
        }
    },
    onTabChange (val) {
        this.setState({
            curTab: val,
            dataSouce: [],
            pageSizeTotal: 0,
            cruPagination: 1
        }, () => {
            this.reqDataSouce()
        })
    },
    // 分页改变
    cruPaginationChange (val) {
        this.setState({
            cruPagination: val
        }, () => {
            this.reqDataSouce()
        })
    },
    componentDidMount () {
        this._isMounted = true
        let memberId = localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        })
        let hash = window.location.hash
        if (hash.indexOf('newSkip=true') !== -1) {
            this.onTabChange('0')
        } else {
            this.reqDataSouce()
        }
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    // 在招职位;审核中；已下架list查询
    reqDataSouce () {
        let URL = ''
        let _th = this
        let memberId = localStorage.getItem('memberId')
        let {curTab, cruPagination, pageSize} = _th.state
        curTab = parseInt(curTab)
        let formData = {}
        if (curTab === 0) {
            URL = 'job/platformPosition/queryByCheck'
        } else {
            URL = 'job/platformPosition/queryByPage'
            formData.state = curTab
        }
        formData.page = cruPagination
        formData.companyId = memberId
        formData.pageSize = pageSize
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let list = res.data.list
                if (_th._isMounted) {
                    _th.setState({
                        dataSouce: [...list],
                        paginationTotal: res.data.total
                    })
                }
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error('系统错误!')
            }
        })
    },
    onUnder (id) {
        let URL = 'job/platformPosition/delete'
        let _th = this
        let formData = {}
        formData.id = id
        formData._method = 'delete'
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('下架成功!')
                _th.reqDataSouce()
            } else {
                message.error('系统错误!')
            }
        })
    },
    onUp (id) {
        let URL = 'job/platformPosition/onSale'
        let _th = this
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('上架成功!')
                _th.reqDataSouce()
            } else {
                message.error('系统错误!')
            }
        })
    },
    onRefresh (id) {
        let URL = 'job/platformPosition/refresh'
        let _th = this
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('刷新成功!')
                _th.reqDataSouce()
            } else {
                message.error('系统错误!')
            }
        })
    },
    componentWillUnmount () {
        this._isMounted = false
    },
    render () {
        let {curTab, dataSouce, paginationTotal, cruPagination, pageSize} = this.state
        let prototyList = {dataSouce: dataSouce, paginationTotal: paginationTotal, cruPaginationChange: this.cruPaginationChange, onUnder: this.onUnder, onUp: this.onUp, onRefresh: this.onRefresh, cruPagination: cruPagination, pageSize: pageSize}
        return (
            <div className='PositionManager' style={dataSouce.length === 0 ? {height: '100%'} : {minHeight: 'calc(~"100% + 10px")'}}>
                <div className='til' style={dataSouce.length === 0 ? {backgroundColor: '#fff', height: '100%'} : {height: 'auto'}}>
                    <Tabs defaultActiveKey={curTab} onChange={this.onTabChange}>
                        <TabPane tab="在招职位" key="1"> </TabPane>
                        <TabPane tab="审核中" key="0"> </TabPane>
                        <TabPane tab="已下架" key="2"> </TabPane>
                    </Tabs>
                    <div className='addJob' onClick={() => this.itemClickFn('/positionManager/recruitIngEdit?type=new')}>
                        <Icon type="plus" style={{fontSize: '26px', verticalAlign: 'sub', marginRight: '9px'}}/>
                        <span style={{color: '#fff'}}>发布新职位</span>
                    </div>
                    {curTab === '1' ? <RecruitIng curTab={curTab} {...prototyList}/> : null}
                    {curTab === '0' ? <LookThrough curTab={curTab} {...prototyList}/> : null}
                    {curTab === '2' ? <Undercarriaged curTab={curTab} {...prototyList}/> : null}
                </div>
            </div>
        )
    }
})

export default PositionManager
