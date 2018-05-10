import React from 'react'
import BusinessEdit from './businessEdit'
import BasicInfo from './basicInfo'
import {message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import './businessInfo.less'

let BusinessInfo = React.createClass({
    getInitialState () {
        return {
            businssInfoAllInfo: {},
            hasNew: false,
            count: 0,
            memberId: '',
            dataList: {}
        }
    },
    componentDidMount () {
        let memberId = window.localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        })
        this.reqBusinssInfoAllInfo(memberId)
    },
    // 查询公司所有信息
    reqBusinssInfoAllInfo (memberId) {
        let URL = 'member/company/getView'
        let _th = this
        let formData = {}
        formData.memberId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                if (data.mainBusiness === null && data.logoPic === null && data.companyCreatetime === null && data.trade === null) {
                    _th.setState({
                        hasNew: true,
                        businssInfoAllInfo: {...data}
                    })
                } else {
                    _th.setState({
                        hasNew: false,
                        businssInfoAllInfo: {...data}
                    })
                }
                // _th.setState({
                //     businssInfoAllInfo: {...data}
                // })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error(res.message)
            }
        })
    },
    countAddFn () {
        this.setState({
            count: ++this.state.count
        })
    },
    componentWillReceiveProps (nextProps) {
        // console.log('componentWillReceiveProps')
        let {dataList} = nextProps
        this.setState({
            dataList: dataList
        })
    },
    render () {
        let {businssInfoAllInfo, hasNew, memberId, dataList} = this.state
        let prototyList = {businssInfoAllInfo: businssInfoAllInfo, reqBusinssInfoAllInfo: this.reqBusinssInfoAllInfo, hasNew: hasNew, memberId: memberId, countAddFn: this.countAddFn}
        return (
            <div className='BusinessInfo'>
                <div className='content'>
                    <BusinessEdit {...prototyList}/>
                    <BasicInfo {...prototyList}/>
                </div>
            </div>
        )
    }
})

export default BusinessInfo
