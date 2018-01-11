import React from 'react'
import './agentDetails.less'
import {message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'

let shanChangList = ['销售', '淘宝职位', '美容美发']

let AgentDetails = React.createClass({
    getInitialState () {
        return {
            shanChangList: shanChangList,
            curId: 0,
            recondsList: {},
            dataList: {}
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        let id = hash.split('?')[1].split('=')[1]
        let memberId = localStorage.getItem('memberId')
        this.setState({
            curId: parseInt(id),
            memberId: memberId
        }, () => {
            this.reqDataFn()
            this.reqDataReconds()
        })
    },
    reqDataFn () {
        let URL = 'member/resume/get'
        let _th = this
        let {curId, memberId} = _th.state
        let formData = {}
        formData.memberId = curId
        formData.type = 1
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    dataList: {...res.data}
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 成功推荐；成功面试；成功入职；成功率
    reqDataReconds () {
        let URL = 'member/platformMemberHr/getHrDate'
        let _th = this
        let {curId} = _th.state
        let formData = {}
        formData.id = curId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    recondsList: {...res.data}
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 判断属性有效性
    judgePrototyFn (list, pro) {
        return list.hasOwnProperty(pro) && list[pro] !== null ? true : false
    },
    heightAgentDetails () {
        let doc = document
        let [AgentDetails] = doc.getElementsByClassName('AgentDetails')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (AgentDetails !== undefined && content !== undefined) {
            if (AgentDetails.offsetHeight < content.offsetHeight) {
                result = true
            }
        }
        return result
    },
    render () {
        let {recondsList, dataList} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AgentDetails' style={this.heightAgentDetails() ? {height: 'auto'} : {height: 'calc(100% + 10px)'}}>
                <div className='content'>
                    <img src={this.judgePrototyFn(dataList, 'headUrl') ? `${imgsURL}${dataList.headUrl}` : ''} alt="" className='icon_pic'/>
                    <div className='basic'>
                        <div>
                            <div className='name'>
                                <span className='til'>{this.judgePrototyFn(dataList, 'name') ? dataList.name : ''}</span>
                                <span>{this.judgePrototyFn(dataList, 'trade') ? dataList.trade : ''}</span>
                            </div>
                            <div className='info'>
                                <span>{this.judgePrototyFn(dataList, 'educationText') ? dataList.educationText : ''}</span>
                                <span className='shuXian'></span>
                                <span>{this.judgePrototyFn(dataList, 'workYears') ? `${dataList.workYears}年` : ''}</span>
                                <span className='shuXian'></span>
                                <span>{this.judgePrototyFn(dataList, 'age') ? `${dataList.age}岁` : ''}</span>
                            </div>
                        </div>
                        <div className='total'>
                            <span className='sucess'>
                                <div className='cont'>{this.judgePrototyFn(recondsList, 'recommendSuccessNum') ? recondsList.recommendSuccessNum : ''}</div>
                                <div className='html'>成功推荐</div>
                            </span>
                            <span className='sucess'>
                                <div className='cont'>{this.judgePrototyFn(recondsList, 'recommendInterviewSuccessNum') ? recondsList.recommendInterviewSuccessNum : ''}</div>
                                <div className='html'>成功面试</div>
                            </span>
                            <span className='sucess'>
                                <div className='cont'>{this.judgePrototyFn(recondsList, 'recommendEntrySuccessNum') ? recondsList.recommendEntrySuccessNum : ''}</div>
                                <div className='html'>成功入职</div>
                            </span>
                            <span className='sucessLv'>
                                <div className='cont'>{this.judgePrototyFn(recondsList, 'recommendSuccessRatio') ? Math.ceil(Math.abs(recondsList.recommendSuccessRatio * 100)) : ''}%</div>
                                <div className='html'>成功率</div>
                            </span>
                        </div>
                    </div>
                    <div className='mySelf'>
                        <div>{this.judgePrototyFn(dataList, 'city') ? `城市：${dataList.city}` : `城市： `}</div>
                        <div>{this.judgePrototyFn(dataList, 'phone') ? `手机：${dataList.phone}` : `手机：`}</div>
                        <div>{this.judgePrototyFn(dataList, 'selfAssessment') ? `自我描述：${dataList.selfAssessment}` : `自我描述：`}</div>
                    </div>
                    <div className='hope'>
                        <div className='qiWangPay'>
                            <span className='tilte'>擅长职位：</span>
                            {this.judgePrototyFn(dataList, 'inPosition') ? dataList.inPosition.split('；').map((v, index) => {
                                if (v !== '') {
                                    return (
                                        <span key={index} className='item'>
                                        {v}
                                    </span>
                                    )
                                }
                            }) : null}
                        </div>
                    </div>
                    <div className='jobJingLi'>
                        <div className='til'>工作经历</div>
                        {this.judgePrototyFn(dataList, 'workExperiences') ? dataList.workExperiences.map((v, index) => {
                            return (
                                <div key={index}>
                                    <div className='company'>
                                        <span className='name'>{v.company}</span>
                                        <span className='buMen'>{v.trade}</span>
                                        <span className='time'>{v.time.split(';').join(' ~ ')}</span>
                                    </div>
                                    <div className='jobNeiRong'>
                                        <div className='tille'>工作内容：</div>
                                        <div>{v.labels}</div>
                                    </div>
                                </div>
                            )
                        }) : null}
                    </div>
                    <div className='jiaoYuJing'>
                        <div className='title'>教育经历</div>
                        {this.judgePrototyFn(dataList, 'educationExperiences') ? dataList.educationExperiences.map((v, index) => {
                            return (
                                <div style={index === dataList.educationExperiences.length - 1 ? {} : {marginBottom: '20px'}} key={index}>
                                    {dataList.educationExperiences.map((v, index) => {
                                        return <div key={index}>
                                            <span className='daXue'>{v.school}</span>
                                            <span>{v.education}</span>
                                            <span className='date'>{v.time.split(';').join(' ~ ')}</span>
                                        </div>
                                    })}
                                </div>
                            )
                        }) : null}
                    </div>
                    <div className='jiaoYuJing'>
                        <div className='title'>行业证书</div>
                        {this.judgePrototyFn(dataList, 'tradeCertificates') ? dataList.tradeCertificates.map((v, index) => {
                            return (
                                <div style={index === dataList.tradeCertificates.length - 1 ? {} : {marginBottom: '20px'}} key={index}>
                                    {dataList.tradeCertificates.map((v, index) => {
                                        return <div key={index}>
                                            <span className='daXue'>{v.name}</span>
                                            <span>{v.no}</span>
                                            <span className='date'>{v.validDate}</span>
                                        </div>
                                    })}
                                </div>
                            )
                        }) : null}
                    </div>
                    <div className='mySelfDes'>
                        <div className='title'>自我描述</div>
                        <span>{this.judgePrototyFn(dataList, 'selfAssessment') ? `${dataList.selfAssessment}` : ``}</span>
                    </div>
                </div>
            </div>
        )
    }
})

export default AgentDetails
