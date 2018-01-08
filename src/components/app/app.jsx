import React from 'react'
import $ from 'jquery'
import Header from '../layout/Header'
import ChatWindow from '../chatWindow/chatWindow'
import Information from '../information/information'
import Tab from '../layout/tab'
import './app.less'
import {postRequest} from '../../common/ajax'
import {message} from 'antd'

const App = React.createClass({
    getInitialState () {
        return {
            noHeaderList: ['#/Login', '#/Register'],
            count: 0
        }
    },
    // 判断当前页面是否是系统消息页面
    isInformationFn () {
        let hash = window.location.hash
        let result = false
        if (hash.indexOf('information') !== -1) {
            result = true
        } else {
            result = false
        }
        return result
    },
    // 判断当前页面是否是聊天窗口页面
    ischatWindowFn () {
        let hash = window.location.hash
        let result = false
        if (hash.indexOf('chatWindow') !== -1) {
            result = true
        } else {
            result = false
        }
        return result
    },
    componentWillMount () {
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/company/uuidCheck'
        let formData = {}
        if (sessionUuid === null) {
            window.location.hash = 'login'
        } else {
            formData.uuid = sessionUuid
            postRequest(false, URL, formData).then(function (res) {
                let code = res.code
                if (code !== 0) {
                    window.location.hash = 'login'
                    message.warning('登录超时，请重新登录!')
                }
            })
        }
        window.Socket = new WebSocket(`ws://192.168.0.125:8090/chat/websocket?token=${sessionUuid}`)
        window.Socket.onopen = function () {
            let data = {to: memberId, pageNo: 1, pageSize: 10}
            window.Socket.send(JSON.stringify(data))
        }
    },
    onInfoFn (data) {
        let weiDuHint = document.getElementsByClassName('weiDu_hint')[0]
        let hash = window.location.hash
        if (hash.indexOf('information') === -1) {
            weiDuHint.style.display = 'inline-block'
        }
        window.sessionStorage.setItem('WEIHINT_LIST', JSON.stringify(data.values))
        window.sessionStorage.setItem('WEIHINT_PAGIN_COUNT', data.count)
        this.setState({
            count: this.state.count++
        })
    },
    componentDidMount () {
        window.addEventListener('hashchange', this.scrollTopFn, false)
        this.setState({
            count: this.state.count++
        }, () => {
            this.scrollTopFn()
        })
    },
    componentWillUnmount () {
        window.removeEventListener('hashchange', this.scrollTopFn, false)
    },
    scrollTopFn () {
        $(document).scrollTop(0)
    },
    render () {
        let {noHeaderList, count} = this.state
        let currentHash = window.location.hash
        let isHeader = false
        noHeaderList.map((v, index) => {
            if (currentHash === v) {
                isHeader = true
            }
        })
        return (
            <div className="App_object">
                <ChatWindow type='init' onInfoFn={this.onInfoFn}/>
                <Header />
                <Tab />
                {this.isInformationFn() ? <Information count={count}/> : null}
                {this.ischatWindowFn() ? <ChatWindow count={count} onInfoFn={this.onInfoFn}/> : null}
                {this.ischatWindowFn() || this.isInformationFn() ? null : this.props.children}
            </div>
        )
    }
})
export default App
