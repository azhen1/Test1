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
                <img src={`${imgsURL}${itemData.personHeadUrl}`} alt="" className='pic'/>
                <div className='tplCont'>
                    <div className='top'>
                        <div className='showPeople'>
                            <div className='jianJie'>
                                <span className='name'>{itemData.personName}</span>
                                <span className='trade' title={`${itemData.personPosition} | ${itemData.personTrade}`}>
                                    {`${itemData.personPosition} | ${itemData.personTrade}`}
                                </span>
                            </div>
                            <div className='basicInfo'>
                                <span>{itemData.personEducation}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.personWorkYears}</span>
                                <span className='shuXian'></span>
                                <span>{`${itemData.personAge}岁`}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.lastestEntryTime}</span>
                                <span className='jobStates'>{itemData.personOnJob === 1 ? '在职' : '离职'}</span>
                            </div>
                        </div>
                        <div className='line'></div>
                        <div className='place'>
                            <div className='placeTil'>
                                {itemData.companyName}
                            </div>
                            <div className='basicInfo'>
                                <span>{this.cityTextFn(itemData.positionProvince, itemData.positionCity)}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.positionExp}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.personEducation}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.positionNature}</span>
                                <span className='shuXian'></span>
                                <span>{itemData.positionSalary}</span>
                            </div>
                        </div>
                    </div>
                    <div className='bottom'>
                        <span onClick={() => this.itemClickFn(`anditionDetails?id=${itemData.toMemberId}`)}>查看简历</span>
                        <span className='lianXi' onClick={() => this.itemClickFn(`chatWindow?id=${itemData.fromMemberId}&name=${itemData.hrName}&headUrl=${itemData.personHeadUrl}`)}>
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
