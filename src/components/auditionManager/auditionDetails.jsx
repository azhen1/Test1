import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import './auditionDetails.less'
import {message} from 'antd'

let AnditionDetails = React.createClass({
    getInitialState () {
        return {
            curId: 0,
            isAuto: false,
            dataSource: {}
        }
    },
    componentDidMount () {
        let _th = this
        let hash = window.location.hash
        let id = hash.split('?')[1].split('&')[0].split('=')[1]
        _th.setState({
            curId: id
        }, () => {
            _th.reqDataFn()
        })
    },
    reqDataFn () {
        let URL = '/member/resume/get'
        let formData = {}
        let _th = this
        let {curId} = _th.state
        formData.memberId = curId
        formData.type = 0
        getRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSource: {...data}
                }, () => {
                    _th.setState({
                        isAuto: _th.heightAgentDetails()
                    })
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error('系统错误!')
            }
        })
    },
    hasProtopyFn (type) {
        let {dataSource} = this.state
        let value = ''
        if (dataSource.hasOwnProperty(type)) {
            value = dataSource[type]
        }
        return value
    },
    heightAgentDetails () {
        let doc = document
        let [AuditionDetails] = doc.getElementsByClassName('AuditionDetails')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (AuditionDetails !== undefined && content !== undefined) {
            if (AuditionDetails.offsetHeight < content.offsetHeight) {
                result = true
            }
        }
        return result
    },
    goBack () {
        window.history.go(-1)
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    // 隐藏手机号
    phoneHide (tel) {
        if (tel !== '' && tel !== undefined && tel !== null) {
            let phoneStr = tel.substr(3, 4)
            let newPhone = tel.replace(phoneStr, '****')
            return newPhone
        } else {
            return ''
        }
    },
    render () {
        let {dataSource, isAuto} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AuditionDetails' style={isAuto ? {height: 'auto'} : {height: 'calc(100% + 10px)'}}>
                <div className='content'>
                    <a className='backBox' onClick={() => this.itemClickFn('auditionManager')}></a>
                    {dataSource.headUrl ? <img src={`${imgsURL}${dataSource.headUrl}`} alt="" className='icon_pic'/> : <img src='' alt="" className='icon_pic'/>}
                    <div className='basic'>
                        <div className='name'>
                            <span className='til'>{dataSource.name}</span>
                            <span className='trade'>
                                {dataSource.position ? dataSource.position : null}
                                {dataSource.position ? <span>|</span> : null }
                                {dataSource.trade ? dataSource.trade : null}
                                {dataSource.trade ? <span>|</span> : null }
                            </span>
                        </div>
                        <div className='info'>
                            <span className='basicInfoBox'>
                                {dataSource.educationText ? <span>{dataSource.educationText}</span> : null}
                                {dataSource.educationText ? <span className='shuXian'></span> : null}
                                {dataSource.workYearsText ? <span>{dataSource.workYearsText}</span> : null}
                                {dataSource.workYearsText ? <span className='shuXian'></span> : null}
                                {dataSource.age ? <span>{`${dataSource.age}岁`}</span> : null}
                                {dataSource.age ? <span className='shuXian'></span> : null}
                                {dataSource.lastestEntryTime ? <span>{dataSource.lastestEntryTime}</span> : null}
                                {dataSource.lastestEntryTime ? <span className='shuXian'></span> : null}
                            </span>
                            <span className='jobStates'>{dataSource.onJob === 1 ? '在职' : '离职'}</span>
                        </div>
                    </div>
                    <div className='mySelf'>
                        <div>城市：{dataSource.city}</div>
                        <div>手机：{this.phoneHide(dataSource.phone)}</div>
                        <div>自我描述：{dataSource.selfAssessment}</div>
                    </div>
                    <div className='hope'>
                        <div className='qiWangPay'>
                            <span>期望职位：<i>{dataSource.resumePositions ? dataSource.resumePositions.position : null}</i></span>
                            <span>期望薪资：<i>{dataSource.resumePositions ? dataSource.resumePositions.wages : null}</i></span>
                        </div>
                        <div>期望城市：{dataSource.resumePositions ? dataSource.resumePositions.workCity : null}</div>
                        <div>期望行业：{dataSource.resumePositions ? dataSource.resumePositions.position : null}</div>
                        <div>求职类型：{dataSource.resumePositions ? dataSource.resumePositions.jobType : null}</div>
                    </div>
                    <div className='jobJingLi'>
                        <div className='til'>工作经历</div>
                        {this.hasProtopyFn('workExperiences') && this.hasProtopyFn('workExperiences').map((v, index) => {
                            return (
                                <div key={index}>
                                    <div className='company'>
                                        <span className='name'>{v.company}</span>
                                        <span className='buMen'>{`${v.department}｜${v.position}｜${v.trade}`}</span>
                                        <span className='time'>{v.time ? v.time.replace(/-/g, '.').split(';').join(' - ') : null}</span>
                                    </div>
                                    <div className='jobNeiRong'>
                                        <div className='tille'>工作内容：</div>
                                        <div>{v.jobDescription}</div>
                                    </div>
                                    <div className='jobNeiRong'>
                                        <div className='tille'>个人荣誉：</div>
                                        <div>{v.honor}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='jiaoYuJing'>
                        <div className='title'>教育经历</div>
                        {
                            this.hasProtopyFn('educationExperiences') && this.hasProtopyFn('educationExperiences').map((v, index) => {
                                return (
                                    <div style={index === this.hasProtopyFn('educationExperiences').length - 1 ? {} : {marginBottom: '16px'}} key={index}>
                                        <span className='daXue'>{v.school}</span>
                                        <span>{`${v.major}｜${v.education}`}</span>
                                        <span className='date'>{v.time ? v.time.replace(/-/g, '.').split(';').join(' - ') : null}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='mySelfDes'>
                        <div className='title'>自我描述</div>
                        <span>{this.hasProtopyFn('selfAssessment')}</span>
                    </div>
                </div>
            </div>
        )
    }
})

export default AnditionDetails
