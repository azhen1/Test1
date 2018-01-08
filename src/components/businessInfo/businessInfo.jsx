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
            count: 0
        }
    },
    componentDidMount () {
        this.reqBusinssInfoAllInfo()
    },
    // 查询公司所有信息
    reqBusinssInfoAllInfo () {
        let URL = 'member/company/getView'
        let _th = this
        let formData = {}
        formData.memberId = '5'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                if (data.mainBusiness === null && data.logoPic === null && data.companyCreatetime === null && data.trade === null) {
                    _th.setState({
                        hasNew: true
                    })
                } else {
                    _th.setState({
                        hasNew: false
                    })
                }
                _th.setState({
                    businssInfoAllInfo: {...data}
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    widthBalanceManager () {
        let doc = document
        let [BusinessInfo] = doc.getElementsByClassName('BusinessInfo')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (content !== undefined && BusinessInfo !== undefined) {
            if (content.offsetHeight > BusinessInfo.offsetHeight) {
                result = true
            }
        }
        return result
    },
    countAddFn () {
        this.setState({
            count: ++this.state.count
        })
    },
    render () {
        let {businssInfoAllInfo, hasNew} = this.state
        let prototyList = {businssInfoAllInfo: businssInfoAllInfo, reqBusinssInfoAllInfo: this.reqBusinssInfoAllInfo, hasNew: hasNew, countAddFn: this.countAddFn}
        return (
            <div className='BusinessInfo' style={this.widthBalanceManager() ? {height: 'auto', paddingBottom: '10px'} : {height: '100%'}}>
                <div className='content'>
                    <BusinessEdit {...prototyList}/>
                    <BasicInfo {...prototyList}/>
                </div>
            </div>
        )
    }
})

export default BusinessInfo
