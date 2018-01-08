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
                frist: '',
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
    formBoxHeight (type) {
        let doc = document
        let height = 358
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
                if (formList[k] === '' && k !== 'frist' && k !== 'second') {
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
        }, 1000)
    },
    // 确定
    onOk () {
        this.setState({
            hasSubmit: true
        }, () => {
            let {formList} = this.state
            if (formList.frist === '' || formList.second === '') {
                message.warning('请填写完整密码！')
                return false
            }
            if (formList.frist !== formList.second) {
                message.warning('您两次输入的密码不相等，请重新输入！')
                return false
            } else if (formList.frist === formList.second && formList.frist !== '' && formList.second !== '') {
                let formData = {}
                formData.mobile = formList.phone
                formData.code = formList.phoneHtml
                formData.newPassword = formList.second
                this.reqRenameLogin(formData)
            }
        })
    },
    // 重置密码接口
    reqRenameLogin (formData) {
        let URL = 'member/company/resetPasswordByCode'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('密码设置成功，请登陆!')
                window.location.hash = 'login'
            } else {
                message.error('系统错误!')
            }
        })
    },
    phoneIntBlur (e) {
        let {formList} = this.state
        let val = e.target.value
        if (val !== '') {
            let reg = /^1[3|4|5|7|8][0-9]{9}$/
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
    render () {
        let {curKey, formList, countDownToggle, defCount, again, typeActive, picBase64} = this.state
        let nullIcon = <Icon type="exclamation-circle-o" style={{marginRight: '5px', fontSize: '16px'}} />
        return (
            <div className='Forget'>
                <div className='Forget_form'>
                    <div className='formB'>
                        <div className='logoBox'>
                            <span className='logo_Pic'></span>
                            <div>
                                <div className='app_name'>鲸城</div>
                                <div className='netUrl'>JINGCHENG.COM</div>
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
                                    {this.isNullFn('phone') ? <div className='nullTest'>
                                        {nullIcon}
                                        请输入手机号码
                                    </div> : null}
                                </div>
                                <div className='picProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="请输入图片内容" onChange={(e) => this.formChange(e, 'imageHtml')} key={curKey} value={formList.imageHtml}/>
                                    <img src={`data:image/png;base64,${picBase64}`} onClick={this.toggleImgFn}/>
                                    {this.isNullFn('imageHtml') ? <div className='nullTest'>
                                        {nullIcon}请输入验证码
                                    </div> : null}
                                </div>
                                {this.hasBorderFn('proving_login') ? <div className='phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="请输入手机验证码" onChange={(e) => this.formChange(e, 'phoneHtml')} key={curKey} value={formList.phoneHtml}/>
                                    <span className={countDownToggle ? 'obtain activeCount' : 'obtain'} onClick={this.obtainFn}>
                                {countDownToggle ? `已发送(${defCount})秒` : again ? '重新发送' : '获取验证码'}
                            </span>
                                    {this.isNullFn('phoneHtml') ? <div className='nullTest'>
                                        {nullIcon}请输入手机验证码
                                    </div> : null}
                                </div> : null}
                            </div> : null}
                            {typeActive === 'password_login' ? <div>
                                <div className='rePassWord phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="输入新密码" onChange={(e) => this.formChange(e, 'frist')} key={curKey} value={formList.frist} />
                                    {this.isNullFn('frist') ? <div className='nullTest'>
                                        {nullIcon}密码长度必须大于6位
                                    </div> : null}
                                </div>
                                <div className='rePassWord phoneProving formItem'>
                                    <span className='icon'></span>
                                    <Input placeholder="再次输入新密码" onChange={(e) => this.formChange(e, 'second')} key={curKey} value={formList.second} />
                                    {this.isNullFn('second') ? <div className='nullTest'>
                                        {nullIcon}密码长度必须大于6位
                                    </div> : null}
                                </div>
                            </div> : null}
                            <div className='forget'></div>
                            <div className='submit'>
                                {typeActive === 'proving_login' ? <Button onClick={this.onSubmit}>找回密码</Button> : <Button onClick={this.onOk}>确定</Button>}
                            </div>
                        </div>
                        <div className='cutOffRule' style={{height: this.formBoxHeight('String'), paddingTop: this.formBoxHeight('Number') * 0.22}}>
                            <div className='line_top'></div>
                            <div className='or'>or</div>
                            <div className="line_bottom"></div>
                        </div>
                        <div className='toRegister' style={{height: this.formBoxHeight('String'), paddingTop: this.formBoxHeight('Number') * 0.55}}>
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