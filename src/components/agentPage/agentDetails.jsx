import React from 'react'
import './agentDetails.less'
import {message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import CommonDetails from './common/commonAgentDetails'

let AgentDetails = React.createClass({
    getInitialState () {
        return {
            hrId: '',
            dataList: {}
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        let id = hash.split('?')[1].split('=')[1]
        let memberId = localStorage.getItem('memberId')
        this.setState({
            hrId: parseInt(id),
            memberId: memberId
        }, () => {
            this.reqDataFn()
        })
    },
    reqDataFn () {
        let URL = 'member/resume/get'
        let _th = this
        let {hrId, memberId} = _th.state
        let formData = {}
        formData.memberId = hrId
        formData.type = 1
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    dataList: {...res.data}
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录!')
            } else {
                message.error(res.message)
            }
        })
    },
    isNot (val) {
        return (val === null || val === '' || val === undefined)
    },
    goBack () {
        window.history.go(-1)
    },
    render () {
        let {dataList, hrId} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AgentDetails'>
                <div className='content'>
                    <div className='backpageMain'>
                        <a className='backBox' onClick={() => this.goBack()}></a>
                    </div>
                    <CommonDetails dataSource={dataList} hrId={hrId}></CommonDetails>
                </div>
            </div>
        )
    }
})

export default AgentDetails
