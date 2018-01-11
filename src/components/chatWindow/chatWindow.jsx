import React from 'react'
import './chatWindow.less'
import util from '../../common/util'
import FriendTabList from './friendTabList'
import {getRequest, postRequest} from '../../common/ajax'
import RightWindow from './rightWindow'
import {message} from 'antd'
import $ from 'jquery'

let ChatWindow = React.createClass({
    getInitialState () {
        return {
            msgByMy: '',
            Socket: '',
            toId: '',
            msg: '',
            memberId: '',
            magList: [],
            count: 0,
            friendList: [],
            toName: ''
        }
    },
    friendListChangeFn (val) {
        this.setState({
            friendList: [...val]
        })
    },
    msgChange (e) {
        let val = e.target.value
        this.setState({
            msg: val
        })
    },
    toIdChangeFn (val) {
        this.setState({
            toId: val
        })
    },
    toggleChat (index) {
        let {memberId, toId, magList} = this.state
        let showWDuDom = Array.from(document.getElementsByClassName('showWDU'))
        // 先储存上一个人的聊天信息
        window.sessionStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        // 清除未读信息标记
        showWDuDom.forEach((v, indexFor) => {
            if (parseInt(v.id.split('_')[2]) === parseInt(index)) {
                v.innerHTML = 0
                v.style.display = 'none'
            }
        })
        this.setState({
            toId: index
        }, () => {
            this.historyChatRecod()
        })
    },
    componentWillMount () {
        window.addEventListener('beforeunload', this.unloadFn, false)
        // window.localStorage.removeItem('FRIENDLIST_LIST_ITEM')
    },
    // 监听页面刷新
    unloadFn () {
        let {memberId, toId, magList, friendList} = this.state
        // 缓存好友列表和对话历史记录
        window.sessionStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM`, JSON.stringify(friendList))
    },
    componentDidMount () {
        // let sessionUuid = window.localStorage.getItem('sessionUuid')
        this.reqFriendFn()
        let memberId = window.localStorage.getItem('memberId')
        let hash = window.location.hash
        let {friendList} = this.state
        // 取缓存的对话好友列表
        let copyFriendList = window.localStorage.getItem('FRIENDLIST_LIST_ITEM')
        if (copyFriendList !== null && copyFriendList.length > 0) {
            friendList = [...JSON.parse(copyFriendList)]
            this.setState({
                friendList: friendList
            })
        }
        // 如果是新的好友，那就添加
        if (hash.indexOf('id') !== -1) {
            let hashArr = decodeURI(hash).split('?')[1].split('&')
            let idTo = hashArr[0].split('=')[1]
            let has = false
            friendList.forEach((v, index) => {
                if (v.toId === hashArr[0].split('=')[1]) {
                    has = true
                }
            })
            let target = {toId: hashArr[0].split('=')[1], name: hashArr[1].split('=')[1], headUrl: hashArr[2].split('=')[1], date: Date.parse(new Date())}
            !has && friendList.unshift(target)
            this.setState({
                toId: idTo,
                friendList: friendList
            })
        } else {
            if (friendList.length > 0) {
                let idTo = friendList[0].toId
                this.setState({
                    toId: idTo,
                    friendList: friendList
                })
            }
        }
        this.setState({
            Socket: window.Socket,
            memberId: memberId
        }, () => {
            this.historyChatRecod()
        })
        // 192.168.0.125; 47.97.115.140
        // let Socket = new WebSocket(`ws://192.168.0.125:8090/chat/websocket?token=${sessionUuid}`)
        // Socket.onopen = function () {
            // let dateOff = util.getDateTimeStr(new Date())
            // let data = {from: '', to: '32', msg: '', type: 'offline', timestamp: '', identity: '', filepath: ''}
            // Socket.send(JSON.stringify(data))
            // _th.setState({
                // Socket: Socket,
                // memberId: memberId
            // }, () => {
                // _th.historyChatRecod()
            // })
        // }
        window.Socket.onmessage = this.onMessageFn
    },
    // 取历史对话记录
    historyChatRecod () {
        let {memberId, toId, magList} = this.state
        let cache = window.sessionStorage.getItem(`${memberId}_${toId}_MSG`)
        if (cache !== null) {
            magList = [...JSON.parse(cache)]
            this.setState({
                magList: magList
            }, () => {
                let showChatDom = document.getElementById('showChatId')
                if (showChatDom !== null) {
                    showChatDom.scrollTop = showChatDom.scrollHeight
                    this.setState({
                        count: ++this.state.count
                    })
                }
            })
        } else {
            this.setState({
                magList: []
            })
        }
    },
    onSendFn () {
        let {Socket, memberId, toId, magList, msg} = this.state
        if (msg !== '') {
            let date = util.getDateTimeStr(new Date())
            let data = {id: `${toId} ${date}`, from: memberId, to: toId, msg: msg, type: 'online', timestamp: date, identity: '1', msgtype: '0'}
            Socket.send(JSON.stringify(data))
            magList.push(data)
            this.setState({
                magList: magList,
                msg: ''
            }, () => {
                let showChatDom = document.getElementById('showChatId')
                showChatDom.scrollTop = showChatDom.scrollHeight
                this.setState({
                    count: ++this.state.count
                })
            })
        }
    },
    onMessageFn (res) {
        let {memberId, toId} = this.state
        let {onInfoFn} = this.props
        let hash = window.location.hash
        let showWDuDom = Array.from(document.getElementsByClassName('showWDU'))
        console.log(res, '被动推送')
        let resultCopy = JSON.parse(res.data)
        if (resultCopy.hasOwnProperty('count') || !resultCopy.hasOwnProperty('result')) {
            let data = resultCopy
            if (data.hasOwnProperty('count') && data.hasOwnProperty('values')) {
                // 系统推送消息窗口设置
                this.props.onInfoFn(data)
            } else {
                // 消息窗口设置
                if (data.constructor === Array) {
                    data.forEach((v, index) => {
                        let target = JSON.parse(window.sessionStorage.getItem(`${memberId}_${v.from}_MSG`))
                        if (target !== null) {
                            target.push(v)
                            window.sessionStorage.setItem(`${memberId}_${v.from}_MSG`, JSON.stringify(target))
                        } else {
                            window.sessionStorage.setItem(`${memberId}_${v.from}_MSG`, JSON.stringify(v))
                        }
                        if (hash.indexOf('chatWindow') !== -1) {
                            this.weiDuInfoCount(showWDuDom, v, toId, 'online')
                        } else {
                            this.weiDuInfoCount(showWDuDom, data, toId, 'offline')
                        }
                    })
                } else {
                    let target = JSON.parse(window.sessionStorage.getItem(`${memberId}_${data.from}_MSG`))
                    if (target !== null) {
                        target.push(data)
                        window.sessionStorage.setItem(`${memberId}_${data.from}_MSG`, JSON.stringify(target))
                    } else {
                        window.sessionStorage.setItem(`${memberId}_${data.from}_MSG`, JSON.stringify([data]))
                    }
                    // 判断消息是否是当前联系人，如果不是，置为未读
                    if (hash.indexOf('chatWindow') !== -1) {
                        this.weiDuInfoCount(showWDuDom, data, toId, 'online')
                    } else {
                        this.weiDuInfoCount(showWDuDom, data, toId, 'offline')
                    }
                }
                if (hash.indexOf('chatWindow') !== -1) {
                    this.historyChatRecod()
                }
                if (hash.indexOf('chatWindow') === -1) {
                    let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
                    let value = parseInt(weiDuInfo.innerHTML)
                    value = ++value
                    weiDuInfo.innerHTML = value + ''
                    weiDuInfo.style.display = 'inline-block'
                }
            }
        }
    },
    //  查询用户信息
    reqFriendFn (id) {
        let URL = 'member/platformMember/batchQueryMember'
        let uuid = window.localStorage.getItem('sessionUuid')
        let result = {}
        let formData = {}
        formData.memberIds = 27
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
    // 判断未读信息数量与类型
    weiDuInfoCount (showWDuDom, data, toId, type) {
        let {friendList} = this.state
        if (type === 'online') {
            if (data.from !== toId) {
                let hasItem = false
                showWDuDom.forEach((v, index) => {
                    let id = v.id.split('_')[2]
                    if (data.from === id) {
                        let curHtml = v.innerHTML
                        hasItem = true
                        if (parseInt(curHtml) + 1 > 9) {
                            v.innerHTML = '...'
                        } else {
                            v.innerHTML = parseInt(curHtml) + 1
                        }
                        v.style.display = 'inline-block'
                    }
                })
                if (!hasItem) {
                    let friendInfo = this.reqFriendFn(data.from)
                    let date = Date.parse(new Date())
                    friendList.push({toId: data.from, count: 1, date: date, name: friendInfo.name, headUrl: friendInfo.headUrl})
                    this.setState({
                        friendList: friendList
                    }, () => {
                        let showWDuDomNew = Array.from(document.getElementsByClassName('showWDU'))
                        showWDuDomNew.forEach((v, index) => {
                            let id = v.id.split('_')[2]
                            if (data.from === id) {
                                let curHtml = v.innerHTML
                                hasItem = true
                                if (parseInt(curHtml) + 1 > 9) {
                                    v.innerHTML = '...'
                                } else {
                                    v.innerHTML = parseInt(curHtml) + 1
                                }
                                v.style.display = 'inline-block'
                            }
                        })
                    })
                }
            }
        } else {
            let fromId = data.from
            let friendInfo = this.reqFriendFn(fromId)
            let unReadCache = window.sessionStorage.getItem('UNREADCACHE')
            let date = Date.parse(new Date())
            if (unReadCache !== null) {
                let has = false
                let terIndex = 0
                unReadCache = JSON.parse(unReadCache)
                unReadCache.forEach((v, index) => {
                    if (fromId === v.fromId) {
                        has = true
                        terIndex = index
                    }
                })
                if (has) {
                    unReadCache[terIndex].count = ++unReadCache[terIndex].count
                } else {
                    unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.name, headUrl: friendInfo.headUrl})
                }
            } else {
                unReadCache = []
                unReadCache.push({toId: fromId, count: 1, date: date, name: friendInfo.name, headUrl: friendInfo.headUrl})
            }
            window.sessionStorage.setItem('UNREADCACHE', JSON.stringify(unReadCache))
        }
    },
    componentWillUnmount () {
        let {memberId, toId, magList, friendList} = this.state
        window.removeEventListener('beforeunload', this.unloadFn, false)
        // 缓存好友列表和对话历史记录
        window.sessionStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM`, JSON.stringify(friendList))
    },
    // 置顶
    goTop (index) {
        let {friendList} = this.state
        let target = friendList.splice(index, 1)
        friendList.unshift(target[0])
        this.setState({
            friendList: friendList
        })
    },
    render () {
        let {memberId, magList, msg, friendList, toId} = this.state
        let {type} = this.props
        let propertyList = {toIdChangeFn: this.toIdChangeFn, onSendFn: this.onSendFn, msgChange: this.msgChange, memberId: memberId, magList: magList, msg: msg, toggleChat: this.toggleChat, friendList: friendList, goTop: this.goTop, toId: toId, friendListChangeFn: this.friendListChangeFn}
        if (type !== 'init') {
            return (
                <div className='ChatWindow'>
                    <div className={friendList.length > 0 ? 'content' : 'content contentNull'}>
                        {friendList.length > 0 ? null : <div className='messageNulltext'>暂无消息</div>}
                        {friendList.length > 0 ? <FriendTabList {...propertyList}/> : null}
                        {friendList.length > 0 ? <RightWindow {...propertyList}/> : null}
                    </div>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
})

export default ChatWindow
