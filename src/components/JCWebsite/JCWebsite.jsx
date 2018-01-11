import React from 'react'
import {Carousel} from 'antd'
import $ from 'jquery'
import './JCWebsite.less'

let JCWebsite = React.createClass({
    getInitialState () {
        return {
            curCarousel: '1',
            isCarousel: false,
            showErWeiMa: false,
            isALShow: false
        }
    },
    componentDidMount () {
        let _th = this
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
    itemClickFn (router) {
        window.location.hash = router
    },
    render () {
        let {curCarousel, isCarousel, showErWeiMa, isALShow} = this.state
        return (
            <div className='jcWebsite' onClick={this.appBoxClick}>
                <div className='header_jc'>
                    <span className='logo'> </span>
                    <div className='operate'>
                        <a href='javascript:;' className='erWeiMa' onClick={this.showErWeiMaFn}>
                            APP下载
                            <span> </span>
                            {showErWeiMa ? <div> </div> : null}
                        </a>
                        <a href='javascript:;'>
                            关于我们
                            <span> </span>
                        </a>
                        <a href='javascript:;' onClick={() => this.itemClickFn('register')}>
                            注 册
                            <span> </span>
                        </a>
                        <a href='javascript:;' className='login_jc' onClick={() => this.itemClickFn('login')}>
                            登 录
                        </a>
                    </div>
                </div>
                {
                    isCarousel
                    ? <Carousel autoplay={true} className={curCarousel === '1' ? 'twoClaByCar' : ''} beforeChange={this.changeCarousel}>
                            <div className='bannerRotate'>
                                <div className='banner2'>
                                    <div className='textBox'>
                                        <div className='title'>一家有温度的企业综合服务商</div>
                                        <div className='cont'>
                                            <span>鲸AL</span>
                                            <span>鲸服务</span>
                                            <span>鲸智付</span>
                                            <span>鲸信用</span>
                                        </div>
                                        <div className='knowMore'>了解更多</div>
                                    </div>
                                    <span className='xuanZhuan'>
                                        <span></span>
                                    </span>
                                </div>
                            </div>
                            <div className='banner1'>
                                <div className='textBox'>
                                    <div className='title'>首创鲸AL运算系统</div>
                                    <div className='cont'>配合有温度的百万小鲸经纪人优质服务</div>
                                    <div className='knowMore'>了解更多</div>
                                </div>
                                <span className='point1 point1Car'> </span>
                                <span className='point2 point2Car'> </span>
                                <div className='line1 line1Car'> </div>
                                <div className='line2 line2Car'> </div>
                                <div className='line3 line3Car'> </div>
                                <div className='line4 line4Car'> </div>
                            </div>
                        </Carousel>
                        : <div>
                            {curCarousel === '1' ? <div className='banner1'>
                                {isALShow ? <div className='textBox'>
                                    <div className='title'>首创鲸AL运算系统</div>
                                    <div className='cont'>配合有温度的百万小鲸经纪人优质服务</div>
                                    <div className='knowMore'>了解更多</div>
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
                    <div className='textBox1'>
                        <div className='title'>优质合作企业</div>
                        <div className='cont'>用心服务  共赢辉煌</div>
                    </div>
                </div>
                <div className='footer'>
                    <div className='email'>
                        <span className='com'>Email: hello@digital.com</span>
                        <span className='ads'>Address: Gaffney St, Melbourne</span>
                    </div>
                    <div className='tel'>
                        <span className='phone'>Tel: +460 472 888 012</span>
                        <span className='bianHao'>©Copyright 2016. Design by Xquter</span>
                    </div>
                    <span className='comAdress'>JINGCHENG.COM</span>
                </div>
            </div>
        )
    }
})

export default JCWebsite
