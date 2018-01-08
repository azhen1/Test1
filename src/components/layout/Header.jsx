import React from 'react'
import {Dropdown, Menu, message} from 'antd'
import './layout.less'

const Header = React.createClass({
    getInitialState () {
        return {
            dataList: {}
        }
    },
    componentDidMount () {
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let memberId = window.localStorage.getItem('memberId')
        let {dataList} = this.state
        let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
        if (weiDuInfo.innerHTML === '0') {
            weiDuInfo.style.display = 'none'
        } else {
            weiDuInfo.style.display = 'inline-block'
        }
        dataList.userName = window.localStorage.getItem('userName')
        dataList.companyName = window.localStorage.getItem('companyName')
        dataList.logoPic = window.localStorage.getItem('logoPic')
        this.setState({
            dataList: dataList
        })
    },
    itemClickFn (router) {
        if (router === 'chatWindow') {
            let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
            weiDuInfo.innerHTML = '0'
            weiDuInfo.style.display = 'none'
        }
        window.location.hash = router
    },
    onQuitFn () {
        window.localStorage.removeItem('sessionUuid')
        message.success('退出成功，请重新登录!')
        window.location.hash = 'login'
    },
    render () {
        let {dataList} = this.state
        let len = Object.values(dataList).length
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        const menu = (
            <Menu>
                <Menu.Item>
                    <span onClick={this.onQuitFn}
                          style={{fontSize: '14px', width: '74px', display: 'inline-block', color: 'rgba(0,0,0,.65)'}}>
                        退出
                    </span>
                </Menu.Item>
            </Menu>
        )
        return (
            <div className='app_header'>
                <div className='left'>
                    <span className='app_logo'></span>
                    <span className='name'>鲸城</span>
                    <div className='operate'>
                        <span className='hint' onClick={() => this.itemClickFn('information')}>
                             <span className='weiDu_hint'>...</span>
                        </span>
                        <span className='info' onClick={() => this.itemClickFn('chatWindow')}>
                            <span className='weiDu_info'>0</span>
                        </span>
                    </div>
                </div>
                <div className="right">
                    <span className='company'>
                        <div className='HR'>
                            {len > 0 && dataList.userName}
                        </div>
                        <div className='ascription'>
                            {len > 0 && dataList.companyName}
                        </div>
                    </span>
                    <img src={`${imgsURL}${dataList.logoPic}`} alt="" className='head_pic'/>
                    <Dropdown overlay={menu} placement="bottomLeft" trigger={['hover']}>
                        <span className='operate_item'></span>
                    </Dropdown>
                </div>
            </div>
        )
    }
})

export default Header
