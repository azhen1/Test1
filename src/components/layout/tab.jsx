import React from 'react'
import './layout.less'
import {Menu, Icon} from 'antd'
import {message} from 'antd/lib/index'
import {getRequest} from '../../common/ajax'

const SubMenu = Menu.SubMenu

const Tab = React.createClass({
    getInitialState () {
        return {
            collapsed: false,
            curKey: '0',
            resumeNum: 0,
            money: 0.00
        }
    },
    toggleCollapsed () {
        this.setState({
            collapsed: !this.state.collapsed
        })
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    indexOfFn (str, type) {
        let result = false
        if (str.indexOf(type) !== -1) {
            result = true
        }
        return result
    },
    componentWillMount () {
        let curHash = window.location.hash
        let tabValue = ''
        if (this.indexOfFn(curHash, 'positionManager')) {
            tabValue = '1'
        } else if (this.indexOfFn(curHash, 'auditionManager')) {
            tabValue = '2'
        } else if (this.indexOfFn(curHash, 'businessInfo')) {
            tabValue = '5'
        } else if (this.indexOfFn(curHash, 'balanceManager')) {
            tabValue = '6'
        } else if (this.indexOfFn(curHash, 'lookAgentPage')) {
            tabValue = '7'
        } else if (this.indexOfFn(curHash, 'myAgentPage')) {
            tabValue = '8'
        } else if (this.indexOfFn(curHash, 'allCandidate')) {
            tabValue = '9'
        } else if (this.indexOfFn(curHash, 'downloadCandidate')) {
            tabValue = '10'
        }
        this.setState({
            curKey: tabValue
        })
    },
    componentDidMount () {
        this.getResumeNum()
        this.getMoney()
        this.timerFn()
    },
    // 定时器
    timerFn () {
        let _th = this
        setInterval(function () {
            let hasChange = window.localStorage.getItem('hasChangeResume')
            if (hasChange === 'true') {
                _th.getResumeNum()
                window.localStorage.setItem('hasChangeResume', 'false')
            }
        }, 700)
    },
    getResumeNum () {
        let URL = 'member/companyResume/getNum'
        let _th = this
        let memberId = window.localStorage.getItem('memberId')
        let formData = {
            memberId: memberId
        }
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    resumeNum: res.data.num
                })
            } else {
                message.error('系统错误')
            }
        })
    },
    // 当前金额
    getMoney () {
        let URL = 'job/platformInterview/moneyRecordAndCompanyInfo'
        let _th = this
        let memberId = localStorage.getItem('memberId')
        let formData = {}
        formData.companyId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    money: res.data.CompanyCurrentMoney
                })
            } else {
                message.error('系统错误')
            }
        })
    },
    componentWillReceiveProps () {
        let curHash = window.location.hash
        let tabValue = ''
        if (this.indexOfFn(curHash, 'positionManager')) {
            tabValue = '1'
        } else if (this.indexOfFn(curHash, 'auditionManager')) {
            tabValue = '2'
        } else if (this.indexOfFn(curHash, 'businessInfo')) {
            tabValue = '5'
        } else if (this.indexOfFn(curHash, 'balanceManager')) {
            tabValue = '6'
        } else if (this.indexOfFn(curHash, 'lookAgentPage')) {
            tabValue = '7'
        } else if (this.indexOfFn(curHash, 'myAgentPage')) {
            tabValue = '8'
        } else if (this.indexOfFn(curHash, 'allCandidate')) {
            tabValue = '9'
        } else if (this.indexOfFn(curHash, 'downloadCandidate')) {
            tabValue = '10'
        }
        this.setState({
            curKey: tabValue
        })
    },
    onTabSelect (item, key, selectedKeys) {
        let curKey = item.key
        this.setState({
            curKey: curKey
        })
    },
    pullPop () {
        let popElem = document.getElementsByClassName('popMain')[0]
        popElem.classList.remove('push')
        popElem.classList.add('pull')
    },
    render () {
        let {collapsed, curKey, resumeNum, money} = this.state
        let key3Title = (
            <span className='tab_item_box tab_item_box5'>
                <span className='iconBox_Tab iconBox_Tab5'> </span>
                <span className='tab_item'>
                    经纪人
                </span>
            </span>
        )
        let key4Title = (
            <span className='tab_item_box tab_item_box6'>
                <span className='iconBox_Tab iconBox_Tab6'> </span>
                <span className='tab_item'>
                    候选人
                </span>
            </span>
        )
        return (
            <div className="app_tab">
                <div className='appMain'>
                    <Menu
                        defaultSelectedKeys={[curKey]}
                        selectedKeys={[curKey]}
                        mode="inline"
                        theme="light"
                        onSelect={this.onTabSelect}
                        inlineCollapsed={collapsed}
                        defaultOpenKeys={curKey === '7' || curKey === '8' ? ['3'] : curKey === '9' || curKey === '10' ? ['4'] : []}
                    >
                        <Menu.Item key="1">
                            <div onClick={() => this.itemClickFn('positionManager')} className='tab_item_box tab_item_box1'>
                                <span className='iconBox_Tab iconBox_Tab1'></span>
                                <span className='tab_item'>职位管理</span>
                            </div>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <div onClick={() => this.itemClickFn('auditionManager')} className='tab_item_box tab_item_box2'>
                                <span className='iconBox_Tab iconBox_Tab2'></span>
                                <span className='tab_item'>面试管理</span>
                            </div>
                        </Menu.Item>
                        <SubMenu key="4" title={key4Title}>
                            <Menu.Item key="9">
                                <div onClick={() => this.itemClickFn('allCandidate')}>
                                    <span className='tab_item' style={{marginLeft: '12px'}}>候选人公海</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item key="10">
                                <div onClick={() => this.itemClickFn('downloadCandidate')}>
                                    <span className='tab_item' style={{marginLeft: '12px'}}>已下载简历</span>
                                </div>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="3" title={key3Title}>
                            <Menu.Item key="7">
                                <div onClick={() => this.itemClickFn('lookAgentPage')}>
                                    <span className='tab_item' style={{marginLeft: '12px'}}>寻找经纪人</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <div onClick={() => this.itemClickFn('myAgentPage')}>
                                    <span className='tab_item' style={{marginLeft: '12px'}}>我的经纪人</span>
                                </div>
                            </Menu.Item>
                        </SubMenu>
                        <Menu.Item key="5">
                            <div onClick={() => this.itemClickFn('businessInfo')} className='tab_item_box tab_item_box3'>
                                <span className='iconBox_Tab iconBox_Tab3'></span>
                                <span className='tab_item'>企业信息</span>
                            </div>
                        </Menu.Item>
                        <Menu.Item key="6">
                            <div onClick={() => this.itemClickFn('balanceManager')} className='tab_item_box tab_item_box4'>
                                <span className='iconBox_Tab iconBox_Tab4'></span>
                                <span className='tab_item'>余额管理</span>
                            </div>
                        </Menu.Item>
                    </Menu>
                    <div className="accountInfo">
                        <div className="moreBtn" onClick={() => this.pullPop()}>拉一下看看</div>
                        <div className="box">
                            剩余简历：<span className='on'>{resumeNum}</span> 份
                        </div>
                        <div className="box">
                            余额：<span className='on'>{money}</span> 元
                        </div>
                        <div className="box">
                            后台支持：邓东卫
                        </div>
                        <div className="box">
                            电话：18042013052
                        </div>
                        <div className="box">
                            微信：18042013052
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default Tab
