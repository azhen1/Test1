import React from 'react'
import './Details.less'
import {message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import addressData from '../../common/area'

let itemArr = {position: '滨江上市公司招销售经理五险一金待遇好', place: '杭州', experience: '3-5年', educational: '本科', isFullTime: '全职', pay: '30000-50000元', upData: 1513082650000, total: 31, audition: 23, waiting: 7, entry: 8, mainShi: 30, entryPay: 500}

let PositionDetails = React.createClass({
    getInitialState () {
        return {
            itemArr: itemArr,
            dataSouce: {},
            isAuto: false
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        let id = hash.split('?')[1].split('=')[1]
        this.setState({
            curId: parseInt(id)
        }, () => {
            this.reqDataFn()
        })
    },
    reqDataFn () {
        let URL = 'job/platformPosition/webGet'
        let _th = this
        let {curId} = _th.state
        let formData = {}
        formData.id = curId
        getRequest(true, URL, formData).then(function (res) {
            console.log(res)
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSouce: {...data}
                }, () => {
                    _th.setState({
                        isAuto: _th.heightAgentDetails()
                    })
                })
            } else {
                message.error('系统错误!')
            }
        })
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
    heightAgentDetails () {
        let doc = document
        let [PositionDetails] = doc.getElementsByClassName('PositionDetails')
        let [content] = doc.getElementsByClassName('content')
        let result = false
        if (PositionDetails !== undefined && content !== undefined) {
            if (PositionDetails.offsetHeight < content.offsetHeight) {
                result = true
            }
        }
        return result
    },
    render () {
        let {dataSouce, isAuto} = this.state
        console.log(dataSouce)
        return (
            <div className='PositionDetails' style={isAuto ? {height: 'auto'} : {height: 'calc(100% + 10px)'}}>
                <div className='content'>
                    <div className='basicInfo'>
                        <div className='jobType'>
                            <span className='name'>
                                <div className='position'>{dataSouce.title}</div>
                                <div className='pay'>{dataSouce.salary}</div>
                            </span>
                            <span className='pay-count'>
                                <div><span>面试</span><i>{`${dataSouce.interviewBid}元`}</i></div>
                                <div><span style={{backgroundColor: '#48D2A0'}}>入职</span><i>{`${dataSouce.entryBid}元`}</i></div>
                            </span>
                        </div>
                        <div className='xueLi'>
                            {this.filterCityFn(dataSouce.province, dataSouce.city) ? <span>{this.filterCityFn(dataSouce.province, dataSouce.city)}</span> : null}
                            {this.filterCityFn(dataSouce.province, dataSouce.city) ? <span className='shuxian'></span> : null}
                            {dataSouce.workExperience ? <span>{dataSouce.workExperience}</span> : null}
                            {dataSouce.workExperience ? <span className='shuxian'></span> : null}
                            {dataSouce.education ? <span>{dataSouce.education}</span> : null}
                            {dataSouce.education ? <span className='shuxian'></span> : null}
                            {dataSouce.positionNature ? <span>{dataSouce.positionNature}</span> : null}
                            {dataSouce.positionNature ? <span className='shuxian'></span> : null}
                        </div>
                        <div className='zhiWei'>
                             职位：{dataSouce.type}
                        </div>
                        <div className='res'>
                            <span>{`${dataSouce.updateTime}更新`}</span>
                            <span>{`共收到${dataSouce.recommendNum}个推荐`}</span>
                            <span>{`已面试${dataSouce.recommendSuccess}人`}</span>
                            <span>{`待入职${dataSouce.waitEntryNum}人`}</span>
                            <span>{`已入职${dataSouce.entrySuccess}人`}</span>
                        </div>
                        <div className='fuLi'>
                            <label>福利：</label>
                            {dataSouce.welfare !== undefined && dataSouce.welfare.split(';').map((vFuLi, index) => {
                                return (
                                    <span key={index}>{vFuLi}</span>
                                )
                            })}
                        </div>
                    </div>
                    <div className='jobDes'>
                        <div className='til'>职位描述</div>
                        <pre className='desValue'>
                            {dataSouce.description}
                        </pre>
                        <div className='til'>工作时间</div>
                        <div className='desValue'>
                            <div>上午9：00 - 下午6：00</div>
                        </div>
                    </div>
                    <div className='companyPlace'>
                        <div className='til'>工作地点</div>
                        <div className='place'>
                            <span>{dataSouce.workLocation}</span>
                            <a href={`http://map.baidu.com/?latlng=${dataSouce.longitude},${dataSouce.latitude}`} target='_blank' className='lookDiTu'>查看地图</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default PositionDetails
