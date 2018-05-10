import React from 'react'
import './modified.less'
import {Menu, Icon, Tabs} from 'antd'
import {message} from 'antd/lib/index'
import {getRequest} from '../../common/ajax'
import ModifiedName from './modifiedName'
import ModifiedPassword from './modifiedPassword'
import ModifiedTel from './modifiedTel'

const TabPane = Tabs.TabPane
const ModifiedInfo = React.createClass({
    getInitialState () {
        return {
            curTab: '1',
            oldMobile: ''
        }
    },
    componentDidMount () {
        this.getBusinssInfoAllInfo()
    },
    // 查询公司所有信息
    getBusinssInfoAllInfo () {
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/platformMember/get'
        let _th = this
        let formData = {}
        formData.memberId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    oldMobile: res.data.mobile
                })
            } else {
                message.error(res.message)
            }
        })
    },
    onTabChange (val) {
        this.setState({
            curTab: val
        })
    },
    render () {
        let {curTab, oldMobile} = this.state
        let propertyList = {getBusinssInfoAllInfo: this.getBusinssInfoAllInfo, oldMobile: oldMobile}
        return (
            <div className='modifiedMain'>
                <div className="content">
                    <div className='til'>
                        <Tabs defaultActiveKey={curTab} activeKey={curTab} onChange={this.onTabChange}>
                            <TabPane tab="手机号码" key="1"> </TabPane>
                            <TabPane tab="密码管理" key="2"> </TabPane>
                            <TabPane tab="个人设置" key="3"> </TabPane>
                        </Tabs>
                    </div>
                    {curTab === '1' ? <ModifiedTel {...propertyList}/> : null}
                    {curTab === '2' ? <ModifiedPassword {...propertyList}/> : null}
                    {curTab === '3' ? <ModifiedName {...propertyList}/> : null}
                </div>
            </div>
        )
    }
})

export default ModifiedInfo
