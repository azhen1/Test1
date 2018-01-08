import React from 'react'
import {Input} from 'antd'
const {TextArea} = Input

let RightWindow = React.createClass({
    getInitialState () {
        return {
            count: -1,
            logoPic: ''
        }
    },
    onSendClick () {
        this.props.onSendFn()
    },
    onKeyDownFn (e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.props.onSendFn()
        }
    },
    widthFn () {
        let [iptBox] = document.getElementsByClassName('ipt_box')
        let width = ''
        if (iptBox !== undefined) {
            width = iptBox.offsetHeight * 0.275 + 'px'
        }
        return width
    },
    componentDidMount () {
        let logoPic = window.localStorage.getItem('logoPic')
        this.setState({
            logoPic: logoPic
        })
    },
    render () {
        let {logoPic} = this.state
        let {magList, memberId, msg, friendList, toId} = this.props
        let inputStyle = {height: '100%', background: 'rgba(230,245,255,0.32)', border: '1px solid #E6F5FF'}
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='RightWindow'>
                <div className='showHeader'>
                    {friendList.map((v, index) => {
                        if (v.toId === toId) {
                            return v.name
                        }
                    })}
                </div>
                <div className='showChat' id='showChatId'>
                    {magList.map((v, index) => {
                        if (v.from !== memberId) {
                            let logoPicOther = ''
                            friendList.map((vF, index) => {
                                if (vF.toId === v.from) {
                                    logoPicOther = vF.headUrl
                                }
                            })
                            return (
                                <div className='from' key={index}>
                                    <img src={`${imgsURL}${logoPicOther}`} alt="" className='headerPic'/>
                                    <span className='message' style={{backgroundColor: '#fff'}}>
                                        {v.msg}
                                        <span className='date'>{v.timestamp}</span>
                                    </span>
                                </div>
                            )
                        } else {
                            return (
                                <div className='to' key={index}>
                                    <span className='message'>
                                        {v.msg}
                                        <span className='date'>{v.timestamp}</span>
                                    </span>
                                    <img src={`${imgsURL}${logoPic}`} alt="" className='headerPic'/>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className='ipt_box'>
                    <TextArea placeholder=""
                              onKeyDown={this.onKeyDownFn}
                              value={msg}
                              onChange={this.props.msgChange}
                              style={inputStyle} id='idTextArea'/>
                    <div className='expression' style={{width: this.widthFn()}}></div>
                    <div className='doSend' onClick={this.onSendClick} style={{width: this.widthFn()}}></div>
                </div>
            </div>
        )
    }
})

export default RightWindow
