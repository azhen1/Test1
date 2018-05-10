import React from 'react'
import $ from 'jquery'
import ShadowCode from '../layout/shadowCode'
import Header from '../layout/Header'
import ChatWindow from '../chatWindow/chatWindow'
import Information from '../information/information'
import BusinessInfo from '../businessInfo/businessInfo'
import Tab from '../layout/tab'
import './app.less'
import {getRequest, postRequest} from '../../common/ajax'
import {message} from 'antd'

const App = React.createClass({
    getInitialState () {
        return {
            noHeaderList: ['#/Login', '#/Register'],
            count: 0,
            memberId: '',
            socket: '',
            historyMessage: [],
            pageSize: 20,
            messageTotal: 0,
            historyChat: {},
            hasInfo: false,
            friendList: [],
            dataList: {},
            isSend: false,
            hasLogin: false
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
    // 判断当前页面是否是企业信息页面
    isBusinessInfoFn () {
        let hash = window.location.hash
        let result = false
        if (hash.indexOf('businessInfo') !== -1) {
            result = true
        } else {
            result = false
        }
        return result
    },
    componentWillMount () {
        let {pageSize} = this.state
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/company/uuidCheck'
        let formData = {}
        let _th = this
        if (sessionUuid === null) {
            window.location.hash = '/login'
        } else {
            formData.uuid = sessionUuid
            postRequest(false, URL, formData).then(function (res) {
                let code = res.code
                if (code !== 0) {
                    window.location.hash = '/login'
                    message.warning('登录超时，请重新登录!')
                    _th.setState({
                        hasLogin: false
                    })
                } else if (code === 0) {
                    _th.reqBusinssInfoAllInfo(memberId)
                    // 正式
                    window.Socket = new WebSocket(`ws://47.97.115.140:8090/chat/websocket?token=${sessionUuid}`)
                    // 测试
                    // window.Socket = new WebSocket(`ws://116.62.61.25:8090/chat/websocket?token=${sessionUuid}`)
                    let hash = window.location.hash
                    let data = {to: memberId, pageNo: 1, pageSize: pageSize}
                    window.Socket.onopen = function () {
                        if (hash.indexOf('information') !== -1) {
                            window.Socket.send(JSON.stringify(data))
                        }
                    }
                    window.Socket.onmessage = _th.onMessageFn
                    _th.setState({
                        hasLogin: true
                    })
                }
            })
        }
    },
    // 查询公司所有信息
    reqBusinssInfoAllInfo (memberId) {
        let URL = 'member/company/getView'
        let _th = this
        let formData = {}
        let {dataList} = this.state
        formData.memberId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let userName = res.data.userName
                let companyName = res.data.name
                let logoPic = res.data.logoPic
                window.localStorage.setItem('userName', userName)
                window.localStorage.setItem('companyName', companyName)
                window.localStorage.setItem('logoPic', logoPic)
                dataList.userName = userName
                dataList.companyName = companyName
                dataList.logoPic = logoPic
                _th.setState({
                    dataList: dataList
                })
            } else {
                message.error(res.message)
            }
        })
    },
    onMessageFn (res) {
        let _th = this
        let hash = window.location.hash
        let {memberId} = this.state
        // console.log('被动推送')
        // console.log(res)
        let data = JSON.parse(res.data)
        if (!data.hasOwnProperty('result')) {
            // 推动系统消息
            if (data.type === 'system') {
                if (hash.indexOf('information') === -1) {
                    this.onInfoFn(data)
                } else {
                    if (data.hasOwnProperty('values')) {
                        let messageList = data.values
                        _th.setState({
                            historyMessage: [...messageList],
                            messageTotal: data.count
                        })
                    } else {
                        console.log('在线发送过来一条消息 ')
                    }
                }
            } else {  // 推送聊天消息
                this.onChatFn(data)
            }
        }
    },
    onChatFn (data) {
        let hash = window.location.hash
        let {memberId} = this.state
        let _th = this
        if (data.type === 'offline') {
            let msgList = data.values
            msgList.forEach((v, index) => {
                let {friendList} = this.state
                let fromId = v.from
                let friendInfo = this.reqFriendFn(fromId)
                // 111----存储消息内容到好友会话
                let target = JSON.parse(window.localStorage.getItem(`${memberId}_${fromId}_MSG`))
                if (target !== null) {
                    target.push(v)
                    window.localStorage.setItem(`${memberId}_${fromId}_MSG`, JSON.stringify(target))
                } else {
                    window.localStorage.setItem(`${memberId}_${fromId}_MSG`, JSON.stringify([v]))
                }
                // 222----存储未读消息
                let unReadCache = window.localStorage.getItem(`UNREADCACHE_${memberId}`)
                let date = new Date().getTime()
                // 如果已有缓存的未读消息发送人列表
                if (unReadCache !== null) {
                    let has = false
                    let terIndex = 0
                    unReadCache = JSON.parse(unReadCache)
                    // 当前未读消息的发送人是否在已缓存未读消息的发送人列表中
                    unReadCache.forEach((vR, indexR) => {
                        if (fromId === vR.toId) {
                            has = true
                            terIndex = indexR
                        }
                    })
                    // 如果在
                    if (has) {
                        unReadCache[terIndex].count = ++unReadCache[terIndex].count
                    } else {
                        unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl})
                    }
                } else {
                    unReadCache = []
                    unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl})
                }
                window.localStorage.setItem(`UNREADCACHE_${memberId}`, JSON.stringify(unReadCache))
                // 333----判断发消息的好友在不在好友列表里
                let copyFriendList = window.localStorage.getItem(`FRIENDLIST_LIST_ITEM_${memberId}`)
                let topId = JSON.parse(window.localStorage.getItem(`TOP_ID_${memberId}`))
                let isInFriendList = false
                if (copyFriendList !== null) {
                    friendList = JSON.parse(copyFriendList)
                    friendList.forEach((vFrom, indexFrom) => {
                        if (vFrom.toId === fromId) {
                            vFrom.name = friendInfo.nick
                            vFrom.headUrl = friendInfo.headUrl
                            isInFriendList = true
                        }
                    })
                    if (!isInFriendList) {
                        let date = new Date().getTime()
                        let target = {toId: fromId, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl}
                        if (topId) {
                            friendList.splice(1, 0, target)   // 向数组中删除(第二个参数大于0)或添加(第二个参数为0)元素
                        } else {
                            friendList.unshift(target)   // 向数组头部添加元素
                        }
                        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
                    }
                } else {
                    friendList = []
                    let date = new Date().getTime()
                    let target = {toId: fromId, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl}
                    friendList.push(target)
                    window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
                }
            })
            // 设置头部未读消息数量
            let unReadCache = window.localStorage.getItem(`UNREADCACHE_${memberId}`)
            if (unReadCache !== null) {
                unReadCache = JSON.parse(unReadCache)
                let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
                let value = 0
                unReadCache.forEach((v, index) => {
                    value += v.count
                })
                weiDuInfo.innerHTML = value + ''
                weiDuInfo.style.display = 'inline-block'
            }
        } else {
            let {friendList} = this.state
            let fromId = data.from
            let friendInfo = this.reqFriendFn(fromId)
            // 111----存储消息内容到好友会话
            let target = window.localStorage.getItem(`${memberId}_${fromId}_MSG`)
            if (target !== null) {
                let friendMsg = JSON.parse(target)
                friendMsg.push(data)
                window.localStorage.setItem(`${memberId}_${fromId}_MSG`, JSON.stringify(friendMsg))
            } else {
                window.localStorage.setItem(`${memberId}_${fromId}_MSG`, JSON.stringify([data]))
            }
            // 222----存储未读消息
            let unReadCache = window.localStorage.getItem(`UNREADCACHE_${memberId}`)
            let date = new Date().getTime()
            // 如果已有缓存的未读消息发送人列表
            if (unReadCache !== null) {
                let has = false
                let terIndex = 0
                unReadCache = JSON.parse(unReadCache)
                // 当前未读消息的发送人是否在已缓存未读消息的发送人列表中
                unReadCache.forEach((vR, indexR) => {
                    if (fromId === vR.toId) {
                        has = true
                        terIndex = indexR
                    }
                })
                // 如果在
                if (has) {
                    unReadCache[terIndex].count = ++unReadCache[terIndex].count
                } else {
                    unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl})
                }
            } else {
                unReadCache = []
                unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl})
            }
            window.localStorage.setItem(`UNREADCACHE_${memberId}`, JSON.stringify(unReadCache))
            // 333----判断发消息的好友在不在好友列表里
            let copyFriendList = window.localStorage.getItem(`FRIENDLIST_LIST_ITEM_${memberId}`)
            let topId = JSON.parse(window.localStorage.getItem(`TOP_ID_${memberId}`))
            let isInFriendList = false
            if (copyFriendList !== null) {
                friendList = JSON.parse(copyFriendList)
                friendList.forEach((vFrom, indexFrom) => {
                    if (vFrom.toId === fromId) {
                        vFrom.name = friendInfo.nick
                        vFrom.headUrl = friendInfo.headUrl
                        isInFriendList = true
                    }
                })
                if (!isInFriendList) {
                    let date = new Date().getTime()
                    let target = {toId: fromId, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl}
                    if (topId) {
                        friendList.splice(1, 0, target)   // 向数组中删除(第二个参数大于0)或添加(第二个参数为0)元素
                    } else {
                        friendList.unshift(target)   // 向数组头部添加元素
                    }
                    window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
                }
            } else {
                friendList = []
                let date = new Date().getTime()
                let target = {toId: fromId, date: date, name: friendInfo.nick, headUrl: friendInfo.headUrl}
                friendList.push(target)
                window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
            }
            if (hash.indexOf('chatWindow') !== -1) {
                _th.setState({
                    friendList: friendList,
                    historyChat: data
                })
            } else {
                // 设置头部未读消息数量
                let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
                let value = 0
                unReadCache.forEach((v, index) => {
                    value += v.count
                })
                weiDuInfo.innerHTML = value + ''
                weiDuInfo.style.display = 'inline-block'
            }
        }
    },
    onInfoFn (data) {
        let infoWDNum = 0
        if (data.hasOwnProperty('values')) {
            infoWDNum += data.values.length
        } else {
            infoWDNum += 1
        }
        this.setWDNum(infoWDNum)
    },
    setWDNum (infoWDNum) {
        let hash = window.location.hash
        let weiDuHint = document.getElementsByClassName('weiDu_hint')[0]
        if (hash.indexOf('information') === -1) {
            weiDuHint.style.display = 'inline-block'
            weiDuHint.innerHTML = parseInt(weiDuHint.innerHTML) + infoWDNum
            if (weiDuHint.innerHTML === '0') {
                weiDuHint.style.display = 'none'
            } else {
                weiDuHint.style.display = 'inline-block'
            }
        }
    },
    reqFriendFn (id) {
        // 批量查询member信息
        let URL = 'member/platformMember/batchQueryMember'
        let uuid = window.localStorage.getItem('sessionUuid')
        let result = {}
        let formData = {}
        formData.memberIds = id
        $.ajax({
            type: 'GET',
            async: false,
            url: URL,
            data: formData,
            headers: {
                Authorization: uuid === null ? '' : `DingYi ${uuid}`
            },
            success: function (res) {
                if (res.code === 0) {
                    result = {...res.data[0]}
                }
            },
            error: function (err) {
                message.error(err)
            }
        })
        return result
    },
    componentDidMount () {
        window.addEventListener('hashchange', this.scrollTopFn, false)
        let memberId = window.localStorage.getItem('memberId')
        this.setState({
            count: ++this.state.count,
            memberId: memberId,
            isSend: false
        }, () => {
            this.scrollTopFn()
        })
        this.timerFn()
    },
    // 定时器
    timerFn () {
        let _th = this
        setInterval(function () {
            let hasChange = window.localStorage.getItem('hasChangeCompany')
            let memberId = window.localStorage.getItem('memberId')
            if (hasChange === 'true') {
                _th.reqBusinssInfoAllInfo(memberId)
                window.localStorage.setItem('hasChangeCompany', 'false')
            }
        }, 700)
    },
    componentWillUnmount () {
        window.removeEventListener('hashchange', this.scrollTopFn, false)
    },
    scrollTopFn () {
        $(document).scrollTop(0)
    },
    render () {
        let {noHeaderList, count, memberId, historyMessage, messageTotal, historyChat, friendList, dataList, isSend, hasLogin} = this.state
        let propertyList = {historyMessage: historyMessage, historyChat: historyChat, reqFriendFn: this.reqFriendFn, memberId: memberId, messageTotal: messageTotal, friendList: friendList, dataList: dataList, isSend: isSend}
        let currentHash = window.location.hash
        let isHeader = false
        noHeaderList.map((v, index) => {
            if (currentHash === v) {
                isHeader = true
            }
        })
        return (
            <div className="App_object">
                <ShadowCode></ShadowCode>
                {/* <ChatWindow type='init' onInfoFn={this.onInfoFn}/> */}
                <Header {...propertyList}/>
                <Tab />
                {this.isInformationFn() && hasLogin ? <Information {...propertyList}/> : null}
                {this.ischatWindowFn() && hasLogin ? <ChatWindow {...propertyList}/> : null}
                {/* {this.isBusinessInfoFn() ? <BusinessInfo {...propertyList}/> : null} */}
                {this.ischatWindowFn() || this.isInformationFn() ? null : this.props.children}
            </div>
        )
    }
})
export default App
