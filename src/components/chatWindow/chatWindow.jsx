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
            toObj: {},
            fromObj: {},
            topId: ''
        }
    },
    // friendListChangeFn (val) {
    //     this.setState({
    //         friendList: [...val]
    //     })
    // },
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
        let {memberId, toId, magList, friendList, toObj} = this.state
        let showWDuDom = Array.from(document.getElementsByClassName('showWDU'))
        // 先储存上一个人的聊天信息
        window.localStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        let unReadCache = window.localStorage.getItem(`UNREADCACHE_${memberId}`)
        // 清除未读信息标记
        showWDuDom.forEach((v, indexFor) => {
            if (parseInt(v.id.split('_')[2]) === parseInt(index)) {
                v.innerHTML = 0
                v.style.display = 'none'
            }
        })
        if (unReadCache !== null) {
            unReadCache = JSON.parse(unReadCache)
            unReadCache.forEach((vUnread, indexUnread) => {
                if (vUnread.toId === index) {
                    unReadCache.splice(indexUnread, 1)
                    window.localStorage.setItem(`UNREADCACHE_${memberId}`, JSON.stringify(unReadCache))
                }
            })
        }
        friendList.map((v, idx) => {
            if (v.toId === index) {
                toObj.toId = v.toId
                toObj.name = v.name
                toObj.headUrl = v.headUrl
            }
        })
        this.setState({
            toId: index,
            toObj: toObj
        }, () => {
            this.historyChatRecod()
        })
    },
    componentWillMount () {
        window.addEventListener('beforeunload', this.unloadFn, false)
    },
    // 监听页面刷新
    unloadFn () {
        let {memberId, toId, magList, friendList, topId} = this.state
        // 缓存好友列表和对话历史记录
        window.alert(friendList)
        window.localStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
        window.localStorage.setItem(`TOP_ID_${memberId}`, JSON.stringify(topId))
    },
    componentDidMount () {
        // this.props.reqFriendFn()
        let memberId = window.localStorage.getItem('memberId')
        let name = window.localStorage.getItem('companyName')
        let headUrl = window.localStorage.getItem('logoPic')
        let fromObj = {
            memberId: memberId,
            name: name,
            headUrl: headUrl
        }
        this.setState({
            fromObj: fromObj
        })
        let hash = window.location.hash
        // 取缓存的好友列表
        let {friendList} = this.state
        let copyFriendList = window.localStorage.getItem(`FRIENDLIST_LIST_ITEM_${memberId}`)
        let topId = JSON.parse(window.localStorage.getItem(`TOP_ID_${memberId}`))
        if (copyFriendList !== null && copyFriendList !== 'undefined' && copyFriendList.length > 0) {
            friendList = [...JSON.parse(copyFriendList)]
        }
        if (friendList.length > 0) {
            let idTo = friendList[0].toId
            let toObj = {}
            toObj.toId = idTo
            toObj.name = friendList[0].name
            toObj.headUrl = friendList[0].headUrl
            this.setState({
                toId: idTo,
                toObj: toObj,
                friendList: friendList,
                topId: topId
            })
        }
        // 是否添加好友
        if (hash.indexOf('id') !== -1) {
            let hashArr = decodeURI(hash).split('?')[1].split('&')
            let idTo = hashArr[0].split('=')[1]
            this.getInformationHR(idTo)
        }
        this.setState({
            Socket: window.Socket,
            memberId: memberId
        }, () => {
            this.historyChatRecod()
        })
        if (hash.indexOf('positionId') !== -1) {
            let hashArr = decodeURI(hash).split('?')[1].split('&')
            let positionId = hashArr[1].split('=')[1]
            this.getPositionDetails(positionId)
        }
    },
    // 获取一个HR的消息--头像
    getInformationHR (idTo) {
        let URL = '/member/platformMember/get'
        let _th = this
        let formData = {}
        formData.memberId = idTo
        getRequest(true, URL, formData).then((res) => {
            if (res.code === 0) {
                let memberId = window.localStorage.getItem('memberId')
                let copyFriendList = window.localStorage.getItem(`FRIENDLIST_LIST_ITEM_${memberId}`)
                let {friendList} = _th.state
                let topId = JSON.parse(window.localStorage.getItem(`TOP_ID_${memberId}`))
                if (copyFriendList !== null && copyFriendList !== 'undefined' && copyFriendList.length > 0) {
                    friendList = [...JSON.parse(copyFriendList)]
                }
                let data = res.data
                let name = data.nick
                let headUrl = data.headUrl
                let has = false
                friendList.forEach((v, index) => {
                    if (v.toId === idTo) {
                        v.name = name
                        v.headUrl = headUrl
                        has = true
                        return false
                    }
                })
                let target = {toId: idTo, name: name, headUrl: headUrl, date: new Date().getTime()}
                if (topId) {
                    !has && friendList.splice(1, 0, target)
                } else {
                    !has && friendList.unshift(target)
                }
                let toObj = {}
                toObj.toId = idTo
                toObj.name = name
                toObj.headUrl = headUrl
                window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
                _th.setState({
                    toId: idTo,
                    toObj: toObj,
                    friendList: friendList,
                    topId: topId
                }, () => {
                    _th.historyChatRecod()
                })
            } else {
                message.error(res.message)
            }
        })
    },
    // 获取职位详情
    getPositionDetails (id) {
        let URL = '/job/platformPosition/webGet'
        let formData = {}
        let _th = this
        formData.id = id
        getRequest(true, URL, formData).then((res) => {
            if (res.code === 0) {
                _th.sendPosition(res.data)
            } else {
                message.error(res.message)
            }
        })
    },
    // 生成职位消息msg 并发送一条消息
    sendPosition (data) {
        let positionMsg = {}
        let _th = this
        positionMsg.positionId = data.id
        positionMsg.companyName = data.companyName
        positionMsg.title = data.title
        positionMsg.position = data.title
        positionMsg.salary = data.salary
        positionMsg.address = data.workLocation.replace(/-/g, '') + data.workAddress
        _th.setState({
            msg: positionMsg
        }, () => {
            _th.onSendFn('5')
        })
    },
    // 取历史对话记录
    historyChatRecod () {
        let {memberId, toId, magList} = this.state
        if (toId !== '') {
            let cache = window.localStorage.getItem(`${memberId}_${toId}_MSG`)
            if (cache !== null) {
                magList = [...JSON.parse(cache)]
                this.setState({
                    magList: magList
                })
            } else {
                this.setState({
                    magList: []
                })
            }
        }
    },
    componentDidUpdate () {
        let showChatDom = document.getElementById('showChatId')
        if (showChatDom !== null) {
            let height = showChatDom.scrollHeight
            let top = height
            showChatDom.scrollTop = top
        }
    },
    // mtype发送的消息类型 0=文本 1= 图片 2=音频 3=视频 4=简历 5=职位 10=名片
    onSendFn (mtype, imgUrl) {
        let {Socket, memberId, toId, magList, msg, toObj, fromObj} = this.state
        let date = util.getDateTimeStr(new Date())
        let magNew = {}
        let has = true
        let msgtype = mtype
        if (msgtype === '1') {
            let filepath = imgUrl
            magNew = {id: 'web', from: memberId, to: toId, msg: msg, filepath: filepath, type: 'online', timestamp: date, identity: '1', msgtype: msgtype, fromname: fromObj.name, fromportrait: fromObj.headUrl, toname: toObj.name, toportrait: toObj.headUrl}
            // console.log(magNew)
            Socket.send(JSON.stringify(magNew))
            magList.push(magNew)
            this.setState({
                magList: magList
            }, () => {
                window.localStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
            })
        } else {
            if (msg !== '') {
                if (has) {
                    magNew = {id: 'web', from: memberId, to: toId, msg: msg, type: 'online', timestamp: date, identity: '1', msgtype: msgtype, fromname: fromObj.name, fromportrait: fromObj.headUrl, toname: toObj.name, toportrait: toObj.headUrl}
                    Socket.send(JSON.stringify(magNew))
                    magList.push(magNew)
                    this.setState({
                        magList: magList,
                        msg: ''
                    }, () => {
                        window.localStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
                    })
                } else {
                    this.setState({
                        msg: ''
                    })
                }
            }
        }
    },
    componentWillReceiveProps (nextProps) {
        let data = nextProps.historyChat
        let friendList = nextProps.friendList
        this.weiDuInfoCount2(data, friendList)
    },
    weiDuInfoCount2 (data, friendListProps) {
        let {toId} = this.state
        let fromId = data.from
        if (data.type === 'online') {
            // 发消息的好友ID !== 当前窗口好友ID
            if (fromId !== toId) {
                this.setState({
                    friendList: friendListProps
                })
            } else {
                this.historyChatRecod()
            }
        }
    },
    componentWillUnmount () {
        let {memberId, toId, magList, friendList, topId} = this.state
        window.removeEventListener('beforeunload', this.unloadFn, false)
        // 缓存好友列表和对话历史记录
        window.localStorage.setItem(`${memberId}_${toId}_MSG`, JSON.stringify(magList))
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
        window.localStorage.setItem(`TOP_ID_${memberId}`, JSON.stringify(topId))
    },
    // 置顶
    goTop (id, index) {
        let {friendList, memberId} = this.state
        let target = friendList.splice(index, 1)
        friendList.unshift(target[0])
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
        this.setState({
            friendList: friendList,
            topId: id
        })
    },
    // 删除
    deleteFriend (friendList, toId, topId) {
        let {memberId} = this.state
        window.localStorage.setItem(`FRIENDLIST_LIST_ITEM_${memberId}`, JSON.stringify(friendList))
        this.setState({
            friendList: friendList,
            toId: toId,
            topId: topId
        }, () => {
            this.historyChatRecod()
        })
    },
    render () {
        let {memberId, magList, msg, friendList, toId, topId} = this.state
        let propertyList = {toIdChangeFn: this.toIdChangeFn, onSendFn: this.onSendFn, sendPosition: this.sendPosition, msgChange: this.msgChange, memberId: memberId, magList: magList, msg: msg, toggleChat: this.toggleChat, friendList: friendList, goTop: this.goTop, deleteFriend: this.deleteFriend, toId: toId, topId: topId}
        return (
            <div className='ChatWindow'>
                <div className={friendList.length > 0 ? 'content' : 'content contentNull'}>
                    {friendList.length > 0 ? null : <div className='messageNulltext'>暂无消息</div>}
                    {friendList.length > 0 ? <FriendTabList {...propertyList}/> : null}
                    {friendList.length > 0 ? <RightWindow {...propertyList}/> : null}
                </div>
            </div>
        )
    }
})

export default ChatWindow
