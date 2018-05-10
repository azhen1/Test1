import React from 'react'
import {Link} from 'react-router'
import {Carousel, message} from 'antd'
import $ from 'jquery'
import './JCWebsite.less'
import {postRequest} from '../../common/ajax'

let JCWebsite = React.createClass({
    getInitialState () {
        return {
            curCarousel: '1',
            isCarousel: false,
            showErWeiMa: false,
            isALShow: false,
            initCarousel: '1',
            hasUser: false
        }
    },
    componentDidMount () {
        let appElem = document.getElementsByClassName('app_Box')[0]
        let companyBtnElem = document.getElementsByClassName('companyLoginBtn')[0]
        let isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)
        if (isMobile) {
            appElem.classList.add('mobile_app_Box')
            companyBtnElem.style.display = 'block'
        } else {
            appElem.classList.remove('mobile_app_Box')
            companyBtnElem.style.display = 'none'
        }
        let _th = this
        if (!window.sessionStorage.getItem('animate')) {
            window.sessionStorage.setItem('animate', '1')
            $('.point1').animate({top: '58%'}, 'slow')
            $('.point2').animate({top: '50%'}, 'slow', function () {
                $('.line1').animate({width: '11%'}, 500, function () {
                    $('.line2').animate({width: '37%'}, 1000, function () {
                        $('.line3').animate({width: '28%'}, 1000, function () {
                            $('.line4').animate({width: '18%'}, 500, function () {
                                _th.setState({
                                    isALShow: true
                                }, () => {
                                    setTimeout(function () {
                                        _th.setState({
                                            curCarousel: '0'
                                        }, () => {
                                            let count = 0
                                            let timer = setInterval(function () {
                                                if (count < -1500) {
                                                    clearInterval(timer)
                                                    _th.setState({
                                                        isCarousel: true
                                                    })
                                                    return false
                                                }
                                                $('.zhiZhen').css('transform', `rotate(${count}deg)`)
                                                count = count - 3
                                            }, 4)
                                        })
                                    }, 600)
                                })
                            })
                        })
                    })
                })
            })
        } else {
            $('.point1').animate({top: '58%'}, 0)
            $('.point2').animate({top: '50%'}, 0)
            $('.line1').animate({width: '11%'}, 0)
            $('.line2').animate({width: '37%'}, 0)
            $('.line3').animate({width: '28%'}, 0)
            $('.line4').animate({width: '18%'}, 0)
            _th.setState({
                initCarousel: '0',
                curCarousel: '0',
                isCarousel: true
            })
        }
        _th.checkUuid()
    },
    checkUuid () {
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let memberId = window.localStorage.getItem('memberId')
        let URL = 'member/company/uuidCheck'
        let formData = {}
        let _th = this
        if (this.isNull(sessionUuid) || this.isNull(memberId)) {
            _th.setState({
                hasUser: false
            })
        } else {
            formData.uuid = sessionUuid
            postRequest(false, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    _th.setState({
                        hasUser: true
                    })
                } else {
                    _th.setState({
                        hasUser: false
                    })
                }
            })
        }
    },
    changeCarousel (from, to) {
        this.setState({
            curCarousel: `${to}`
        })
    },
    showErWeiMaFn () {
        this.setState({
            showErWeiMa: !this.state.showErWeiMa
        })
    },
    appBoxClick (e) {
        let target = e.target
        let className = target.className
        if (className !== undefined && className === 'erWeiMa') {
            return false
        } else {
            this.setState({
                showErWeiMa: false
            })
        }
    },
    showMore () {
        var hh = $('.bannerRotate').css('height')
        $('body,html').animate({scrollTop: hh}, 500)
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    isNull (val) {
        let result = false
        if (val === undefined || val === null || val === '') {
            result = true
        }
        return result
    },
    render () {
        let {curCarousel, isCarousel, showErWeiMa, isALShow, initCarousel, hasUser} = this.state
        return (
            <div className='app_Box' onClick={this.appBoxClick}>
                <div className="companyLoginBtn" onClick={() => this.itemClickFn('login')}>企业登录</div>
                <div className='header'>
                    <span className='logo'> </span>
                    <div className='operate'>
                        <a href='' className='on'>
                            首页
                            <span> </span>
                        </a>
                        <a href='#' className='erWeiMa' onClick={this.showErWeiMaFn}>
                            APP下载
                            <span> </span>
                            {showErWeiMa ? <div className='erWeiMaMain'>
                                <div className="code">
                                    <i>Android下载</i>
                                </div>
                                <div className="code IOS">
                                    <i>iOS下载</i>
                                </div>
                            </div> : null}
                        </a>
                        <Link to="/aboutUs">
                            关于我们
                            <span> </span>
                        </Link>
                        {hasUser ? <Link to="/positionManager/recruitIng">
                            进入企业后台
                            <span> </span>
                        </Link> : <Link to="/login">
                            企业登录
                            <span> </span>
                        </Link>}

                    </div>
                </div>
                {
                    isCarousel
                        ? <div>
                            {initCarousel === '1' ? <Carousel autoplay={false} className={curCarousel === '1' ? 'twoClaByCar' : ''} beforeChange={this.changeCarousel}>
                                <div className='bannerRotate'>
                                    <div className='banner2'>
                                        <div className='textBox'>
                                            <div className='title'>一家有温度的企业综合服务商</div>
                                            <div className='cont'>
                                                <span>鲸AI</span>
                                                <span>鲸服务</span>
                                                <span>鲸智付</span>
                                                <span>鲸信用</span>
                                            </div>
                                            <div className='knowMore' onClick={this.showMore}>了解更多</div>
                                        </div>
                                        <span className='xuanZhuan'>
                                        <span></span>
                                    </span>
                                    </div>
                                </div>
                                <div className='banner1'>
                                    <div className='textBox'>
                                        <div className='title'>首创鲸AI运算系统</div>
                                        <div className='cont'>配合有温度的百万小鲸经纪人优质服务</div>
                                        <div className='knowMore' onClick={this.showMore}>了解更多</div>
                                    </div>
                                    <span className='point1 point1Car'> </span>
                                    <span className='point2 point2Car'> </span>
                                    <div className='line1 line1Car'> </div>
                                    <div className='line2 line2Car'> </div>
                                    <div className='line3 line3Car'> </div>
                                    <div className='line4 line4Car'> </div>
                                </div>
                            </Carousel> : <Carousel autoplay={false} className={curCarousel === '0' ? 'twoClaByCar' : ''} beforeChange={this.changeCarousel}>
                                <div className='banner1'>
                                    <div className='textBox'>
                                        <div className='title'>首创鲸AI运算系统</div>
                                        <div className='cont'>配合有温度的百万小鲸经纪人优质服务</div>
                                        <div className='knowMore' onClick={this.showMore}>了解更多</div>
                                    </div>
                                    <span className='point1 point1Car'> </span>
                                    <span className='point2 point2Car'> </span>
                                    <div className='line1 line1Car'> </div>
                                    <div className='line2 line2Car'> </div>
                                    <div className='line3 line3Car'> </div>
                                    <div className='line4 line4Car'> </div>
                                </div>
                                <div className='bannerRotate'>
                                    <div className='banner2'>
                                        <div className='textBox'>
                                            <div className='title'>一家有温度的企业综合服务商</div>
                                            <div className='cont'>
                                                <span>鲸AI</span>
                                                <span>鲸服务</span>
                                                <span>鲸智付</span>
                                                <span>鲸信用</span>
                                            </div>
                                            <div className='knowMore' onClick={this.showMore}>了解更多</div>
                                        </div>
                                        <span className='xuanZhuan'>
                                        <span></span>
                                    </span>
                                    </div>
                                </div>
                            </Carousel>}
                        </div>
                        : <div>
                            {curCarousel === '1' ? <div className='banner1'>
                                {isALShow ? <div className='textBox'>
                                    <div className='title'>首创鲸AI运算系统</div>
                                    <div className='cont'>配合有温度的百万小鲸经纪人优质服务</div>
                                    <div className='knowMore' onClick={this.showMore}>了解更多</div>
                                </div> : null}
                                <span className='point1'> </span>
                                <span className='point2'> </span>
                                <div className='line1'> </div>
                                <div className='line2'> </div>
                                <div className='line3'> </div>
                                <div className='line4'> </div>
                            </div> : null}
                            {
                                curCarousel === '0' ? <div className='bannerRotate'>
                                <span className='xuanZhuan'>
                                    <span className='dianNaoDi'>
                                        <span className='biaoPan'> </span>
                                        <span className='suoDing'> </span>
                                        <span className='zhiZhen'> </span>
                                    </span>
                                </span>
                                </div> : null
                            }
                        </div>

                }

                <div className='jieFang'>
                    <div className='textBox'>
                        <div className='title'>重新定义"解放劳动力"</div>
                        <div className='cont'>企业、求职、HR给你招聘解决方案</div>
                    </div>
                </div>
                <div className='guanJia'>
                    <div className='textBox'>
                        <div className='title'>企业一站式管家</div>
                        <div className='cont'>鲸AI系统</div>
                        <div className='item'>鲸选简历</div>
                        <div className='item'>鲸推简历</div>
                        <div className='item'>鲸员工管理系统</div>
                    </div>
                    <div className='textBox1'>
                        <div className='title'>一对一服务</div>
                        <div className='cont'>鲸AI系统</div>
                        <div className='item'>鲸选企业</div>
                        <div className='item'>鲸推房源</div>
                        <div className='item'>鲸员管理系统</div>
                    </div>
                </div>
                <div className='wenDu'>
                    <div className='textBox'>
                        <div className='title'>有温度的“鲸匹配”</div>
                        <div className='cont'>鲸AI算法＋人工小鲸全程一对一跟踪</div>
                    </div>
                </div>
                <div className='jingZhun'>
                    <div className='textBox'>
                        <div className='title'>精准的“服务”</div>
                        <div className='cont'>鲸AI服务对象</div>
                    </div>
                </div>
                <div className='footer'>
                    <div className='weixinCode'>
                        <span></span>
                        <h6>关注公众号，加入HR成长社群</h6>
                    </div>
                    <div className='email'>
                        <span className='com'>Email: whalecity@jingpipei.com</span>
                        <span className='ads'>Address: 浙江省杭州市江干区东宁路553号东溪德必易园</span>

                    </div>
                    <div className='email'>
                        <span className='com'>客服：kf@jingpipei.com</span>
                        <span className='ads'>©Copyright 2018  浙ICP备18002286号</span>
                    </div>
                    <div className="email">
                        <span className='com'>战略、市场、销售合作：market@jingpipei.com</span>
                    </div>
                    <span className='comAdress'>jingpipei.com</span>
                </div>
            </div>
        )
    }
})

export default JCWebsite
