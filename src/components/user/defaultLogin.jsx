import React from 'react'
import {Input, Button, message, Icon} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import './user.less'

const defaultLogin = React.createClass({
    getInitialState () {
        return {
            memberId: '',
            command: ''
        }
    },
    componentDidMount () {
        this._isMounted = true
        let hash = window.location.href
        let memberId = hash.split('?')[1].split('&')[0].split('=')[1]
        let command = hash.split('?')[1].split('&')[1]
        command = command ? command.split('=')[1] : ''
        this.setState({
            memberId: memberId,
            command: command
        }, () => {
            this.reqLogin()
        })
    },
    // 登录接口
    reqLogin () {
        let _th = this
        let {memberId, command} = _th.state
        let formData = {
            memberId: memberId,
            command: command
        }
        let URL = 'member/company/loginWithoutOtherthing'
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                let state = res.data.state
                let uuid = data.uuid
                window.localStorage.setItem('sessionUuid', uuid)
                if (state === 0) {
                    message.error('您的账号还未提交企业认证，请提交审核！')
                    window.location.hash = `certification?memberId=${data.memberId}`
                    return false
                } else if (state === 1) {
                    message.success('您的账号还在审核中，请耐心等待!')
                    return false
                } else if (state === 2) {
                    message.success('您的账号审核失败，请重新提交审核!')
                    window.location.hash = `certification?memberId=${data.memberId}`
                    return false
                } else if (state === 3) {
                    message.success('登录成功!')
                    let userName = data.userName
                    let companyName = data.name
                    let logoPic = data.logoPic
                    window.localStorage.setItem('sessionUuid', uuid)
                    window.localStorage.setItem('userName', userName)
                    window.localStorage.setItem('companyName', companyName)
                    window.localStorage.setItem('logoPic', logoPic)
                    window.localStorage.setItem('memberId', data.memberId)
                    _th.setState({
                        hasSubmit: false,
                        memberId: res.data.memberId,
                        companyName: res.data.name,
                        userName: res.data.userName,
                        userPosition: res.data.userPosition,
                        logoPic: res.data.logoPic
                    }, () => {
                        // let {memberId} = _th.state
                        // let hash = `memberId=${memberId}&companyName=${companyName}&userName=${userName}&userPosition=${userPosition}&logoPic=${logoPic}`
                        window.location.hash = `app`
                    })
                }
            } else {
                message.error(res.message)
            }
        })
    },
    componentWillUnmount () {
        this._isMounted = false
    },
    render () {
        return (
            <div className='login defaultLogin'>
                <p>正在登录中...</p>
            </div>
        )
    }
})

export default defaultLogin
