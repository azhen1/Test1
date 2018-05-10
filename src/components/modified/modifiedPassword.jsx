import React from 'react'
import './modified.less'
import {Input} from 'antd'
import {message} from 'antd/lib/index'
import {getRequest, postRequest} from '../../common/ajax'

const ModifiedPassword = React.createClass({
    getInitialState () {
        return {
            formList: {
                oldPassword: '',
                newPassword: '',
                newPasswordAgain: ''
            },
            hasSave: false
        }
    },
    handleChange (e, type) {
        let val = e.target.value
        let {formList} = this.state
        formList[type] = val
        this.setState({
            formList: formList
        })
    },
    handleBlur (e) {
        let val = e.target.value
        let {formList} = this.state
        formList.newPasswordAgain = val
    },
    handleSave () {
        let {formList, hasSave} = this.state
        this.setState({
            hasSave: true
        }, () => {
            if (this.isNull(formList.oldPassword)) {
                message.warning('请输入旧密码')
                return
            }
            if (this.isNull(formList.newPassword)) {
                message.warning('请输入新密码')
                return
            }
            if (this.passwordVerifyFail('newPassword')) {
                message.warning('新密码格式不对，请重新输入')
                return
            }
            if (this.isNull(formList.newPasswordAgain)) {
                message.warning('请再次输入新密码')
                return
            }
            if (this.passwordVerifyFail('newPasswordAgain')) {
                message.warning('再次输入新密码的格式不对，请重新输入')
                return
            }
            if (formList.newPassword !== formList.newPasswordAgain) {
                message.warning('两次输入新密码不一致！请重新输入')
                return
            }
            this.postSave()
        })
    },
    // 密码正则验证 密码必须为数字与字母组合长度8-16个字符
    passwordVerifyFail (type) {
        let {formList, hasSave} = this.state
        let val = formList[type]
        let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
        if (hasSave && !reg.test(val)) {
            return true
        } else {
            return false
        }
    },
    postSave () {
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/platformMember/resetPassword'
        let {formList} = this.state
        let _th = this
        let formData = {
            oldPassword: formList.oldPassword,
            newPassword: formList.newPassword,
            memberId: memberId
        }
        postRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                message.success('修改成功！')
                formList.oldPassword = ''
                formList.newPassword = ''
                formList.newPasswordAgain = ''
                _th.setState({
                    formList: formList,
                    hasSave: false
                })
            } else {
                message.error(res.message)
            }
        })
    },
    isNull (val) {
        if (val === undefined || val === null || val === '') {
            return true
        } else {
            return false
        }
    },
    render () {
        let {formList, hasSave} = this.state
        let inputStyle = {width: '300px', backgroundColor: '#E6F5FF'}
        return (
            <div className='modifiedBox'>
                <div className="telBox">
                    <label className='label'>当前登录账号：</label>
                    <span>{this.props.oldMobile}</span>
                </div>
                <div className="telBox">
                    <label className='label'>修改登录密码：</label>
                    <Input style={inputStyle}
                           placeholder='输入旧密码' value={formList.oldPassword} onChange={(e) => this.handleChange(e, 'oldPassword')}></Input>
                </div>
                <div className="telBox">
                    <label className='label'></label>
                    <Input style={inputStyle}
                           placeholder='输入新密码' value={formList.newPassword} onChange={(e) => this.handleChange(e, 'newPassword')}></Input>
                </div>
                <div className="telBox">
                    <label className='label'></label>
                    <Input style={inputStyle}
                           placeholder='再次输入新密码' value={formList.newPasswordAgain} onChange={(e) => this.handleChange(e, 'newPasswordAgain')} onBlur={(e) => this.handleBlur(e)}></Input>
                </div>
                <div className="telBox">
                    <span className='tips'>密码必须为数字与字母组合长度8-16个字符</span>
                </div>
                <div className='telBox'>
                    <div className='button' onClick={() => this.handleSave()}>确认修改</div>
                </div>
            </div>
        )
    }
})

export default ModifiedPassword
