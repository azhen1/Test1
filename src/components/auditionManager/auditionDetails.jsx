import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import './auditionDetails.less'
import {message} from 'antd'
import CommonDetails from './common/commonDetails'

let AnditionDetails = React.createClass({
    getInitialState () {
        return {
            curId: 0,
            isAuto: false,
            dataSource: {}
        }
    },
    componentDidMount () {
        let _th = this
        let hash = window.location.hash
        let id = hash.split('?')[1].split('&')[0].split('=')[1]
        _th.setState({
            curId: id
        }, () => {
            _th.reqDataFn()
        })
    },
    reqDataFn () {
        let URL = '/member/resume/get'
        let formData = {}
        let _th = this
        let {curId} = _th.state
        formData.memberId = curId
        formData.type = 0
        getRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSource: {...data}
                }, () => {
                    _th.setState({
                        isAuto: _th.heightAgentDetails()
                    })
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error('系统错误!')
            }
        })
    },
    heightAgentDetails () {
        let doc = document
        let AuditionDetails = doc.getElementsByClassName('AuditionDetails')[0]
        let content = doc.getElementsByClassName('content')[0]
        let result = false
        if (AuditionDetails !== undefined && content !== undefined) {
            if (AuditionDetails.offsetHeight < content.offsetHeight) {
                result = true
            }
        }
        return result
    },
    goBack () {
        window.history.go(-1)
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    render () {
        let {dataSource, isAuto} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AuditionDetails'>
                <div className='content'>
                    <div className='backpageMain'>
                        <a className='backBox' onClick={() => this.itemClickFn('auditionManager')}></a>
                    </div>
                    <CommonDetails dataSource={dataSource}></CommonDetails>
                </div>
            </div>
        )
    }
})

export default AnditionDetails
