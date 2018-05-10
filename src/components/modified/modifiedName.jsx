import React from 'react'
import './modified.less'
import {Input} from 'antd'
import {message} from 'antd/lib/index'
import {getRequest, postRequest} from '../../common/ajax'

const ModifiedName = React.createClass({
    getInitialState () {
        return {
            userName: window.localStorage.getItem('userName'),
            newUserName: ''
        }
    },
    handleChange (e) {
        let val = e.target.value
        this.setState({
            newUserName: val
        })
    },
    handleSave () {
        let {newUserName} = this.state
        if (newUserName === '') {
            message.warning('新使用者姓名不能为空！')
        } else if (newUserName.length > 10) {
            message.warning('不能超过十个字符')
        } else {
            this.postSave()
        }
    },
    postSave () {
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/company/update'
        let {newUserName} = this.state
        let _th = this
        let formData = {
            userName: newUserName,
            memberId: memberId
        }
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            if (res.code === 0) {
                message.success('修改成功！')
                window.localStorage.setItem('hasChangeCompany', 'true')
                _th.setState({
                    userName: newUserName,
                    newUserName: ''
                })
            } else {
                message.error(res.message)
            }
        })
    },
    render () {
        let {userName, newUserName} = this.state
        let inputStyle = {width: '300px', backgroundColor: '#E6F5FF'}
        return (
            <div className='modifiedBox'>
                <div className="telBox">
                    <label className='label'>账号使用者：</label>
                    <span>{userName}</span>
                </div>
                <div className="telBox">
                    <label className='label'>修改使用者：</label>
                    <Input style={inputStyle} value={newUserName} onChange={(e) => this.handleChange(e)} placeholder='输入新使用者姓名'></Input>
                </div>
                <div className='telBox'>
                    <div className='button' onClick={() => this.handleSave()}>确认修改</div>
                </div>
            </div>
        )
    }
})

export default ModifiedName
