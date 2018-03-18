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
            count: 0,
            memberId: '',
            socket: '',
            historyMessage: [],
            messageTotal: 0,
            historyChat: {},
            hasInfo: false,
            friendList: []
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
            window.location.hash = '/login'
        } else {
            formData.uuid = sessionUuid
            postRequest(false, URL, formData).then(function (res) {
                let code = res.code
                if (code !== 0) {
                    window.location.hash = '/login'
                    message.warning('登录超时，请重新登录!')
                }
            })
        }
        window.Socket = new WebSocket(`ws://116.62.61.25:8090/chat/websocket?token=${sessionUuid}`)
        let hash = window.location.hash
        let data = {to: memberId, pageNo: 1, pageSize: 10}
        window.Socket.onopen = function () {
            if (hash.indexOf('information') !== -1) {
                window.Socket.send(JSON.stringify(data))
            }
        }
        window.Socket.onmessage = this.onMessageFn
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
        } else if (data.hasOwnProperty('result')) {
            // let messageId = data.id
            // let toId = data.to
            // let msgList = window.localStorage.getItem(`${memberId}_${toId}_MSG`)
            // if (messageId !== null && toId !== null && msgList !== null) {
            //     msgList = JSON.parse(msgList)
            //     msgList.forEach((v, index) => {
            //         if (v.id === messageId) {
            //             if (data.result === 'SUCCESS') {
            //                 v.status = '1'
            //             } else {
            //                 v.status = '0'
            //             }
            //             return
            //         }
            //     })
            // }
            // return data
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
            let target = JSON.parse(window.localStorage.getItem(`${memberId}_${fromId}_MSG`))
            if (target !== null) {
                target.push(data)
                window.localStorage.setItem(`${memberId}_${fromId}_MSG`, JSON.stringify(target))
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
            memberId: memberId
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
        let {noHeaderList, count, memberId, historyMessage, messageTotal, historyChat, friendList} = this.state
        let propertyList = {historyMessage: historyMessage, historyChat: historyChat, reqFriendFn: this.reqFriendFn, memberId: memberId, messageTotal: messageTotal, friendList: friendList}
        let currentHash = window.location.hash
        let isHeader = false
        noHeaderList.map((v, index) => {
            if (currentHash === v) {
                isHeader = true
            }
        })
        return (
            <div className="App_object">
                {/* <ChatWindow type='init' onInfoFn={this.onInfoFn}/> */}
                <Header />
                <Tab />
                {this.isInformationFn() ? <Information {...propertyList}/> : null}
                {this.ischatWindowFn() ? <ChatWindow {...propertyList}/> : null}
                {this.ischatWindowFn() || this.isInformationFn() ? null : this.props.children}
            </div>
        )
    }
})
export default App
