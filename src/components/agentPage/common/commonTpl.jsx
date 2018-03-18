import React from 'react'
import util from '../../../common/util'
import addressData from '../../../common/area'
import './commonTpl.less'
import defaultHeadImg from '../../../images/default_head.png'
import {getRequest} from '../../../common/ajax'
import {message} from 'antd/lib/index'

let CommonTpl = React.createClass({
    getInitialState () {
        return {
            educationList: []
        }
    },
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
                        res = vC.value
                        vC.children.map((vCC, indexCC) => {
                            if (vCC.id === itemData.district) {
                                res = res + '-' + vCC.value
                            }
                        })
                    }
                })
            }
        })
        return res
    },
    // 判断图片地址是否为空
    hasLogoPic (logoPic) {
        if (logoPic === undefined || logoPic === null || logoPic === '') {
            return true
        } else {
            return false
        }
    },
    render () {
        let {itemData} = this.props
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='tplClass' onClick={() => this.itemClickFn(`agentDetails?memberId=${itemData.memberId}`)}>
                <div className='imgBox'><img src={this.hasLogoPic(itemData.headUrl) ? defaultHeadImg : `${imgsURL}${itemData.headUrl}`} alt="" className='pic'/></div>
                <div className='tplCont'>
                    <div className='top'>
                        <div className='showPeople'>
                            <div className='jianJie'>
                                <span className='name'>{itemData.nick}</span>
                                <span>{this.qureyZoon(itemData)}</span>
                            </div>
                            <div className='basicInfo'>
                                {itemData.education ? <span>{itemData.education}</span> : null}
                                {itemData.education ? <span className='shuXian'></span> : null}
                                {itemData.trade ? <span>{itemData.trade}</span> : null}
                                {itemData.trade ? <span className='shuXian'></span> : null}
                                {itemData.level ? <span>{`Lv${itemData.level}`}</span> : null}
                                {itemData.level ? <span className='shuXian'></span> : null}
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
