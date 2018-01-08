import React from 'react'
import {Input, Button, message, Icon} from 'antd'
import {Link} from 'react-router'
import {getRequest, postRequest} from '../../common/ajax'
import './user.less'
import Base64 from '../../common/base64Decode'
import yiHuoFn from '../../common/yiHuoFn'

const Register = React.createClass({
    getInitialState () {
        return {
            formList: {
                phone: '',
                imageHtml: '',
                passWord: '',
                phoneHtml: ''
            },
            hasSubmit: false,
            typeActive: 'proving_login',
            curKey: '',
            countDownToggle: false,
            defCount: 60,
            again: false,
            imgValidateStr: '',
            count: 0,
            picBase64: '',
            captchaCode: '',
            memberId: ''
        }
    },
    componentDidMount () {
        this.toggleImgFn()
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
    // 表单输入
    formChange (e, type) {
        let val = e.target.value
        let {formList} = this.state
        // if (type === 'passWord') {
        // val = val.split('')
        // val.forEach((v, index) => {
        // val[index] = '*'
                    // })
        // val = val.join('')
        // }
        formList[type] = val
        this.setState({
            formList: {...formList}
        })
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
            let {formList} = this.state
            let hasNull = false
            let values = Object.values(formList)
            values.map((v, index) => {
                if (v === '') {
                    hasNull = true
                }
            })
            if (hasNull) {
                message.warning('你有信息尚未填写')
                this.setState({
                    count: ++this.state.count
                })
            } else {
                let formData = {}
                formData.mobile = formList.phone
                formData.password = formList.passWord
                formData.code = formList.phoneHtml
                this.reqRegister(formData)
            }
        })
    },
    // 注册接口
    reqRegister (formData) {
        let URL = 'member/company/codeRegister'
        let _th = this
        postRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                message.success('注册成功，请登录!')
                _th.setState({
                    hasSubmit: false,
                    memberId: data.memberId
                }, () => {
                    let {memberId} = _th.state
                    window.location.hash = `certification?memberId=${memberId}`
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
    // '发送验证码' 交互验证
    isToggleFn () {
        let {formList, countDownToggle} = this.state
        return countDownToggle && formList.phone !== '' && formList.imageHtml !== '' ? true : false
    },
    render () {
        let {curKey, formList, defCount, again, picBase64} = this.state
        let nullIcon = <Icon type="exclamation-circle-o" style={{marginRight: '5px', fontSize: '16px'}} />
        return (
            <div className='register'>
                <div className='register_form'>
                    <div className='formB'>
                        <div className='logoBox'>
                            <span className='logo_Pic'></span>
                            <div>
                                <div className='app_name'>鲸城</div>
                                <div className='netUrl'>JINGCHENG.COM</div>
                            </div>
                        </div>
                        <div className='left_box'>
                            <div className='phone formItem'>
                                <span className='icon'></span>
                                <Input placeholder="请输入手机号码" onChange={(e) => this.formChange(e, 'phone')}
                                       onBlur={this.phoneIntBlur}
                                       key={curKey} value={formList.phone}/>
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
                                <span className={this.isToggleFn() ? 'obtain activeCount' : 'obtain'} onClick={this.obtainFn}>
                                {this.isToggleFn() ? `已发送(${defCount})秒` : again ? '重新发送' : '获取验证码'}
                            </span>
                                {this.isNullFn('phoneHtml') ? <div className='nullTest'>
                                    {nullIcon}请输入手机验证码
                                </div> : null}
                            </div> : null}
                            <div className='phoneProving formItem'>
                                <span className='icon'></span>
                                <Input placeholder="设置密码" onChange={(e) => this.formChange(e, 'passWord')} key={curKey} value={formList.passWord} />
                                {this.isNullFn('passWord') ? <div className='nullTest'>
                                    {nullIcon}密码长度必须大于6位
                                </div> : null}
                            </div>
                            <div className='forget'></div>
                            <div className='submit'>
                                <Button onClick={this.onSubmit}>注册</Button>
                            </div>
                        </div>
                        <div className='cutOffRule' style={{height: this.formBoxHeight('String')}}>
                            <div className='line_top'></div>
                            <div className='or'>or</div>
                            <div className="line_bottom"></div>
                        </div>
                        <div className='toRegister' style={{height: this.formBoxHeight('String'), paddingTop: this.formBoxHeight('Number') * 0.5}}>
                            <div className='noUser'>
                                已有账号：
                            </div>
                            <div className='Link'>
                                <Button><Link to="/login">直接登录 <Icon type="arrow-right" style={{marginLeft: '5px'}}/></Link></Button>
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

export default Register
