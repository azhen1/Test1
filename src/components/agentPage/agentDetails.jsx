import React from 'react'
import './agentDetails.less'
import defaultHeadImg from '../../images/default_head.png'
import {message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'

let shanChangList = ['销售', '淘宝职位', '美容美发']

let AgentDetails = React.createClass({
    getInitialState () {
        return {
            shanChangList: shanChangList,
            hrId: 0,
            recondsList: {},
            dataList: {}
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        let id = hash.split('?')[1].split('=')[1]
        let memberId = localStorage.getItem('memberId')
        this.setState({
            hrId: parseInt(id),
            memberId: memberId
        }, () => {
            this.reqDataFn()
            this.reqDataReconds()
        })
    },
    reqDataFn () {
        let URL = 'member/resume/get'
        let _th = this
        let {hrId, memberId} = _th.state
        let formData = {}
        formData.memberId = hrId
        formData.type = 1
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                console.log(res)
                _th.setState({
                    dataList: {...res.data}
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录!')
            } else {
                message.error(res.message)
            }
        })
    },
    // 成功推荐；成功面试；成功入职；成功率
    reqDataReconds () {
        let URL = 'member/platformMemberHr/getHrDate'
        let _th = this
        let {hrId} = _th.state
        let formData = {}
        formData.id = hrId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    recondsList: {...res.data}
                })
            } else if (code !== 401) {
                message.error(res.message)
            }
        })
    },
    // 判断属性有效性
    judgePrototyFn (list, pro) {
        return list.hasOwnProperty(pro) && !this.isNot(list[pro]) ? true : false
    },
    isNot (val) {
        return (val === null || val === '' || val === undefined)
    },
    goBack () {
        window.history.go(-1)
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
    // 判断图片地址是否为空
    hasLogoPic (logoPic) {
        if (logoPic === undefined || logoPic === null || logoPic === '') {
            return true
        } else {
            return false
        }
    },
    // 根据location中的第二个值获取城市名:浙江省-杭州市-江干区-
    getCity (location) {
        location = location.split('-')[1]
        return location
    },
    render () {
        let {recondsList, dataList} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='AgentDetails'>
                <div className='content'>
                    <a className='backBox' onClick={() => this.goBack()}></a>
                    <img src={this.hasLogoPic(dataList.headUrl) ? defaultHeadImg : `${imgsURL}${dataList.headUrl}`} alt="" className='icon_pic'/>
                    <div className='basic'>
                        <div>
                            <div className='name'>
                                <span className='til'>{this.judgePrototyFn(dataList, 'name') ? dataList.name : ''}</span>
                                <span>{this.judgePrototyFn(dataList, 'trade') ? dataList.trade : ''}</span>
                            </div>
                            <div className='info'>
                                {this.judgePrototyFn(dataList, 'educationText') ? <span>{dataList.educationText}</span> : null}
                                {this.judgePrototyFn(dataList, 'educationText') ? <span className='shuXian'></span> : null}
                                {this.judgePrototyFn(dataList, 'workYearsText') ? <span>{dataList.workYearsText}</span> : null}
                                {this.judgePrototyFn(dataList, 'workYearsText') ? <span className='shuXian'></span> : null}
                                {this.judgePrototyFn(dataList, 'age') ? <span>{`${dataList.age}岁`}</span> : null}
                                {this.judgePrototyFn(dataList, 'age') ? <span className='shuXian'></span> : null}
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
                        <div>{this.judgePrototyFn(dataList, 'location') ? `城市：${this.getCity(dataList.location)}` : `城市： `}</div>
                        <div>{this.phoneHide(dataList.phone) !== '' ? `手机：${this.phoneHide(dataList.phone)}` : `手机：`}</div>
                        <div>{this.judgePrototyFn(dataList, 'selfAssessment') ? `自我描述：${dataList.brief}` : `自我描述：`}</div>
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
                                <div key={index} className='companyBox'>
                                    <span className='time'>{v.time.split(';').join(' ~ ')}</span>
                                    <div className='company'>
                                        <span className='name'>{v.company}</span>
                                        {v.trade ? <span className='buMen'>{v.trade}</span> : null}
                                        {v.trade ? <span className='line'>|</span> : null}
                                        {v.department ? <span className='buMen'>{v.department}</span> : null}
                                        {v.department ? <span className='line'>|</span> : null}
                                        {v.position ? <span className='buMen'>{v.position}</span> : null}
                                        {v.position ? <span className='line'>|</span> : null}
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
                        }) : null}
                    </div>
                    <div className='jiaoYuJing'>
                        <div className='title'>教育经历</div>
                        {this.judgePrototyFn(dataList, 'educationExperiences') ? dataList.educationExperiences.map((v, index) => {
                            return (
                                <div style={index === dataList.educationExperiences.length - 1 ? {} : {marginBottom: '20px'}} key={index}>
                                    {dataList.educationExperiences.map((v, index) => {
                                        return <div key={index}>
                                            <span className='date'>{v.time.split(';').join(' ~ ')}</span>
                                            <span className='daXue'>{v.school}</span>
                                            {v.major ? <span className=''>{v.major}</span> : null}
                                            {v.major ? <span className='line'>|</span> : null}
                                            {v.education ? <span className=''>{v.education}</span> : null}
                                            {v.education ? <span className='line'>|</span> : null}
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
                        <span>{this.judgePrototyFn(dataList, 'brief') ? `${dataList.brief}` : ``}</span>
                    </div>
                </div>
            </div>
        )
    }
})

export default AgentDetails
