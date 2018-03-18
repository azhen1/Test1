import React from 'react'
import addressData from '../../../common/area'
import './commonTpl.less'

let CommonTpl = React.createClass({
    itemClickFn (router) {
        window.location.hash = router
    },
    cityTextFn (province, city) {
        let result = ''
        if (province === '110100' || province === '120100' || province === '310100' || province === '500000') {
            addressData.map((v, index) => {
                if (v.id === province) {
                    result = v.value
                }
            })
        } else {
            addressData.map((v, index) => {
                if (v.id === province) {
                    v.children.map((vC, index) => {
                        if (vC.id === city) {
                            result = vC.value
                        }
                    })
                }
            })
        }
        return result
    },
    render () {
        let {itemData} = this.props
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='tplClass'>
                <div className='imgBox'><img src={`${imgsURL}${itemData.personHeadUrl}`} alt="" className='pic'/></div>
                <div className='tplCont'>
                    <div className='top'>
                        <div className='showPeople'>
                            <div className='jianJie'>
                                <span className='name'>{itemData.personName}</span>
                                <span className='trade' title={`${itemData.personPosition} ${itemData.personTrade}`}>
                                    {itemData.personPosition ? itemData.personPosition : null}
                                    {itemData.personPosition ? <span>|</span> : null }
                                    {itemData.personTrade ? itemData.personTrade : null}
                                    {itemData.personTrade ? <span>|</span> : null }
                                </span>
                            </div>
                            <div className='basicInfo'>
                                <span className='basicInfoBox'>
                                    {itemData.personEducation ? <span>{itemData.personEducation}</span> : null}
                                    {itemData.personEducation ? <span className='shuXian'></span> : null}
                                    {itemData.personWorkYears ? <span>{itemData.personWorkYears}</span> : null}
                                    {itemData.personWorkYears ? <span className='shuXian'></span> : null}
                                    {itemData.personAge ? <span>{`${itemData.personAge}岁`}</span> : null}
                                    {itemData.personAge ? <span className='shuXian'></span> : null}
                                    {itemData.lastestEntryTime ? <span>{itemData.lastestEntryTime}</span> : null}
                                    {itemData.lastestEntryTime ? <span className='shuXian'></span> : null}
                                </span>
                                <span className='jobStates'>{itemData.personOnJob === 1 ? '在职' : '离职'}</span>
                            </div>
                        </div>
                        <div className='line'></div>
                        <div className='place'>
                            <div className='placeTil'>
                                {itemData.positionTitle}
                            </div>
                            <div className='basicInfo'>
                                    {this.cityTextFn(itemData.positionProvince, itemData.positionCity) ? <span>{this.cityTextFn(itemData.positionProvince, itemData.positionCity)}</span> : null}
                                    {this.cityTextFn(itemData.positionProvince, itemData.positionCity) ? <span className='shuXian'></span> : null}
                                    {itemData.positionExp ? <span>{itemData.positionExp}</span> : null}
                                    {itemData.positionExp ? <span className='shuXian'></span> : null}
                                    {itemData.personEducation ? <span>{itemData.personEducation}</span> : null}
                                    {itemData.personEducation ? <span className='shuXian'></span> : null}
                                    {itemData.positionNature ? <span>{itemData.positionNature}</span> : null}
                                    {itemData.positionNature ? <span className='shuXian'></span> : null}
                                    {itemData.positionSalary ? <span>{itemData.positionSalary}</span> : null}
                                    {itemData.positionSalary ? <span className='shuXian'></span> : null}
                            </div>
                        </div>
                    </div>
                    <div className='bottom'>
                        <span onClick={() => this.itemClickFn(`auditionDetails?id=${itemData.toMemberId}`)}>查看简历</span>
                        <span className='lianXi' onClick={() => this.itemClickFn(`chatWindow?id=${itemData.fromMemberId}&positionId=${itemData.positionId}`)}>
                            <span className='icon'></span>
                            联系推荐人：{itemData.hrName}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
})

export default CommonTpl
