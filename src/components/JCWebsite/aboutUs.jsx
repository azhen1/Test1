import React from 'react'
import {Carousel, message} from 'antd'
import {Link} from 'react-router'
import $ from 'jquery'
import './aboutUs.less'
import {postRequest} from '../../common/ajax'

let AboutUs = React.createClass({
    getInitialState () {
        return {
            curCarousel: '1',
            isCarousel: false,
            showErWeiMa: false,
            isALShow: false,
            hasUser: false
        }
    },
    componentDidMount () {
        let _th = this
        _th.checkUuid()
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
    checkUuid () {
        let sessionUuid = window.localStorage.getItem('sessionUuid')
        let URL = 'member/company/uuidCheck'
        let formData = {}
        let _th = this
        if (sessionUuid === null) {
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
    showMore () {
        var hh = $('.banner').css('height')
        $('body,html').animate({scrollTop: hh}, 500)
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    render () {
        let {curCarousel, isCarousel, showErWeiMa, isALShow, hasUser} = this.state
        return (
            <div className='app_Box' onClick={this.appBoxClick}>
                <div className='header'>
                    <Link to="/JCWebsite" className='logo'> </Link>
                    <div className='operate'>
                        <Link to='/'>
                            首页
                            <span> </span>
                        </Link>
                        <a href='javascript:;' className='erWeiMa' onClick={this.showErWeiMaFn}>
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
                        <Link className="on">
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
                <div className="banner">
                    <div className="bigLogo">
                        <span></span>
                    </div>
                    <div className="textBox">
                        <div className="title">鲸匹配™—求职租房一站式服务平台</div>
                        <div className="cont">
                            <p>主打共享+匹配经济，通过自主研发的鲸AI智能匹配系统，</p>
                            <p>采用复合式ERP管理+移动互联匹配模式，</p>
                            <p>定位于颠覆两个行业：招聘和租房。</p>
                        </div>
                    </div>
                    <div className="showMore" onClick={this.showMore}></div>
                </div>
                <div className="container">
                    <div className="boxIntro">
                        <div className="title">公司简介</div>
                        <p>鲸匹配™——求职租房一站式服务平台，隶属于杭州鲸城网络科技有限公司，</p>
                        <p>主打共享+匹配经济，通过自主研发的鲸AI智能匹配系统，</p>
                        <p>采用复合式ERP管理+移动互联匹配模式，定位于颠覆两个行业：招聘和租房。</p>
                        <p>从相“加”到相“融”，创造一个新的体系——招聘生态圈，</p>
                        <p>鲸匹配不仅为现有企业提供更高效、优质的招聘解决方案，</p>
                        <p>并将通过赋能招聘和租房体系的“影子”参与者，</p>
                        <p>释放其潜在储备资源的经济效力和社会价值。</p>
                    </div>
                    <div className="boxIntro">
                        <div className="title">主营业务</div>
                        <p>鲸匹配™——人工+智能AI小鲸机器人，双核双动力，有深度、更有温度！</p>
                        <p>融合大数据智能招聘、智慧信用租房管理系统，合二为一，</p>
                        <p>旨在为求职者、招聘企业、租客、个人房东、物业服务企业等用户，</p>
                        <p>搭建一个综合性交互平台，为用户提供精准、高效、优质的招聘、租房一站式服务，</p>
                        <p>快速求职、租房，实现人尽其才、物尽其用！</p>
                    </div>
                    <div className="boxIntro">
                        <div className="title">企业文化</div>
                        <p>鲸匹配™品牌推崇“共享互信，高效匹配，协同共赢”的理念，为求职者匹配诚信企业岗位，</p>
                        <p>为招聘企业匹配精准求职简历，为租客匹配真实个人房源，为个人房东匹配真实租客，</p>
                        <p>杜绝一切骚扰信息，创新招聘合作理念，重塑租房三方关系，打造生态闭环，推动社会互信健康发展！</p>
                    </div>
                    <div className="boxClassify">
                        <div className="classifyList">
                            <span className="img img1"></span>
                            <div className="title">产品定位</div>
                            <p>创新型，具有颠覆性的互联网招聘生态平台</p>
                        </div>
                        <div className="classifyList">
                            <span className="img img2"></span>
                            <div className="title">产品理念</div>
                            <p>共享互信，高效匹配，协同共赢</p>
                        </div>
                    </div>
                    <div className="boxClassify">
                        <div className="classifyList">
                            <span className="img img3"></span>
                            <div className="title">产品价值</div>
                            <p>科技领先，理念共享，产品共赢</p>
                        </div>
                        <div className="classifyList">
                            <span className="img img4"></span>
                            <div className="title">产品愿景</div>
                            <p>打造成为国内招聘生态圈唯一供应商</p>
                        </div>
                    </div>
                    <div className="boxIntro">
                        <div className="title">联系我们</div>
                        <p>Email: whalecity@jingpipei.com</p>
                        <p>客服：kf@jingpipei.com</p>
                        <p>战略、市场、销售合作：market@jingpipei.com</p>
                        <p>地址：浙江省杭州市江干区东宁路553号东溪德必易园</p>
                    </div>
                </div>
            </div>
        )
    }
})

export default AboutUs
