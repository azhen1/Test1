import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import './auditionDetails.less'
import {message} from 'antd'

let AnditionDetails = React.createClass({
    getInitialState () {
        return {
            curId: 0,
            dataSouce: {}
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        let id = hash.split('?')[1].split('=')[1]
        this.setState({
            curId: 27
        }, () => {
            this.reqDataFn()
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
                    dataSouce: {...data}
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    hasProtopyFn (type) {
        let {dataSouce} = this.state
        let value = ''
        if (dataSouce.hasOwnProperty(type)) {
            value = dataSouce[type]
        }
        return value
    },
    heightAgentDetails () {
        let doc = document
        let [AnditionDetails] = doc.getElementsByClassName('AnditionDetails')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (AnditionDetails !== undefined && content !== undefined) {
            if (AnditionDetails.offsetHeight < content.offsetHeight) {
                result = true
            }
        }
        return result
    },
    render () {
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AnditionDetails' style={this.heightAgentDetails() ? {height: 'auto'} : {height: 'calc(100% + 10px)'}}>
                <div className='content'>
                    <img src={`${imgsURL}${this.hasProtopyFn('headUrl')}`} alt="" className='icon_pic'/>
                    <div className='basic'>
                        <div className='name'>
                            <span className='til'>{this.hasProtopyFn('name')}</span>
                            <span>{`${this.hasProtopyFn('position')}｜${this.hasProtopyFn('trade')}`}</span>
                        </div>
                        <div className='info'>
                            <span>{this.hasProtopyFn('education')}</span>
                            <span className='shuXian'></span>
                            <span>{`${this.hasProtopyFn('workYears')}年`}</span>
                            <span className='shuXian'></span>
                            <span>{`${this.hasProtopyFn('age')}岁`}</span>
                            <span className='shuXian'></span>
                            <span>{this.hasProtopyFn('lastestEntryTime')}</span>
                        </div>
                    </div>
                    <div className='mySelf'>
                        <div>城市：{this.hasProtopyFn('city')}</div>
                        <div>手机：{this.hasProtopyFn('phone')}</div>
                        <div>自我描述：{this.hasProtopyFn('selfAssessment')}</div>
                    </div>
                    <div className='hope'>
                        <div className='qiWangPay'>
                            <span>期望职位：<i>销售经理</i></span>
                            <span>期望薪资：<i>15k－25k</i></span>
                        </div>
                        <div>望城市：杭州</div>
                        <div>期望行业：医疗｜生活服务｜企业服务</div>
                        <div>求职类型：全职</div>
                    </div>
                    <div className='jobJingLi'>
                        <div className='til'>工作经历</div>
                        {this.hasProtopyFn('workExperiences') !== '' && this.hasProtopyFn('workExperiences').map((v, index) => {
                            return (
                                <div key={index}>
                                    <div className='company'>
                                        <span className='name'>{v.company}</span>
                                        <span className='buMen'>{`${v.department}｜${v.position}｜${v.trade}`}</span>
                                        <span className='time'>{v.time.split(';').join(' - ')}</span>
                                    </div>
                                    <div className='jobNeiRong'>
                                        <div className='tille'>工作内容：</div>
                                        <div>{v.jobDescription}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='jiaoYuJing'>
                        <div className='title'>教育经历</div>
                        {
                            this.hasProtopyFn('educationExperiences') !== '' && this.hasProtopyFn('educationExperiences').map((v, index) => {
                                return (
                                    <div style={index === this.hasProtopyFn('educationExperiences').length - 1 ? {} : {marginBottom: '16px'}} key={index}>
                                        <span className='daXue'>{v.school}</span>
                                        <span>{`${v.major}｜${v.education}`}</span>
                                        <span className='date'>{v.time.split(';').join(' - ')}</span>
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
