import React from 'react'
import './listItemTpl.less'
import util from '../../../common/util'

let ListItemTpl = React.createClass({
    itemClickFn (router) {
        window.location.hash = router
    },
    render () {
        let {listItemArr, curTab} = this.props
        return (
            <div className='listItemTpl' onClick={() => this.itemClickFn(`positionDetails?id=${listItemArr.id}`)}>
                <div className='position' style={curTab === 'Undercarriaged' ? {color: '#999999'} : {}}>
                    {listItemArr.title}
                </div>
                <div className='baseInfo'>
                    <span>{listItemArr.city}</span>
                    <span className='breakUp'> </span>
                    <span>{listItemArr.workExperience}</span>
                    <span className='breakUp'> </span>
                    <span>{listItemArr.education}</span>
                    <span className='breakUp'> </span>
                    <span>{listItemArr.positionNature}</span>
                    <span className='breakUp'> </span>
                    <span>{listItemArr.salary}</span>
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
