import React from 'react'
import {Input, Upload, message, Modal, Pagination} from 'antd'
const {TextArea} = Input
import defaultHeadImg from '../../images/default_head.png'
import {getRequest} from '../../common/ajax'
import addressData from '../../common/area'
import CommonDetails from '../auditionManager/common/commonDetails'
import CommonAgentDetails from '../agentPage/common/commonAgentDetails'

function beforeUpload (file) {
    const rightType = (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/gif')
    if (!rightType) {
        message.error('只能上传jpg/jpeg/png/gif格式的图片文件！')
    }
    return rightType
}
let RightWindow = React.createClass({
    getInitialState () {
        return {
            count: -1,
            logoPic: '',
            sendImg: [],
            positionList: [],
            positionTotal: 0,
            showPositionList: false,
            showImg: false,
            imgUrl: '',
            hrId: '',
            resumeData: {},
            resumeType: 0,
            showResume: false
        }
    },
    onSendClick () {
        this.props.onSendFn('0')
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    onKeyDownFn (e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.props.onSendFn('0')
        }
    },
    componentDidMount () {
        let logoPic = window.localStorage.getItem('logoPic')
        this.setState({
            logoPic: logoPic
        })
        this.getAllPositions()
    },
    audioPlay (v) {
        let audio = document.getElementById(`audio${v.from}`)
        // let unread = document.getElementById(`unread${v.from}`)
        audio.play()
        // unread.style.display = 'none'
    },
    getHeaders () {
        let uuid = window.localStorage.getItem('sessionUuid')
        return {
            Authorization: uuid === null ? '' : `DingYi ${uuid}`
        }
    },
    handleFinished ({fileList, file}) {
        this.setState({
            sendImg: fileList
        })
        if (file.status === 'done') {
            let result = ''
            if (file.hasOwnProperty('response') && file.response !== undefined) {
                result += `${file.response.data}`
            } else {
                result = ''
            }
            this.props.onSendFn('1', result)
            this.setState({
                sendImg: []
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
    // 显示职位列表
    showPositionFn () {
        let {showPositionList} = this.state
        this.setState({
            showPositionList: !showPositionList
        })
    },
    // 显示候选人简历 HR名片
    showResumeFn () {
        let {showResume, resumeData} = this.state
        this.setState({
            showResume: !showResume
        })
    },
    // 选中一个职位
    handlePosition (v) {
        let {showPositionList} = this.state
        let _th = this
        _th.setState({
            showPositionList: !showPositionList
        }, () => {
            _th.props.sendPosition(v)
        })
    },
    // 获取简历详情
    getResumeFn (id, type) {
        let {showResume, resumeData} = this.state
        let URL = 'member/resume/get'
        let _th = this
        let formData = {}
        formData.memberId = id
        formData.type = type
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                if (type === 1) {
                    _th.setState({
                        resumeData: {...res.data},
                        hrId: id,
                        resumeType: type,
                        showResume: !showResume
                    })
                } else {
                    _th.setState({
                        resumeData: {...res.data},
                        resumeType: type,
                        showResume: !showResume
                    })
                }
            } else {
                message.error(res.message)
            }
        })
    },
    // 获取职位列表
    getAllPositions () {
        let memberId = window.localStorage.getItem('memberId')
        let {pageSize} = this.state
        let URL = 'job/platformPosition/queryByPage'
        let _th = this
        let formData = {}
        formData.companyId = memberId
        formData.page = 1
        formData.state = 1
        formData.pageSize = pageSize
        let hasMemberId = memberId ? true : false
        if (hasMemberId) {
            getRequest(true, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    _th.setState({
                        positionList: [...res.data.list],
                        positionTotal: res.data.total
                    })
                } else if (code !== 401) {
                    message.error(res.message)
                }
            })
        }
    },
    filterCityFn (province, city) {
        let result = ''
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            addressData.forEach((v, index) => {
                if (v.id === province) {
                    result = v.value
                }
            })
        } else {
            addressData.forEach((v, index) => {
                if (v.id === province) {
                    v.children.forEach((vC, indexC) => {
                        if (vC.id === city) {
                            result = vC.value
                        }
                    })
                }
            })
        }
        return result
    },
    showBigImgFn (imgUrl) {
        this.setState({
            imgUrl: imgUrl,
            showImg: true
        })
    },
    handleCancelImg () {
        this.setState({
            showImg: false
        })
    },
    render () {
        let {logoPic, sendImg, showPositionList, positionList, positionTotal, showImg, imgUrl, showResume, resumeData, hrId, resumeType} = this.state
        let {magList, memberId, msg, friendList, toId} = this.props
        let inputStyle = {height: '100%', background: 'rgba(230,245,255,0.32)', border: '1px solid #E6F5FF'}
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        // 消息按时间排序然后显示
        magList.sort(function (a, b) {
            if (a.timestamp && b.timestamp) {
                let dateA = new Date((a.timestamp).replace(/-/g, '/')).getTime()
                let dateB = new Date((b.timestamp).replace(/-/g, '/')).getTime()
                return dateA - dateB
            }
        })
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
                        <div id='showChatContent'>
                            {magList.map((v, index) => {
                                if (v.from !== memberId) {
                                    let logoPicOther = ''
                                    friendList.map((vF, index) => {
                                        if (vF.toId === v.from) {
                                            logoPicOther = vF.headUrl
                                        }
                                    })
                                    if (v.msgtype === '0') { /* 文本消息 */
                                        return (
                                            <div className='from' key={index}>
                                                <img src={this.hasLogoPic(logoPicOther) ? defaultHeadImg : `${imgsURL}${logoPicOther}`} alt="" className='headerPic'/>
                                                <span className='message' style={{backgroundColor: '#fff'}}>
                                                    {v.msg}
                                                    <span className='date'>{v.timestamp}</span>
                                                </span>
                                            </div>
                                        )
                                    } else if (v.msgtype === '1') { /* 图片 */
                                        return (
                                            <div className='from fromImg' key={index}>
                                                <img src={this.hasLogoPic(logoPicOther) ? defaultHeadImg : `${imgsURL}${logoPicOther}`} alt="" className='headerPic'/>
                                                <span className='img'>
                                                     <img src={`${imgsURL}${v.filepath}`} alt="" onClick={() => this.showBigImgFn(`${imgsURL}${v.filepath}`)}/>
                                                    <span className='date'>{v.timestamp}</span>
                                                </span>
                                            </div>
                                        )
                                    } else if (v.msgtype === '2') { /* 音频 */
                                        return (
                                            <div className='from fromAudio' key={index}>
                                                <img src={this.hasLogoPic(logoPicOther) ? defaultHeadImg : `${imgsURL}${logoPicOther}`} alt="" className='headerPic'/>
                                                <span className='audio'>
                                                    <audio
                                                        id={`audio${v.from}`}
                                                        src={`${imgsURL}${v.filepath}`}>
                                                        您的浏览器不支持 audio 标签。
                                                    </audio>
                                                    <span className='audioElem' onClick={() => this.audioPlay(v)}><i></i>{v.msg}''</span>
                                                    {/* <span id={`unread${v.from}`} className='unread'></span> */}
                                                    <span className='date'>{v.timestamp}</span>
                                                </span>
                                            </div>
                                        )
                                    } else if (v.msgtype === '5') { /* 职位 */
                                        let msgObj = JSON.parse(v.msg)
                                        return (
                                            <div className='to positionTo' key={index}>
                                                <div className='positionDetailsMain'>
                                                    <div className="positionBox receive">
                                                        <div className='title'>{msgObj.title}</div>
                                                        {(msgObj.salary === null || msgObj.salary === '') ? null : <span className='salary'>{msgObj.salary}</span>}
                                                        <div className='basicInfo'>
                                                            {(msgObj.companyName === null || msgObj.companyName === '') ? null : <span className='details'>{msgObj.companyName}</span>}
                                                            {(msgObj.companyName === null || msgObj.companyName === '') ? null : <span className='shuXian'></span>}
                                                            {(msgObj.position === null || msgObj.position === '') ? null : <span className='details'>{msgObj.position}</span>}
                                                            {(msgObj.position === null || msgObj.position === '') ? null : <span className='shuXian'></span>}
                                                        </div>
                                                        {msgObj.address === '' ? <div className="address">null<i></i></div> : <div className="address">{msgObj.address}<i></i></div>}
                                                    </div>
                                                    <span className='date'>{v.timestamp}</span>
                                                </div>
                                            </div>
                                        )
                                    } else if (v.msgtype === '10') { /* 名片 */
                                        let msgObj = JSON.parse(v.msg)
                                        return (
                                            <div className='to positionTo' key={index}>
                                                <div className='positionDetailsMain'>
                                                    <div className="positionCard receive">
                                                        <img src={this.hasLogoPic(msgObj.headUrl) ? defaultHeadImg : `${imgsURL}${msgObj.headUrl}`} alt=""/>
                                                        <div className='fromName'>{msgObj.name}</div>
                                                        <div className='fromType'>{msgObj.level > 2 ? '金牌HR' : 'HR'}</div>
                                                        <div className="checkDetails" onClick={() => this.getResumeFn(`${msgObj.hrID}`, 1)}>查看名片</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    } else if (v.msgtype === '4') { /* 简历 */
                                        let msgObj = JSON.parse(v.msg)
                                        return (
                                            <div className='to positionTo' key={index}>
                                                <div className='positionDetailsMain'>
                                                    <div className="positionCard receive">
                                                        <img src={this.hasLogoPic(msgObj.headUrl) ? defaultHeadImg : `${imgsURL}${msgObj.headUrl}`} alt=""/>
                                                        <div className='fromName'>{msgObj.name}</div>
                                                        <div className='fromType'>{msgObj.position}</div>
                                                        <div className="checkDetails" onClick={() => this.getResumeFn(`${msgObj.memberId}`, 0)}>查看简历</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                } else {
                                    if (v.msgtype === '5') { /* 职位 */
                                        return (
                                            <div className='to positionTo' key={index}>
                                                <div className='positionDetailsMain'>
                                                    <div className="positionBox send">
                                                        <div className='title'>{v.msg.title}</div>
                                                        {(v.msg.salary === null || v.msg.salary === '') ? null : <span className='salary'>{v.msg.salary}</span>}
                                                        <div className='basicInfo'>
                                                            {(v.msg.companyName === null || v.msg.companyName === '') ? null : <span className='details'>{v.msg.companyName}</span>}
                                                            {(v.msg.companyName === null || v.msg.companyName === '') ? null : <span className='shuXian'></span>}
                                                            {(v.msg.position === null || v.msg.position === '') ? null : <span className='details'>{v.msg.position}</span>}
                                                            {(v.msg.position === null || v.msg.position === '') ? null : <span className='shuXian'></span>}
                                                        </div>
                                                        {v.msg.address === '' ? <div className="address">null<i></i></div> : <div className="address">{v.msg.address}<i></i></div>}
                                                    </div>
                                                    <span className='date'>{v.timestamp}</span>
                                                </div>
                                            </div>
                                        )
                                    } else if (v.msgtype === '0') { /* 文本消息 */
                                        return (
                                            <div className='to' key={index}>
                                                <span className='message'>
                                                    {v.msg}
                                                    <span className='date'>{v.timestamp}</span>
                                                </span>
                                                <img src={this.hasLogoPic(logoPic) ? defaultHeadImg : `${imgsURL}${logoPic}`} alt="" className='headerPic'/>
                                            </div>
                                        )
                                    } else if (v.msgtype === '1') { /* 图片 */
                                        return (
                                            <div className='to toImg' key={index}>
                                                <span className='img'>
                                                     <img src={`${imgsURL}${v.filepath}`} alt="" onClick={() => this.showBigImgFn(`${imgsURL}${v.filepath}`)}/>
                                                    <span className='date'>{v.timestamp}</span>
                                                </span>
                                                <img src={this.hasLogoPic(logoPic) ? defaultHeadImg : `${imgsURL}${logoPic}`} alt="" className='headerPic'/>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div></div>
                                        )
                                    }
                                }
                            })}
                        </div>
                    </div>
                    <Modal visible={showImg} footer={null} onCancel={this.handleCancelImg}>
                        <img alt="example" style={{width: '100%'}} src={imgUrl} />
                    </Modal>
                <div className='ipt_box'>
                    <TextArea placeholder=""
                              onKeyDown={this.onKeyDownFn}
                              value={msg}
                              onChange={this.props.msgChange}
                              style={inputStyle} id='idTextArea'/>
                    <div className='position' title='发送一个职位' onClick={this.showPositionFn}></div>
                    <div className='uploadImg' title='发送一张图片'>
                        <Upload
                            action="member/platformMember/upload"
                            listType="picture-card"
                            fileList={sendImg}
                            headers={this.getHeaders()}
                            beforeUpload={beforeUpload}
                            onChange={this.handleFinished}>
                            btn
                        </Upload>
                    </div>
                    <div className='expression'></div>
                    <div className='doSend' onClick={this.onSendClick}></div>
                </div>
                <Modal className='chatPositionModal'
                    title={`职位列表（${positionTotal}）`}
                    visible={showPositionList}
                    onCancel={this.showPositionFn}
                    footer={null}
                >
                    <div className='curJobItemCla'>
                        {positionList.map((v, index) => {
                            return (
                                <div className='oneItem' key={index} onClick={() => this.handlePosition(v)}>
                                    <div className='jibType'>
                                        {v.title}
                                    </div>
                                    <div className='info'>
                                        {this.filterCityFn(v.province, v.city) ? <span>{this.filterCityFn(v.province, v.city)}</span> : null}
                                        {this.filterCityFn(v.province, v.city) ? <span className='shuXian'></span> : null}
                                        {v.workExperience ? <span>{v.workExperience}</span> : null}
                                        {v.workExperience ? <span className='shuXian'></span> : null}
                                        {v.education ? <span>{v.education}</span> : null}
                                        {v.education ? <span className='shuXian'></span> : null}
                                        {v.positionNature ? <span>{v.positionNature}</span> : null}
                                        {v.positionNature ? <span className='shuXian'></span> : null}
                                        {v.salary ? <span>{v.salary}</span> : null}
                                        {v.salary ? <span className='shuXian'></span> : null}
                                    </div>
                                    <div className='result'>
                                        <span>{`${v.updateTime} 更新`}</span>
                                        <span>{`共收到 ${v.recommendNum ? v.recommendNum : 0} 个推荐`}</span>
                                        <span>{`已面试 ${v.recommendSuccess ? v.recommendSuccess : 0} 人`}</span>
                                        <span>{`待入职 ${v.waitEntryNum ? v.waitEntryNum : 0} 人`}</span>
                                        <span>{`已入职 ${v.entrySuccess ? v.entrySuccess : 0} 人`}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Modal>
                <Modal className='chatResumeModal' style={{width: '1200px'}}
                       visible={showResume}
                       onCancel={this.showResumeFn}
                       footer={null}
                >
                    {resumeType === 0 ? <div className='chatAuditionDetails'>
                        <CommonDetails dataSource={resumeData}></CommonDetails>
                    </div> : <div className="chatAgentDetails">
                        <CommonAgentDetails dataSource={resumeData} hrId={hrId}></CommonAgentDetails>
                    </div>}
                </Modal>
            </div>
        )
    }
})

export default RightWindow
