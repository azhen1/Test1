import React from 'react'
import './chatWindow.less'
import defaultHeadImg from '../../images/default_head.png'

let FriendTabList = React.createClass({
    getInitialState () {
        return {
            activeItem: 0
        }
    },
    activeFriendItem (index) {
        this.setState({
            activeItem: index
        })
    },
    goTop (toId, index) {
        this.props.goTop(toId, index)
        this.activeFriendItem(0)
    },
    deleteFriend (e, id, index) {
        let {friendList, topId, toId} = this.props
        friendList.splice(index, 1)
        if (friendList.length > 0) {
            if (id === toId) {
                toId = friendList[0].toId
                this.activeFriendItem(0)
            }
        } else {
            toId = ''
        }
        if (id === topId) {
            topId = ''
        }
        this.props.deleteFriend(friendList, toId, topId)
        e.stopPropagation()
    },
    componentDidMount () {
        let {friendList, toId} = this.props
        friendList.forEach((v, index) => {
            if (v.toId === toId) {
                this.activeFriendItem(index)
            }
        })
    },
    componentWillReceiveProps (nextProps) {
        let {friendList, toId} = nextProps
        friendList.forEach((v, index) => {
            if (v.toId === toId) {
                this.activeFriendItem(index)
            }
        })
    },
    componentDidUpdate () {
        let memberId = window.localStorage.getItem('memberId')
        // 检测是否有未读信息，并做好未读标记
        let unReadCache = window.localStorage.getItem(`UNREADCACHE_${memberId}`)
        unReadCache = JSON.parse(unReadCache)
        let showWDUDom = Array.from(document.getElementsByClassName('showWDU'))
        if (unReadCache !== null) {
            unReadCache.forEach((vU, indexU) => {
                showWDUDom.forEach((vS, indexS) => {
                    let idS = vS.id.split('_')[2]
                    if (parseInt(vU.toId) === parseInt(idS)) {
                        vS.innerHTML = vU.count
                        vS.style.display = 'inline-block'
                    }
                })
            })
        }
    },
    // 判断图片地址是否为空
    hasLogoPic (logoPic) {
        if (logoPic === undefined || logoPic === null || logoPic === '') {
            return true
        } else {
            return false
        }
    },
    render () {
        let {friendList, toId, topId} = this.props
        let {activeItem} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='FriendTabList'>
                {friendList.map((v, index) => {
                    return (
                        <div className={activeItem === index ? 'friendItem friendItem_active' : 'friendItem'} key={index} onClick={() => this.props.toggleChat(v.toId)}>
                            <div className='zheZhao'></div>
                            <div className='box' onClick={() => this.activeFriendItem(index)}>
                                <span className='imgC_Box'>
                                    <span className='showWDU' id={`SHOW_WDU_${v.toId}`}>0</span>
                                    <img src={this.hasLogoPic(v.headUrl) ? defaultHeadImg : `${imgsURL}${v.headUrl}`} alt="" className='pic'/>
                                </span>
                                <span className='name' title={v.name}>
                                    {v.name}
                                </span>
                            </div>
                            <div className={topId === v.toId ? 'yiZhiDing' : 'weiZhiDing' }>
                                <div className='operation'>
                                    <div className='goZhiDing' onClick={() => this.goTop(v.toId, index)}>置顶</div>
                                    <div className='delete' onClick={(e) => this.deleteFriend(e, v.toId, index)}>删除</div>
                                </div>
                                <div className='fixedZhiDing'>已置顶</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
})

export default FriendTabList
