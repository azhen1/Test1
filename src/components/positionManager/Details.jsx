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
        let {dataSouce} = this.state
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
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    dataSouce: {...data}
                }, () => {
                    // var strContent = document.getElementById('desVal')
                    // strContent.innerHTML = data.description
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
    isNull (val) {
        return val === '' || val === null || val === undefined
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
    goBack () {
        window.history.go(-1)
    },
    render () {
        let {dataSouce, isAuto} = this.state
        return (
            <div className='PositionDetails' style={isAuto ? {height: 'auto'} : {height: 'calc(100% + 10px)'}}>
                <div className='content'>
                    <div className='backpageMain'>
                        <a className='backBox' onClick={() => this.goBack()}></a>
                    </div>
                    <div className='positionDetailsMain'>
                        <div className='basicInfo'>
                            <div className='jobType'>
                            <span className='name'>
                                <div className='position'>{dataSouce.title}</div>
                                <div className='pay'>{dataSouce.salary}</div>
                            </span>
                                {
                                    dataSouce.free === true ? <span className="pay-free">免费职位</span> : <span className='pay-count'>
                                <div><span>面试</span><i>{`${dataSouce.interviewBid}元`}</i></div>
                                <div><span style={{backgroundColor: '#48D2A0'}}>入职</span><i>{`${dataSouce.entryBid}元`}</i></div>
                            </span>
                                }
                            </div>
                            <div className='xueLi'>
                                {this.getCity(dataSouce.workLocation) ? <span>{this.getCity(dataSouce.workLocation)}</span> : null}
                                {this.getCity(dataSouce.workLocation) ? <span className='shuxian'></span> : null}
                                {dataSouce.workExperience ? <span>{dataSouce.workExperience}</span> : null}
                                {dataSouce.workExperience ? <span className='shuxian'></span> : null}
                                {dataSouce.education ? <span>{dataSouce.education}</span> : null}
                                {dataSouce.education ? <span className='shuxian'></span> : null}
                                {dataSouce.positionNature ? <span>{dataSouce.positionNature}</span> : null}
                                {dataSouce.positionNature ? <span className='shuxian'></span> : null}
                            </div>
                            <div className='zhiWei'>
                                <span className='zwBox'>职位：{dataSouce.type}</span>
                                <span className='zwBox'>要求：
                                    {this.isNull(dataSouce.number) ? <i>招0人</i> : <i>招{dataSouce.number}人</i>}<i>/</i>
                                    {this.isNull(dataSouce.age) ? <i>不限年龄</i> : <i>{dataSouce.age}岁</i>}
                            </span>
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
                            <pre className='desValue' id='desVal'>
                            {dataSouce.description}
                        </pre>
                        </div>
                        <div className='companyPlace'>
                            <div className='til'>工作地点</div>
                            <div className='place'>
                                <span>{dataSouce.workLocation}</span>
                                <a href={`http://api.map.baidu.com/marker?location=${dataSouce.latitude},${dataSouce.longitude}&title=公司位置&content=${dataSouce.companyName}&output=html&src=${dataSouce.companyName}`} target='_blank' className='lookDiTu'>查看地图</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default PositionDetails
