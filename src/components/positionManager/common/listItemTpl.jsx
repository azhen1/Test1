import React from 'react'
import './listItemTpl.less'
import addressData from '../../../common/area'

let ListItemTpl = React.createClass({
    itemClickFn (router) {
        window.location.hash = router
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
    render () {
        let {listItemArr, curTab} = this.props
        return (
            <div className='listItemTpl' onClick={() => this.itemClickFn(`positionDetails?id=${listItemArr.id}`)}>
                <div className='position' style={curTab === 'Undercarriaged' ? {color: '#999999'} : {}}>
                    {listItemArr.title}
                </div>
                <div className='baseInfo'>
                    {this.filterCityFn(listItemArr.province, listItemArr.city) ? <span>{this.filterCityFn(listItemArr.province, listItemArr.city)}</span> : null}
                    {this.filterCityFn(listItemArr.province, listItemArr.city) ? <span className='breakUp'></span> : null}
                    {listItemArr.workExperience ? <span>{listItemArr.workExperience}</span> : null}
                    {listItemArr.workExperience ? <span className='breakUp'></span> : null}
                    {listItemArr.education ? <span>{listItemArr.education}</span> : null}
                    {listItemArr.education ? <span className='breakUp'></span> : null}
                    {listItemArr.positionNature ? <span>{listItemArr.positionNature}</span> : null}
                    {listItemArr.positionNature ? <span className='breakUp'></span> : null}
                    {listItemArr.salary ? <span>{listItemArr.salary}</span> : null}
                    {listItemArr.salary ? <span className='breakUp'></span> : null}
                </div>
                <div className='auditionResult'>
                    <span>{`${listItemArr.updateTime}更新`}</span>
                    <span>{`共收到${listItemArr.recommendNum}个推荐`}</span>
                    <span>{`已面试${listItemArr.recommendSuccess}人`}</span>
                    <span>{`待入职${listItemArr.waitEntryNum}人`}</span>
                    <span>{`已入职${listItemArr.entrySuccess}人`}</span>
                </div>
            </div>
        )
    }
})

export default ListItemTpl
