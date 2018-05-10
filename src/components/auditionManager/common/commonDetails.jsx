import React from 'react'
import '../auditionDetails.less'
import defaultHeadImg from '../../../images/default_head.png'

let commonDetails = React.createClass({
    getInitialState () {
        return {
            dataSource: this.props.dataSource
        }
    },
    componentWillReceiveProps () {
        this.setState({
            dataSource: this.props.dataSource
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
        if (location) {
            location = location.split('-')[1]
            return location
        } else {
            return false
        }
    },
    render () {
        let {dataSource} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='detailsMain'>
                <div className='icon_pic'><img src={this.hasLogoPic(dataSource.headUrl) ? defaultHeadImg : `${imgsURL}${dataSource.headUrl}`} alt="" /><i className={dataSource.gender === 1 ? 'female' : ''}></i></div>
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
                    <div>城市：{this.getCity(dataSource.location)}</div>
                    <div>手机：{this.phoneHide(dataSource.phone)}</div>
                    <div>自我描述：{dataSource.brief}</div>
                </div>
                <div className="hope">
                    <div className='til'>期望工作</div>
                    {this.hasProtopyFn('resumePositions') && dataSource.resumePositions.map((v, index) => {
                        return (
                            <div className='box'>
                                <div className='qiWangPay'>
                                    <span>期望职位：<i>{v.position}</i></span>
                                    <span>期望薪资：<i>{v.wages}</i></span>
                                </div>
                                <div>期望城市：{v.workCity}</div>
                                <div>求职类型：{v.jobType}</div>
                            </div>
                        )
                    })}
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
        )
    }
})

export default commonDetails
