import React from 'react'
import './layout.less'
import {Menu, Icon} from 'antd'

const SubMenu = Menu.SubMenu

const Tab = React.createClass({
    getInitialState () {
        return {
            collapsed: false,
            curKey: '0'
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
        }
        this.setState({
            curKey: tabValue
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
    iconHasSelectFn (key, url) {
        let {curKey} = this.state
        url = `src/images/${url}.png`
        return curKey === key ? {background: `url("${url}") no-repeat`, backgroundSize: '100% 100%'} : {}
    },
    render () {
        let {collapsed, curKey} = this.state
        let key3Title = (
            <span className='tab_item_box5'>
                <span className='iconBox_Tab iconBox_Tab5' style={this.iconHasSelectFn('3', 'qiYeXinXiSel')}> </span>
                <span className='tab_item'>
                    经纪人
                </span>
            </span>
        )
        return (
            <div className="app_tab">
                <Menu
                    defaultSelectedKeys={[curKey]}
                    mode="inline"
                    theme="light"
                    onSelect={this.onTabSelect}
                    inlineCollapsed={collapsed}
                    defaultOpenKeys={curKey === '7' || curKey === '8' ? ['3'] : []}
                >
                    <Menu.Item key="1">
                        <div onClick={() => this.itemClickFn('positionManager')} className='tab_item_box1'>
                            <span className='iconBox_Tab iconBox_Tab1' style={this.iconHasSelectFn('1', 'zhiWeiGuanliSle')}></span>
                            <span className='tab_item'>职位管理</span>
                        </div>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <div onClick={() => this.itemClickFn('auditionManager')} className='tab_item_box2'>
                            <span className='iconBox_Tab iconBox_Tab2' style={this.iconHasSelectFn('2', 'mianshiGLSel')}></span>
                            <span className='tab_item'>面试管理</span>
                        </div>
                    </Menu.Item>
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
                        <div onClick={() => this.itemClickFn('businessInfo')} className='tab_item_box3'>
                            <span className='iconBox_Tab iconBox_Tab3' style={this.iconHasSelectFn('5', 'qiYeXinXiSel')}></span>
                            <span className='tab_item'>企业信息</span>
                        </div>
                    </Menu.Item>
                    <Menu.Item key="6">
                        <div onClick={() => this.itemClickFn('balanceManager')} className='tab_item_box4'>
                            <span className='iconBox_Tab iconBox_Tab4' style={this.iconHasSelectFn('6', 'yuEGuanLiSel')}></span>
                            <span className='tab_item'>余额管理</span>
                        </div>
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
})

export default Tab
