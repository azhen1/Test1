import React from 'react'
import {Input, Button, message, Icon} from 'antd'
import {Link} from 'react-router'
import {getRequest, postRequest} from '../../common/ajax'
import './user.less'
import yiHuoFn from '../../common/yiHuoFn'
import Base64 from '../../common/base64Decode'

const ForgetPassword = React.createClass({
    getInitialState () {
        return {
            formList: {
                phone: '',
                imageHtml: '',
                phoneHtml: '',
                first: '',
                second: ''
            },
            hasSubmit: false,
            typeActive: 'proving_login',
            curKey: '',
            countDownToggle: false,
            defCount: 60,
            again: false,
            captchaCode: '',
            picBase64: '',
            count: 0
        }
    },
    componentDidMount () {
        this._isMounted = true
        this.toggleImgFn()
    },
    // 获取图片验证码
    toggleImgFn () {
        let URL = 'member/company/captcha-image'
        let _th = this
        getRequest(true, URL, {}).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    captchaCode: data.captchaCode,
                    picBase64: data.pic
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 密码登／眼验证码登录切换
    loginTypeChange (type) {
        let {formList} = this.state
        // for (let k in formList) {
            // formList[k] = ''
        // }
        this.setState({
            typeActive: type,
            hasSubmit: false,
            formList: formList,
            curKey: `${type}_KEY`
        }, () => {
            this.setState({
                hasSubmit: false
            })
        })
    },
    // 表单输入
    formChange (e, type) {
        let val = e.target.value
        let {formList} = this.state
        formList[type] = val
        this.setState({
            formList: {...formList}
        })
    },
    passwordJiaMi (val) {
        if (val !== undefined) {
            val = val.split('')
            val.forEach((v, index) => {
                val[index] = '*'
            })
            val = val.join('')
            return val
        }
    },
    loginTypeClass (type) {
        let {typeActive} = this.state
        return typeActive === type ? `${type} active` : `${type}`
    },
    hasBorderFn (type) {
        let {typeActive} = this.state
        return typeActive === type ? true : false
    },
    // 该方法暂时不用
    formBoxHeight (type) {
        let doc = document
        let height = 358
        // 这里[loginForm]跟后面的结点数组无法解构，导致在safari中页面打不开
        let [loginForm] = doc.getElementsByClassName('left_box')
        if (loginForm !== undefined) {
            height = loginForm.offsetHeight
        }
        if (type === 'String') {
            return `${height}px`
        } else {
            return height
        }
    },
    // 提交
    onSubmit () {
        this.setState({
            hasSubmit: true
        }, () => {
            let {formList, typeActive} = this.state
            let hasNull = false
            let formData = {}
            for (let k in formList) {
                if (formList[k] === '' && k !== 'first' && k !== 'second') {
                    hasNull = true
                }
            }
            if (hasNull) {
                message.warning('你有信息尚未填写')
                this.setState({
                    count: ++this.state.count
                })
            } else {
                formData.mobile = formList.phone
                formData.code = formList.phoneHtml
                this.reqLookPassword(formData)
            }
        })
    },
    // 点击找回密码
    reqLookPassword (formData) {
        let URL = 'member/company/resetPasswordCheckcode'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.loginTypeChange('password_login')
                _th.setState({
                    hasSubmit: false
                })
            } else {
                message.error(res.message)
            }
        })
    },
    // 判断非空
    isNullFn (type) {
        let {formList, hasSubmit} = this.state
        let isNull = false
        if (hasSubmit && formList[type] === '') {
            isNull = true
        }
        return isNull
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
    // 获取验证码
    obtainFn () {
        this.setState({
            countDownToggle: true
        }, () => {
            let {formList, defCount, captchaCode} = this.state
            if (defCount === 60) {
                let phone = formList.phone
                let imageHtml = formList.imageHtml
                let formData = {}
                if (phone === '') {
                    message.warning('请输入手机号！')
                    this.setState({
                        countDownToggle: false
                    })
                } else if (imageHtml === '') {
                    message.warning('请输入图形验证码！')
                    this.setState({
                        countDownToggle: false
                    })
                } else if (phone !== '' && imageHtml !== '') {
                    formData.mobile = this.encryptPhone(phone)
                    formData.inputCapCode = imageHtml
                    formData.captchaCode = captchaCode
                    this.reqYanZhengMa(formData)
                }
            }
        })
    },
    // 获取手机验证码接口
    reqYanZhengMa (formData) {
        let URL = 'member/company/getCode'
        let _th = this
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.countDown()
            } else {
                message.error(res.message)
                _th.setState({
                    countDownToggle: false
                })
            }
        })
    },
    // 倒计时
    countDown () {
        let _th = this
        let count = setInterval(function () {
            if (_th._isMounted) {
                if (_th.state.defCount === 0) {
                    clearInterval(count)
                    _th.setState({
                        countDownToggle: false,
                        defCount: 60,
                        again: true
                    })
                } else {
                    _th.setState({
                        defCount: --_th.state.defCount
                    })
                }
            } else {
                clearInterval(count)
            }
        }, 1000)
    },
    // 确定
    onOk () {
        this.setState({
            hasSubmit: true
        }, () => {
            let {formList} = this.state
            if (formList.first === '' || this.passwordVerifyFail('first') || formList.second === '' || this.passwordVerifyFail('second')) {
                return false
            }
            if (formList.first !== formList.second) {
                message.warning('您两次输入的密码不相等，请重新输入！')
                return false
            } else if (formList.first === formList.second && formList.first !== '' && formList.second !== '') {
                let formData = {}
                formData.mobile = formList.phone
                formData.code = formList.phoneHtml
                formData.newPassword = formList.second
                this.reqRenameLogin(formData)
            }
        })
    },
    // 密码正则验证 密码必须为数字与字母组合长度8-16个字符
    passwordVerifyFail (type) {
        let {formList, hasSubmit} = this.state
        let val = formList[type]
        let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
        if (hasSubmit && !reg.test(val)) {
            return true
        } else {
            return false
        }
    },
    // 重置密码接口
    reqRenameLogin (formData) {
        let URL = 'member/company/resetPasswordByCode'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('密码设置成功，请登录!')
                window.location.hash = 'login'
            } else {
                message.error(res.message)
            }
        })
    },
    phoneIntBlur (e) {
        let {formList} = this.state
        let val = e.target.value
        if (val !== '') {
            let reg = /^1[3|4|5|7|8|9][0-9]{9}$/
            if (!reg.test(val)) {
                message.warning('请输入合法的电话号码')
                formList.phone = ''
                this.setState({
                    formList: formList
                })
            } else {
                formList.phone = val
                this.setState({
                    formList: formList
                })
            }
        }
    },
    componentWillUnmount () {
        this._isMounted = false
    },
    render () {
        let {curKey, formList, countDownToggle, defCount, again, typeActive, picBase64} = this.state
        let nullIcon = <Icon type="exclamation-circle-o" style={{marginRight: '5px', fontSize: '16px'}} />
        return (
            <div className='Forget'>
                <div className='Forget_form'>
                    <div className='formB'>
                        <div className='logoBox'>
                            <a href='http://www.jingpipei.com/' className='logo_Pic'></a>
                            <div className='txtLogo'>
                                <div className='app_name'></div>
                                <div className='netUrl'>JINGPIPEI.COM</div>
                            </div>
                        </div>
                        <div className='left_box'>
                            <div className='loginType'>
                            <span className={this.loginTypeClass('proving_login')}>
                                验证码手机号
                                {this.hasBorderFn('proving_login') ? <div className='borderBottom'></div> : <div className='borderBottom' style={{background: '#fff'}}></div>}
                            </span>
                                <span className={this.loginTypeClass('password_login')}>
                                重置密码
                                    {this.hasBorderFn('password_login') ? <div className='borderBottom'></div> : <div className='borderBottom' style={{background: '#fff'}}></div>}
                            </span>
                            </div>
                            {typeActive === 'proving_login' ? <div>
                                <div className='phone formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="请输入手机号码" onChange={(e) => this.formChange(e, 'phone')} key={curKey} value={formList.phone} onBlur={this.phoneIntBlur}/>
                                </div>
                                {this.isNullFn('phone') ? <div className='nullTest'>
                                    {nullIcon}
                                    请输入手机号码
                                </div> : null}
                                <div className='picProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="请输入图片内容" onChange={(e) => this.formChange(e, 'imageHtml')} key={curKey} value={formList.imageHtml}/>
                                    <img src={`data:image/png;base64,${picBase64}`} onClick={this.toggleImgFn}/>
                                </div>
                                {this.isNullFn('imageHtml') ? <div className='nullTest'>
                                    {nullIcon}请输入验证码
                                </div> : null}
                                {this.hasBorderFn('proving_login') ? <div className='phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="请输入手机验证码" onChange={(e) => this.formChange(e, 'phoneHtml')} key={curKey} value={formList.phoneHtml}/>
                                    {countDownToggle ? <span className='obtain activeCount'>{`已发送(${defCount})秒`}</span> : again ? <span className='obtain' onClick={this.obtainFn}>重新发送</span> : <span className='obtain' onClick={this.obtainFn}>获取验证码</span>}
                                </div> : null}
                                {this.isNullFn('phoneHtml') ? <div className='nullTest'>
                                    {nullIcon}请输入手机验证码
                                </div> : null}
                            </div> : null}
                            {typeActive === 'password_login' ? <div>
                                <div className='rePassWord phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="输入新密码" onChange={(e) => this.formChange(e, 'first')} key={curKey} value={formList.first} />
                                </div>
                                {this.isNullFn('first') ? <div className='nullTest'>
                                    {nullIcon}请输入新密码
                                </div> : this.passwordVerifyFail('first') ? <div className='nullTest'>
                                    {nullIcon}密码必须为数字与字母组合长度8-16个字符
                                </div> : null}
                                <div className='rePassWord phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="再次输入新密码" onChange={(e) => this.formChange(e, 'second')} key={curKey} value={formList.second} />
                                </div>
                                {this.isNullFn('second') ? <div className='nullTest'>
                                    {nullIcon}请再次输入新密码
                                </div> : this.passwordVerifyFail('second') ? <div className='nullTest'>
                                    {nullIcon}密码必须为数字与字母组合长度8-16个字符
                                </div> : null}
                            </div> : null}
                            <div className='forget'></div>
                            <div className='submit'>
                                {typeActive === 'proving_login' ? <Button onClick={this.onSubmit}>找回密码</Button> : <Button onClick={this.onOk}>确定</Button>}
                            </div>
                        </div>
                        <div className='cutOffRule'>
                            <div className='line_top'></div>
                            <div className='or'>or</div>
                        </div>
                        <div className='toRegister'>
                            <div className='Link' id='forget_Link'>
                                <Button><Link to="/login">返回登录 <Icon type="arrow-right" style={{marginLeft: '5px'}}/></Link></Button>
                            </div>
                        </div>
                    </div>
                    <div className='footerExplain'>
                        <div className='itemExplain'>
                            <div>
                                <div className="icon icon1"></div>
                            </div>
                            <div className='text'>海量候选人推荐</div>
                        </div>
                        <div className='itemExplain'>
                            <div>
                                <div className="icon icon2"></div>
                            </div>
                            <div className='text'>多对一推荐候选人面试</div>
                        </div>
                        <div className='itemExplain'>
                            <div>
                                <div className="icon icon3"></div>
                            </div>
                            <div className='text'>按效果付费，无面试不收费</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default ForgetPassword
