import React from 'react'
import {Dropdown, Menu, message} from 'antd'
import './layout.less'
import defaultHeadImg from '../../images/defaultC.png'
import {getRequest} from '../../common/ajax'

const Header = React.createClass({
    getInitialState () {
        return {
            dataList: {},
            memberId: ''
        }
    },
    componentDidMount () {
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let memberId = window.localStorage.getItem('memberId')
        this.setState({
            memberId: memberId
        })
        let weiDuInfo = document.getElementsByClassName('weiDu_info')[0]
        if (weiDuInfo.innerHTML === '0') {
            weiDuInfo.style.display = 'none'
        } else {
            weiDuInfo.style.display = 'inline-block'
        }
        let weiDuHint = document.getElementsByClassName('weiDu_hint')[0]
        if (weiDuHint.innerHTML === '0') {
            weiDuHint.style.display = 'none'
        } else {
            weiDuHint.style.display = 'inline-block'
        }
    },
    componentWillReceiveProps (nextProps) {
        // console.log('componentWillReceiveProps')
        let {dataList} = nextProps
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
    // 判断dataList是否为空，或者属性为空
    userInformation (type) {
        let {dataList} = this.state
        if (dataList !== {} && dataList[type] !== '' && dataList[type] !== undefined) {
            return true
        } else {
            return false
        }
    },
    onQuitFn () {
        window.localStorage.removeItem('sessionUuid')
        message.success('退出成功，请重新登录!')
        window.location.hash = 'login'
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
        let {dataList} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        const menu = (
            <Menu>
                <Menu.Item>
                    <span onClick={() => this.itemClickFn('modifiedInfo')}
                          style={{fontSize: '14px', width: '74px', display: 'inline-block', color: 'rgba(0,0,0,.65)'}}>
                        修改资料
                    </span>
                </Menu.Item>
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
                    <span className='name'>鲸匹配</span>
                    <div className='operate'>
                        <span className='hint' onClick={() => this.itemClickFn('information')}>
                             <span className='weiDu_hint'>0</span>
                        </span>
                        <span className='info' onClick={() => this.itemClickFn('chatWindow')}>
                            <span className='weiDu_info'>0</span>
                        </span>
                    </div>
                </div>
                <div className="right">
                    <span className='company'>
                        <div className='HR'>
                            {this.userInformation('userName') ? dataList.userName : '未命名'}
                        </div>
                        <div className='ascription'>
                            {this.userInformation('companyName') ? dataList.companyName : '未命名'}
                        </div>
                    </span>
                    <img src={this.hasLogoPic(dataList.logoPic) ? defaultHeadImg : `${imgsURL}${dataList.logoPic}`} alt="" className='head_pic'/>
                    <Dropdown overlay={menu} placement="bottomLeft" trigger={['hover']}>
                        <span className='operate_item'></span>
                    </Dropdown>
                </div>
            </div>
        )
    }
})

export default Header
