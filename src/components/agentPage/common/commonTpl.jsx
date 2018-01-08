import React from 'react'
import util from '../../../common/util'
import addressData from '../../../common/area'
import './commonTpl.less'

let CommonTpl = React.createClass({
    itemClickFn (router) {
        window.location.hash = router
    },
    // 查询城市
    qureyCity (itemData) {
        let res = ''
        addressData.map((v, index) => {
            if (v.id === itemData.province) {
                v.children.map((vC, indexC) => {
                    if (vC.id === itemData.city) {
                        res = vC.value
                    }
                })
            }
        })
        return res
    },
    // 查询市区
    qureyZoon (itemData) {
        let res = ''
        addressData.map((v, index) => {
            if (v.id === itemData.province) {
                v.children.map((vC, indexC) => {
                    if (vC.id === itemData.city) {
                        vC.children.map((vCC, indexCC) => {
                            if (vCC.id === itemData.district) {
                                res = vCC.value
                            }
                        })
                    }
                })
            }
        })
        return res
    },
    render () {
        let {itemData} = this.props
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='tplClass' onClick={() => this.itemClickFn(`agentDetails?memberId=${itemData.memberId}`)}>
                <img src={`${imgsURL}${itemData.headUrl}`} alt="" className='pic'/>
                <div className='tplCont'>
                    <div className='top'>
                        <div className='showPeople'>
                            <div className='jianJie'>
                                <span className='name'>{itemData.name}</span>
                                <span>{`${this.qureyCity(itemData)} - ${this.qureyZoon(itemData)}`}</span>
                            </div>
                            <div className='basicInfo'>
                                <span>{itemData.education}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.trade}</span>
                                <span className='shuXian'></span>
                                <span>{`Lv${itemData.level}`}</span>
                            </div>
                            <div className='radios'>
                                <span>
                                    <div className='cont'>{itemData.allRecodForMeNum}</div>
                                    <br/>
                                    <div className='type'>帮我推荐</div>
                                </span>
                                <span>
                                    <div className='cont'>{itemData.interviewForMeNum}</div>
                                    <br/>
                                    <div className='type'>已面试</div>
                                </span>
                                <span>
                                    <div className='cont'>{itemData.entryForMeNum}</div>
                                    <br/>
                                    <div className='type'>已入职</div>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='bottom'>
                        <span>{`加入平台${util.timeDifference(itemData.createTime)}天`}</span>
                        <span className='lianXi'>
                            {`成功推荐 ${itemData.successRecommendNum} 人面试`}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
})

export default CommonTpl
