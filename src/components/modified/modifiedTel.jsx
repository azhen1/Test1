import React from 'react'
import './modified.less'
import {Menu, Icon, Tabs, Input} from 'antd'
import {message} from 'antd/lib/index'
import {getRequest, postRequest} from '../../common/ajax'
import yiHuoFn from '../../common/yiHuoFn'
import Base64 from '../../common/base64Decode'

const TabPane = Tabs.TabPane
const ModifiedTel = React.createClass({
    getInitialState () {
        return {
            formList: {
                phone: '',
                code: ''
            },
            hasCode: false,
            again: false,
            count: 60
        }
    },
    componentDidMount () {
        this._isMounted = true
    },
    // 电话号码加密处理，先异或，再base64转码
    encryptPhone (phoneStr) {
        let base = new Base64()
        let result = []
        let tpl = '00000dingyi'
        let strRes = ''
        let phoneArr = yiHuoFn.unpack(phoneStr)
        let tplArr = yiHuoFn.unpack(tpl)
        phoneArr.map((v, index) => {
            result.push(v ^ tplArr[index])
        })
        result = yiHuoFn.pack(result)
        strRes = base.encode(result)
        return strRes
    },
    handleChange (e, type) {
        let val = e.target.value
        let {formList} = this.state
        formList[type] = val
        this.setState({
            formList: formList
        })
    },
    getCode () {
        let {formList} = this.state
        let _th = this
        if (this.isNull(formList.phone)) {
            message.warning('请输入手机号码')
        } else {
            if (formList.phone !== '') {
                let reg = /^1[3|4|5|7|8|9][0-9]{9}$/
                if (!reg.test(formList.phone)) {
                    message.warning('请输入合法的手机号码')
                    formList.phone = ''
                    this.setState({
                        formList: formList
                    })
                } else {
                    let URL = 'member/platformMember/mobileIsExist'
                    let formData = {
                        mobile: formList.phone
                    }
                    getRequest(true, URL, formData).then(function (res) {
                        if (res.code === 0) {
                            if (res.data.isExist) {
                                message.warning('该手机号已经存在，请使用未注册过的手机号！')
                                formList.phone = ''
                                _th.setState({
                                    formList: formList
                                })
                            } else {
                                _th.setState({
                                    hasCode: true
                                }, () => {
                                    _th.obtainCode()
                                })
                            }
                        } else {
                            message.warning(res.message)
                        }
                    })
                }
            }
        }
    },
    obtainCode () {
        let URL = 'member/platformMember/getCode'
        let {formList} = this.state
        let _th = this
        let formData = {
            mobile: _th.encryptPhone(formList.phone)
        }
        getRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                _th.countDown()
            } else {
                message.error(res.message)
            }
        })
    },
    countDown () {
        let _th = this
        let timer = setInterval(function () {
            let {count} = _th.state
            if (_th._isMounted) {
                if (count === 0) {
                    clearInterval(timer)
                    _th.setState({
                        count: 60,
                        again: true,
                        hasCode: false
                    })
                } else {
                    count--
                    _th.setState({
                        count: count
                    })
                }
            }
        }, 1000)
    },
    handleSave () {
        let {formList} = this.state
        if (this.isNull(formList.phone)) {
            message.warning('请填写新的手机号!')
            return
        }
        if (this.isNull(formList.code)) {
            message.warning('请填写手机验证码!')
            return
        }
        if (!this.isNull(formList.code) && !this.isNull(formList.phone)) {
            this.postSave()
        }
    },
    postSave () {
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/company/resetMobile'
        let {formList} = this.state
        let _th = this
        let formData = {
            mobile: formList.phone,
            code: formList.code,
            memberId: memberId
        }
        postRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                message.success('修改成功！')
                formList.phone = ''
                formList.code = ''
                _th.setState({
                    formList: formList
                })
                _th.props.getBusinssInfoAllInfo()
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
        let {formList, hasCode, count, again} = this.state
        let inputStyle = {width: '300px', backgroundColor: '#E6F5FF'}
        return (
            <div className='modifiedBox'>
                <div className="telBox">
                    <label className='label'>当前手机号码：</label>
                    <span>{this.props.oldMobile}</span>
                </div>
                <div className="telBox">
                    <label className='label'>修改手机号码：</label>
                    <Input style={inputStyle} placeholder='请输入新手机号码' value={formList.phone} onChange={(e) => this.handleChange(e, 'phone')}></Input>
                </div>
                <div className="telBox">
                    <label className='label'></label>
                    <div className='codeIpt'>
                        <Input placeholder='请输入手机验证码' value={formList.code} onChange={(e) => this.handleChange(e, 'code')}></Input>
                        {hasCode ? <span>{`已发送 ${count} 秒`}</span> : again ? <span onClick={() => this.getCode()}>重新获取验证码</span> : <span onClick={() => this.getCode()}>获取验证码</span>}
                    </div>
                </div>
                <div className='telBox'>
                    <div className='button' onClick={() => this.handleSave()}>确认修改</div>
                </div>
            </div>
        )
    }
})

export default ModifiedTel
