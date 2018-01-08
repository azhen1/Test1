import React from 'react'
import './chatWindow.less'

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
    componentDidUpdate () {
        let {friendList} = this.props
        // 检测是否有未读信息，并做好未读标记
        let unReadCache = window.sessionStorage.getItem('UNREADCACHE')
        let showWDUDom = Array.from(document.getElementsByClassName('showWDU'))
        console.log(unReadCache, '/////')
        if (unReadCache !== null) {
            // 未读信息按照时间顺序排序
            let copyReadCache = JSON.parse(unReadCache)
            copyReadCache.sort(function (a, b) {
                return a.date - b.date
            })
            copyReadCache.forEach((v, index) => {
                friendList.forEach((vF, indexF) => {
                    if (v.toId === vF.toId) {
                        let target = friendList.splice(indexF, 1)
                        friendList.unshift(target[0])
                    }
                })
            })
            console.log(friendList, ';;;;;')
            this.props.friendListChangeFn(friendList)
            JSON.parse(unReadCache).forEach((vU, indexU) => {
                showWDUDom.forEach((vS, indexS) => {
                    let idS = vS.id.split('_')[2]
                    if (parseInt(vU.fromId) === parseInt(idS)) {
                        vS.innerHTML = vU.count
                        vS.style.display = 'inline-block'
                    }
                })
            })
        }
        window.sessionStorage.removeItem('UNREADCACHE')
    },
    render () {
        let {friendList} = this.props
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
                                    <img src={`${imgsURL}${v.headUrl}`} alt="" className='pic'/>
                                </span>
                                <span className='name' title={v.name}>
                                    {v.name}
                                </span>
                                <span className='zhiDing' onClick={() => this.props.goTop(index)}>置顶</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
})

export default FriendTabList
