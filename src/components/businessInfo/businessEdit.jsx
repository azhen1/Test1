import React from 'react'
import {Icon, Input, Upload, Modal, message, Pagination, Select} from 'antd'
import './businessInfo.less'
import defaultHeadImg from '../../images/default_head.png'
import util from '../../common/util'
import addressData from '../../common/area'
import {getRequest, postRequest, deleteRequest} from '../../common/ajax'

const Option = Select.Option
const {TextArea} = Input
function beforeUpload (file) {
    const rightType = (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/gif')
    if (!rightType) {
        message.error('请上传jpg/jpeg/png格式的图片！')
        return rightType
    }
    const rightSize = file.size < 2 * 1024 * 1024
    if (!rightSize) {
        message.error('上传的图片不能大于2MB！')
        return rightSize
    }
    return rightType && rightSize
}
let BusinessEdit = React.createClass({
    getInitialState () {
        return {
            isEditDes: false,
            curDesHtml: '一句话介绍公司',         //  公司签名
            tongJiList: {},
            curTab: 'homePage',
            previewVisible: false,
            previewImage: '',
            fileList: [],
            infolist: {
                name: '',
                introduceByBis: '',
                serviceByBis: ''
            },
            certiState: 0,
            hasSave: false,
            itemArr: [],
            positionListAll: 0,
            publishPosition: {                 // 选择地址时存放省市区{province:'浙江省',city:'杭州市',county:'江干区',building:'火车东站'}，如果是直辖市county为空{province:'北京市',city:'东城区',county:'',building:'天安门广场'}
                province: undefined,           // 省
                city: undefined,               // 市
                county: undefined,             // 区
                building: undefined            // 详细地址
            },
            citySelectList: [],
            countySelectList: [],
            roadSelectList: [],
            municipality: false,               // 判断是否是直辖市
            positionArr: [],                // 存放公司所有地址列表。格式[{province:'浙江省',city:'杭州市',county:'江干区',building:'火车东站',id:1}]对于直辖市province和city存一样的值。
            daoAddHasNull: false,
            count: 0,
            addessInvaild: false,
            hasDiZhiEdit: false,
            indexDiZhiEdit: -1,
            previewVisibleIcon: false,
            previewImageIcon: '',
            fileListIcon: [],
            logoPic: '',                        // logo图片url地址
            environmentPic: '',                  // 公司环境图片url地址
            hasClickEdit: false,
            environmentPicsList: []
        }
    },
    componentWillReceiveProps (nextProps) {
        // 如果prop发生了变化 那么下面基于props里属性的方法都要重新执行
        // 根据memberId获取职位招聘的情况
        this.reqCurMounthData()
        // 根据memberId获取公司地址
        this.getCompanyAdress()
        this.reqPositionList(1)
        let {businssInfoAllInfo, hasNew} = nextProps
        let {infolist, certiState, curDesHtml} = this.state
        if (!hasNew) {
            infolist.name = businssInfoAllInfo.name
            infolist.introduceByBis = businssInfoAllInfo.introduce
            infolist.serviceByBis = businssInfoAllInfo.mainBusiness
            certiState = businssInfoAllInfo.state
            curDesHtml = businssInfoAllInfo.signature
            this.setState({
                logoPic: businssInfoAllInfo.logoPic,
                infolist: infolist,
                curDesHtml: curDesHtml,
                certiState: certiState,
                environmentPic: businssInfoAllInfo.environmentPic,
                environmentPicsList: businssInfoAllInfo.environmentPics ? businssInfoAllInfo.environmentPics : ['']
            })
        } else {
            infolist.name = businssInfoAllInfo.name
            certiState = businssInfoAllInfo.state
            this.setState({
                infolist: infolist,
                certiState: certiState
            })
        }
    },
    canEditFn () {
        let {hasNew} = this.props
        let {hasClickEdit} = this.state
        return hasNew || hasClickEdit ? true : false
    },
    // 获取公司地址
    getCompanyAdress () {
        let URL = 'member/companyAddress/getAddresses'
        let _th = this
        let {positionArr} = _th.state
        let formData = {}
        positionArr = []
        formData.memberId = window.localStorage.getItem('memberId')
        let hasMemberId = formData.memberId ? true : false
        if (hasMemberId) {
            getRequest(true, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    let data = res.data
                    data.length > 0 && data.map((v, index) => {
                        let item = {}
                        if (v.province === v.city) {
                            addressData.map((vC, indexC) => {
                                if (vC.id === v.province) {
                                    item.province = vC.value
                                    item.city = vC.value
                                    vC.children.map((vCC, indexCC) => {
                                        if (vCC.id === v.district) {
                                            item.county = vCC.value
                                        }
                                    })
                                }
                            })
                        } else {
                            addressData.map((vC, indexC) => {
                                if (vC.id === v.province) {
                                    item.province = vC.value
                                    vC.children.map((vCC, indexCC) => {
                                        if (vCC.id === v.city) {
                                            item.city = vCC.value
                                            vCC.children.map((vCCC, indexCCC) => {
                                                if (vCCC.id === v.district) {
                                                    item.county = vCCC.value
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        item.building = v.address
                        item.id = v.id
                        positionArr.push(item)
                    })
                    _th.setState({
                        positionArr: positionArr
                    }, () => {
                        let {positionArr} = _th.state
                        if (positionArr.length > 0) {
                            _th.drawMapToggleFn(positionArr)
                        }
                    })
                } else if (code !== 401) {
                    message.error(res.message)
                }
            })
        }
    },
    // 添加公司地址
    addCompanyAdress (formData) {
        let URL = 'member/companyAddress/insertCheckInformation'
        let _th = this
        let {positionArr, publishPosition} = _th.state
        publishPosition.building = undefined
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('添加成功!')
                _th.setState({
                    publishPosition: publishPosition
                })
                _th.getCompanyAdress()
            } else {
                message.error(res.message)
                positionArr.pop()
                _th.setState({
                    publishPosition: publishPosition
                })
                _th.getCompanyAdress()
            }
        })
    },
    // 修改公司地址
    editCompanyAdress (formData) {
        let URL = 'member/companyAddress/update'
        let _th = this
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('修改成功!')
                _th.getCompanyAdress()
            } else {
                message.error(res.message)
            }
        })
    },
    // 查询当前职位list
    reqPositionList (page) {
        let URL = 'job/platformPosition/queryByPage'
        let _th = this
        let formData = {}
        formData.companyId = window.localStorage.getItem('memberId')
        formData.page = page
        formData.state = 1
        formData.pageSize = 10
        let hasMemberId = formData.companyId ? true : false
        if (hasMemberId) {
            getRequest(true, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    _th.setState({
                        itemArr: [...res.data.list],
                        positionListAll: res.data.total
                    })
                } else if (code !== 401) {
                    message.error(res.message)
                }
            })
        }
    },
    // 删除公司地址
    deleteCompanyAdress (formData) {
        let URL = 'member/companyAddress/delete'
        let _th = this
        deleteRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('修改成功!')
                _th.getCompanyAdress()
            } else {
                message.error(res.message)
            }
        })
    },
    // 查询招聘职位；当月面试，当月录用率数据
    reqCurMounthData () {
        let URL = 'job/platformInterview/getDate'
        let _th = this
        let formData = {}
        formData.memberId = window.localStorage.getItem('memberId')
        let hasMemberId = formData.memberId ? true : false
        if (hasMemberId) {
            getRequest(true, URL, formData).then(function (res) {
                let code = res.code
                if (code === 0) {
                    _th.setState({
                        tongJiList: {...res.data}
                    })
                } else if (code !== 401) {
                    message.error(res.message)
                }
            })
        }
    },
    onDeleteClick (index) {
        let {positionArr} = this.state
        let id = positionArr[index].id
        let formData = {}
        formData.id = parseInt(id)
        formData._method = 'delete'
        this.deleteCompanyAdress(formData)
    },
    handleCancelIcon () {
        this.setState({
            previewVisibleIcon: false
        })
    },
    handlePreviewIcon (file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        })
    },
    handleChangeIcon ({fileList, file}) {
        let result = ''
        fileList.forEach((v, index) => {
            if (v.response !== undefined) {
                result = v.response.data
            }
        })
        console.log(fileList)
        this.setState({
            fileListIcon: fileList,
            logoPic: result
        })
    },
    // 绘制初始化地图--匹配当前设备所在城市
    drawMapInitFn () {
        if (window.BMap !== undefined) {
            let BMap = window.BMap
            let _th = this
            let map = new BMap.Map('diTuBox') // 创建容器
            map.enableScrollWheelZoom(true) // 地图缩放功能
            let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
            let localCityFn = new BMap.LocalCity() // 根据ip定位当前浏览器城市地址
            // let geolocation = new BMap.Geolocation()
            // geolocation.getCurrentPosition(function (res) {
            //     console.log(res)
            // })
            localCityFn.get(function (res) {
                _th.centerAndZoomPointFn(res.name, '中国', myGeo, map, BMap)
            })
        }
    },
    // 地图匹配其他城市
    drawMapToggleFn (positionArr) {
        let BMap = window.BMap
        let _th = this
        let map = new BMap.Map('diTuBox') // 创建容器
        map.enableScrollWheelZoom(true) // 地图缩放功能
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        _th.centerAndZoomPointFn(positionArr[0]['city'], '中国', myGeo, map, BMap)
        positionArr.map((v, index) => {
            _th.geocodeSearch(v.building, (v.city + v.county), myGeo, map, BMap)
        })
    },
    // 定位城市的中心的区域
    centerAndZoomPointFn (add, city, myGeo, map, BMap) {
        myGeo.getPoint(add, function (point) {
            map.centerAndZoom(new BMap.Point(point.lng, point.lat), 13) // 定位城市中心区域
        }, city)
    },
    // 设置地址标注内容样式 并调用地图标注方法
    geocodeSearch (add, city, myGeo, map, BMap) {
        let _th = this
        myGeo.getPoint(add, function (point) {
            if (point) {
                let address = new BMap.Point(point.lng, point.lat)
                _th.addMarker(address, new BMap.Label(add, {offset: new BMap.Size(20, 10)}), BMap, map)
            }
        }, city)
    },
    // 判断用户输入地址是否有效
    addessInvaildFn (positionVal, positionArr, publishPosition) {
        let _th = this
        let memberId = window.localStorage.getItem('memberId')
        let add = positionVal.building
        let city = positionVal.county
        let BMap = window.BMap
        let map = new BMap.Map('diTuBox') // 创建容器
        map.enableScrollWheelZoom(true) // 地图缩放功能
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        // if (positionVal.province === '北京市' || positionArr[0].province === '天津市' || positionArr[0].province === '重庆市' || positionArr[0].province === '上海市') {
        //     city = positionArr[positionArr.length - 1]['province']
        // } else {
        //     city = positionArr[positionArr.length - 1]['city']
        // }
        myGeo.getPoint(add, function (point) {
            if (point === null) {
                message.warning('您输入的地址在地图上未找到，请重新输入！')
                positionArr.pop()
                if (positionArr.length > 0) {
                    _th.setState({
                        positionArr: [...positionArr],
                        daoAddHasNull: false
                    }, () => {
                        let {positionArr} = _th.state
                        _th.drawMapToggleFn(positionArr)
                        _th.setState({
                            count: ++_th.state.count
                        })
                    })
                } else {
                    _th.drawMapInitFn()
                }
            } else {
                _th.setState({
                    positionArr: positionArr,
                    publishPosition: {...publishPosition},
                    daoAddHasNull: false
                }, () => {
                    let {positionArr, publishPosition, municipality} = _th.state
                    let formData = {}
                    let curAd = positionArr[positionArr.length - 1]
                    delete curAd.building
                    // publishPosition.building = undefined
                    formData.companyId = memberId
                    if (municipality) {
                        formData.province = publishPosition.province
                        formData.city = publishPosition.province
                        formData.district = publishPosition.city
                        formData.location = `${curAd.province}-${curAd.city}-`
                    } else {
                        formData.province = publishPosition.province
                        formData.city = publishPosition.city
                        formData.district = publishPosition.county
                        formData.location = `${curAd.province}-${curAd.city}-${curAd.county}-`
                    }
                    formData.address = publishPosition.building
                    formData.longitude = point.lng
                    formData.latitude = point.lat
                    /* 添加地址
                    * 普通省市区参数
                    * formData{
                    *   province:'浙江省',
                    *   city:'杭州市',
                    *   district:'江干区',
                    *   location:'浙江省-杭州市-江干区-',
                    *   address:'火车东站',
                    *   longitude:'',
                    *   latitude:''
                    * }
                    * 直辖市参数（省市存同一个值）
                    * formData{
                    *   province:'北京市',
                    *   city:'北京市',
                    *   district:'东城区',
                    *   location:'北京市-北京市-东城区-',
                    *   address:'天安门广场',
                    *   longitude:'',
                    *   latitude:''
                    * }
                    * */
                    _th.addCompanyAdress(formData)
                    _th.drawMapToggleFn(positionArr)
                    _th.setState({
                        count: ++_th.state.count
                    })
                })
            }
        }, city)
    },
    // 在地图上标注所有公司地址
    addMarker (point, label, BMap, map) {
        let marker = new BMap.Marker(point)
        map.addOverlay(marker)
        marker.setLabel(label)
    },
    componentDidMount () {
        let doc = document
        let body = doc.getElementsByTagName('body')
        body[0].addEventListener('click', this.bodyClickFn, false)
        this.drawMapInitFn()
        this.getCompanyAdress()
        this.reqCurMounthData()
        this.reqPositionList(1)
    },
    componentWillUnmount () {
        let doc = document
        let body = doc.getElementsByTagName('body')
        body[0].removeEventListener('click', this.bodyClickFn, false)
    },
    handleCancel () {
        this.setState({
            previewVisible: false
        })
    },
    handlePreview (file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        })
    },
    getHeaders () {
        let uuid = window.localStorage.getItem('sessionUuid')
        return {
            Authorization: uuid === null ? '' : `DingYi ${uuid}`
        }
    },
    handleChange ({fileList}) {
        let result = ''
        fileList.forEach((v, index) => {
            if (v.hasOwnProperty('response') && v.response !== undefined) {
                if (index === fileList.length - 1) {
                    result += `${v.response.data}`
                } else {
                    result += `${v.response.data};`
                }
            } else if (v.hasOwnProperty('url')) {
                let newUrl = v.url.split('/')[2]
                result += `${newUrl};`
            }
        })
        this.setState({
            fileList: fileList,
            environmentPic: result
        })
    },
    bodyClickFn (e) {
        let target = e.target
        let className = target.className
        if (className.indexOf('desInput') === -1) {
            this.setState({
                isEditDes: false
            })
        }
        if (className.indexOf('diZhiIptCla') === -1) {
            this.setState({
                hasDiZhiEdit: false
            })
        }
    },
    changeEditState () {
        this.setState({
            isEditDes: !this.state.isEditDes
        })
    },
    desHtmlChange (e) {
        let val = e.target.value
        if (val.length > 20) {
            val = val.slice(0, 19)
            message.warning('最多只能保存20个字符!')
        }
        this.setState({
            curDesHtml: val
        })
    },
    // 签名输入框失去焦点，保存签名
    desHtmlBlur () {
        let {curDesHtml} = this.state
        let memberId = window.localStorage.getItem('memberId')
        let formData = {}
        this.setState({
            isEditDes: false
        }, () => {
            formData.memberId = memberId
            formData.signature = curDesHtml
            let URL = 'member/company/update'
            let _th = this
            postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
                let code = res.code
                if (code === 0) {
                    message.success('保存成功!')
                    _th.setState({
                        curDesHtml: curDesHtml
                    })
                } else {
                    message.error(res.message)
                }
            })
        })
    },
    onTabToggle (val) {
        if (val === 'curJob') {
            this.setState({
                curTab: val,
                hasSave: false
            })
        } else {
            this.setState({
                curTab: val
            })
        }
    },
    isMunicipalityFn () {
        let {publishPosition} = this.state
        if (publishPosition.province === '110100' || publishPosition.province === '120100' || publishPosition.province === '310100' || publishPosition.province === '500100') {
            this.setState({
                municipality: true
            })
        } else {
            this.setState({
                municipality: false
            })
        }
    },
    areaFilterFn (val, type) {
        let {citySelectList, publishPosition, countySelectList} = this.state
        if (type === 'province') {
            addressData.map((v, index) => {
                if (v.id === val) {
                    citySelectList = [...v.children]
                    publishPosition.city = [...v.children][0].id
                    this.setState({
                        citySelectList: citySelectList,
                        publishPosition: publishPosition
                    }, () => {
                        let {countySelectList, citySelectList, publishPosition} = this.state
                        if (citySelectList[0].children !== undefined) {
                            countySelectList = citySelectList[0].children
                            publishPosition.county = citySelectList[0].children[0].id
                            this.setState({
                                countySelectList: countySelectList,
                                publishPosition: publishPosition
                            })
                        } else {
                            countySelectList = []
                            publishPosition.county = undefined
                            this.setState({
                                countySelectList: countySelectList,
                                publishPosition: publishPosition
                            })
                        }
                        this.isMunicipalityFn()
                    })
                }
            })
        } else if (type === 'city') {
            citySelectList.map((v, index) => {
                if (v.id === val && v.children !== undefined) {
                    publishPosition.county = [...v.children][0].id
                    this.setState({
                        countySelectList: [...v.children]
                    }, () => {
                        this.isMunicipalityFn()
                    })
                }
            })
        }
    },
    handleSelectChange (val, type) {
        let {publishPosition} = this.state
        if (type === 'building') {
            val = val.target.value
            if (val.length > 30) {
                val = val.slice(0, 30)
            }
        }
        if (type === 'province' || type === 'city') {
            this.areaFilterFn(val, type)
        }
        publishPosition[type] = val
        this.setState({
            publishPosition: publishPosition
        })
    },
    // 地址输入框 失去焦点
    handleBlur (e) {
        let val = e.target.value
        if (val.length > 30) {
            val = val.slice(0, 30)
            message.warning('最多只能保存30个字符!')
        }
        e.target.value = val
    },
    // 文本框变化
    onInputChange (e, type, maxNum) {
        let {infolist} = this.state
        let val = e.target.value
        if (val.length < maxNum + 1) {
            infolist[type] = val
            this.setState({
                infolist: infolist
            })
        }
    },
    // 文本框的字数变化
    txtCount (val) {
        if (val !== '' && val !== null && val !== undefined) {
            return val.length
        } else {
            return 0
        }
    },
    onSaveFn () {
        this.setState({
            hasSave: true
        }, () => {
            let {infolist, logoPic, environmentPic} = this.state
            let formData = {}
            let memberId = window.localStorage.getItem('memberId')
            let isNull = false
            for (var v in infolist) {
                if (infolist[v] === '') {
                    isNull = true
                }
            }
            if (logoPic === '') {
                isNull = true
            }
            if (isNull) {
                message.warning('您有信息尚未填写, 或者公司logo未选择！')
                return false
            } else {
                formData.logoPic = logoPic
                if (environmentPic !== '') {
                    formData.environmentPic = environmentPic
                } else {
                    formData.environmentPic = ''
                }
                formData.memberId = memberId
                formData.mainBusiness = infolist.serviceByBis
                formData.introduce = infolist.introduceByBis
                this.reqSaveFn(formData)
            }
        })
    },
    reqSaveFn (formData) {
        let URL = 'member/company/update'
        let _th = this
        let memberId = window.localStorage.getItem('memberId')
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('保存成功!')
                _th.props.reqBusinssInfoAllInfo(memberId)
                _th.setState({
                    hasClickEdit: false,
                    environmentPicsList: [],
                    fileList: [],
                    fileListIcon: []
                })
            } else {
                message.error(res.message)
            }
        })
    },
    onAddClickFn () {
        this.setState({
            daoAddHasNull: true
        }, () => {
            let {publishPosition, positionArr, citySelectList, countySelectList, municipality, addessInvaild} = this.state
            let positionVal = {}
            let hasNull = false
            if (municipality) {
                for (let key in publishPosition) {
                    if (key !== 'county') {
                        if (publishPosition[key] === undefined || publishPosition[key] === '') {
                            hasNull = true
                        }
                    }
                }
            } else {
                for (let key in publishPosition) {
                    if (publishPosition[key] === undefined || publishPosition[key] === '') {
                        hasNull = true
                    }
                }
            }
            if (hasNull) {
                message.warning('请完善位置信息！')
                return false
            } else {
                addressData.map((v, index) => {
                    if (v.id === publishPosition.province) {
                        positionVal.province = v.value
                    }
                })
                citySelectList.length > 0 && citySelectList.map((v, index) => {
                    if (v.id === publishPosition.city) {
                        positionVal.city = v.value
                    }
                })
                countySelectList.length > 0 && countySelectList.map((v, index) => {
                    if (v.id === publishPosition.county) {
                        positionVal.county = v.value
                    }
                })
                positionVal.building = publishPosition.building
                positionArr.push(positionVal)
                this.addessInvaildFn(positionVal, positionArr, publishPosition)
            }
        })
    },
    positionEditFn (index) {
        this.setState({
            hasDiZhiEdit: true,
            indexDiZhiEdit: index
        })
    },
    // 判断用户修改地址是否有效
    addessEditInvaildFn (add, positionArr, index) {
        let _th = this
        let memberId = window.localStorage.getItem('memberId')
        let city = ''
        let BMap = window.BMap
        let map = new BMap.Map('diTuBox') // 创建容器
        map.enableScrollWheelZoom(true) // 地图缩放功能
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        city = positionArr[index].city
        myGeo.getPoint(add, function (point) {
            if (point === null) {
                message.warning('您输入的地址在地图上未找到，请重新输入！')
                _th.setState({
                    positionArr: [...positionArr],
                    hasDiZhiEdit: false
                }, () => {
                    let {positionArr} = _th.state
                    _th.drawMapToggleFn(positionArr)
                    _th.setState({
                        count: ++_th.state.count
                    })
                })
            } else {
                // positionArr[index].building = add
                _th.setState({
                    // positionArr: [...positionArr],
                    hasDiZhiEdit: false
                }, () => {
                    let {positionArr} = _th.state
                    let formData = {}
                    formData.memberId = memberId
                    formData.address = add
                    formData.id = positionArr[index].id
                    _th.editCompanyAdress(formData)
                    _th.drawMapToggleFn(positionArr)
                    _th.setState({
                        count: ++_th.state.count
                    })
                })
            }
        }, city, positionArr)
    },
    diZhiEditFn (e, index) {
        let {positionArr} = this.state
        let val = e.target.value
        this.addessEditInvaildFn(val, positionArr, index)
    },
    // 判断公司位置是否为空
    businessInputIsNull (type) {
        let {daoAddHasNull, publishPosition, hasSave, positionArr} = this.state
        return (daoAddHasNull && (publishPosition[type] === undefined || publishPosition[type] === '')) ? true : false
    },
    // 当月录用率；简历及时处理率转化
    radiosToggle (val) {
        val = parseFloat(val)
        val = val.toFixed(2) * 100
        return val
    },
    onEditClick () {
        let {fileListIcon, logoPic, environmentPicsList, fileList} = this.state
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        fileListIcon.push({
            url: `${imgsURL}${logoPic}`,
            name: logoPic,
            status: 'done',
            uid: `-${Math.random() * 100}`
        })
        let hasKong = false
        for (var v in environmentPicsList) {
            if (environmentPicsList[v] === '') {
                hasKong = true
            }
        }
        if (!hasKong) {
            environmentPicsList !== null && environmentPicsList.forEach((v, index) => {
                fileList.push({
                    url: `${imgsURL}${v}`,
                    name: v,
                    status: 'done',
                    uid: `-${Math.random() * 100}`
                })
            })
        }
        this.setState({
            hasClickEdit: true,
            fileListIcon: fileListIcon,
            environmentPicsList: environmentPicsList
        }, () => {
            this.props.countAddFn()
        })
    },
    togglePagination (current) {
        this.reqPositionList(current)
    },
    filterCityFn (province, city) {
        let result = ''
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            addressData.forEach((v, index) => {
                if (v.id === province) {
                    result = v.value
                }
            })
        } else {
            addressData.forEach((v, index) => {
                if (v.id === province) {
                    v.children.forEach((vC, indexC) => {
                        if (vC.id === city) {
                            result = vC.value
                        }
                    })
                }
            })
        }
        return result
    },
    // 判断图片地址是否为空
    hasLogoPic (logoPic) {
        if (logoPic === undefined || logoPic === null || logoPic === '') {
            return true
        } else {
            return false
        }
    },
    render () {
        let {environmentPicsList, logoPic, fileListIcon, previewImageIcon, previewVisibleIcon, isEditDes, curDesHtml, tongJiList, curTab, previewVisible, previewImage, fileList, infolist, certiState, count, hasSave, itemArr, positionListAll, citySelectList, countySelectList, roadSelectList, municipality, publishPosition, daoAddHasNull, positionArr, hasDiZhiEdit, indexDiZhiEdit} = this.state
        const uploadButton = (
            <div>
                <Icon type="plus" style={{fontSize: '32px'}}/>
                <div className="ant-upload-text">公司环境</div>
            </div>
        )
        const uploadButtonIcon = (
            <div>
                <Icon type="plus" style={{fontSize: '30px'}} />
                <div className="ant-upload-text" style={{fontSize: '14px'}}>logo</div>
            </div>
        )
        let TextAreaStyle = {width: '500px', height: '80px', backgroundColor: '#E6F5FF'}
        let selectStyle = {marginRight: '10px', width: '160px'}
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        return (
            <div className='BusinessEdit'>
                <div className='businessName'>
                    {
                        this.canEditFn()
                            ? <div className='businessLogo'>
                                <Upload
                                    action="member/platformMember/upload"
                                    listType="picture-card"
                                    fileList={fileListIcon}
                                    headers={this.getHeaders()}
                                    accept='image／*'
                                    onPreview={this.handlePreviewIcon}
                                    onChange={this.handleChangeIcon}
                                    beforeUpload={beforeUpload}>
                                    {fileListIcon.length >= 1 ? null : uploadButtonIcon}
                                </Upload>
                                <Modal visible={previewVisibleIcon} footer={null} onCancel={this.handleCancelIcon}>
                                    <img alt="example" style={{width: '100%'}} src={previewImageIcon} />
                                </Modal>
                            </div>
                            : <img src={this.hasLogoPic(logoPic) ? defaultHeadImg : `${imgsURL}${logoPic}`} alt="" className='showLogo' />
                    }
                    <div className='name'>
                        <span className='busi'>{infolist.name}</span>
                        {certiState === 3 ? <span className='attestation'>资质认证</span> : null}
                        {
                            isEditDes
                                ? <Input value={curDesHtml} style={{marginTop: '4px'}} onChange={this.desHtmlChange} onBlur={this.desHtmlBlur} className='desInput'/>
                                : <div className='des'>{curDesHtml}</div>
                        }
                    </div>
                    <div className='editIcon' onClick={this.changeEditState}>
                        <Icon type="edit" style={{color: '#25CCF6', fontSize: '28px'}}/>
                    </div>
                </div>
                <div className='tongJi'>
                    <span>
                        <div className='count'>{`${tongJiList.positionNum ? tongJiList.positionNum : 0}个`}</div>
                        <div className='type'>招聘职位</div>
                    </span>
                    <span>
                        <div className='count'>{`${tongJiList.recommendYesNumByMonth ? tongJiList.recommendYesNumByMonth : 0}个`}</div>
                        <div className='type'>当月面试</div>
                    </span>
                    <span>
                        <div className='count'>{`${this.radiosToggle(tongJiList.entryRatio ? tongJiList.entryRatio : 0)}%`}</div>
                        <div className='type'>当月录用率</div>
                    </span>
                    <span>
                        <div className='count'>{`${this.radiosToggle(tongJiList.didRatio ? tongJiList.didRatio : 0)}%`}</div>
                        <div className='type'>简历及时处理率</div>
                    </span>
                </div>
                <div className='tab'>
                    <div className='til'>
                        <span onClick={() => this.onTabToggle('homePage')} className={curTab === 'homePage' ? 'tabActive' : ''}>
                            公司主页
                        </span>
                        <span onClick={() => this.onTabToggle('curJob')} className={curTab === 'curJob' ? 'tabActive' : ''}>
                            当前职位({positionListAll ? positionListAll : 0})
                        </span>
                    </div>
                    <div className='introduceBox' style={curTab === 'homePage' ? {} : {display: 'none'}}>
                        <div className='introduce'>
                            <lable className="lableCls">公司介绍</lable>
                            {this.canEditFn() ? <div className='showText'>
                                <TextArea rows={4} placeholder='请输入公司介绍' onChange={(e) => this.onInputChange(e, 'introduceByBis', 400)}
                                          value={infolist.introduceByBis}
                                          style={hasSave && infolist.introduceByBis === '' ? {...TextAreaStyle, borderColor: 'red'} : TextAreaStyle}/>
                                <span style={{fontSize: '14px', color: '#999999', marginLeft: '10px'}}>{`${this.txtCount(infolist.introduceByBis)} / 400`}</span>
                            </div> : <span className='showText'>{infolist.introduceByBis}</span>}
                        </div>
                        <div className='environment'>
                            <lable className="lableCls">公司环境</lable>
                            {
                                this.canEditFn()
                                    ? <span className='Upload'>
                                         <Upload
                                             action="member/platformMember/upload"
                                             listType="picture-card"
                                             fileList={fileList}
                                             headers={this.getHeaders()}
                                             onPreview={this.handlePreview}
                                             onChange={this.handleChange}
                                             beforeUpload={beforeUpload}>
                                         {fileList.length >= 5 ? null : uploadButton}
                                         </Upload>
                                         <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                            <img alt="example" style={{width: '100%'}} src={previewImage} />
                                         </Modal>
                                    </span>
                                    : environmentPicsList && environmentPicsList.map((v, index) => {
                                        if (v !== '') {
                                            return <span className='environmentPics' key={index} style={{background: `url(${imgsURL}${v}) no-repeat`}}></span>
                                        }
                                    })
                            }

                        </div>
                        <div className='service'>
                            <lable className="lableCls">主营业务</lable>
                            {this.canEditFn() ? <div className='showText'>
                                <TextArea rows={4} placeholder="请输入主营业务" onChange={(e) => this.onInputChange(e, 'serviceByBis', 150)}
                                          value={infolist.serviceByBis}
                                          style={hasSave && infolist.serviceByBis === '' ? {...TextAreaStyle, borderColor: 'red'} : TextAreaStyle}/>
                                <span style={{fontSize: '14px', color: '#999999', marginLeft: '10px'}}>{`${this.txtCount(infolist.serviceByBis)} / 150`}</span>
                            </div> : <span className='showText'>{infolist.serviceByBis}</span>}
                        </div>
                        {
                            this.canEditFn()
                            ? <div className='position'>
                                <lable className="lableCls">公司位置</lable>
                                <div className='positionList'>
                                <Select placeholder="请选择" style={selectStyle} size='large' value={publishPosition.province}
                                        className={this.businessInputIsNull('province') ? 'selectNullClass' : ''}
                                        onChange={(val) => this.handleSelectChange(val, 'province')}>
                                    {
                                        addressData.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select>
                                <Select placeholder="请选择" style={selectStyle} size='large' value={publishPosition.city}
                                        notFoundContent='请选择省份'
                                        className={this.businessInputIsNull('city') ? 'selectNullClass' : ''}
                                        onChange={(val) => this.handleSelectChange(val, 'city')}>
                                    {
                                        citySelectList.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select>
                                {!municipality ? <Select placeholder="请选择" style={{...selectStyle, marginRight: 0}} size='large' value={publishPosition.county}
                                                         notFoundContent='请选择城市'
                                                         className={this.businessInputIsNull('county') ? 'selectNullClass' : ''}
                                                         onChange={(val) => this.handleSelectChange(val, 'county')}>
                                    {
                                        countySelectList.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select> : null}
                                <Input placeholder="例：东宁路553号东溪德必易园C366" key={`BUILDING_${count}`}
                                       style={this.businessInputIsNull('building') ? {width: '500px', marginTop: '20px', borderColor: 'red'} : {width: '500px', marginTop: '20px'}}
                                       size='large' onChange={(val) => this.handleSelectChange(val, 'building')} onBlur={this.handleBlur}/>
                                </div>
                                <span className='add' onClick={this.onAddClickFn}><Icon type="plus" /></span>
                            </div> : null
                        }
                        <div className='diTu'>
                            <div id='diTuBox'></div>
                            <div className='posEdit'>
                                <div className='editBox'>
                                    {positionArr.map((v, index) => {
                                        if (v.province === v.city) {
                                            return (
                                                <div className='resItem' key={index}>
                                                    <div className='shengShi'>
                                                        <span>{index + 1}</span>
                                                        {`${v.city}${v.county}`}
                                                        {this.canEditFn() ? <Icon type="edit" onClick={() => this.positionEditFn(index)}
                                                              style={{fontSize: '22px', float: 'right', cursor: 'pointer', color: '#25CCF6', marginRight: '10px'}}/> : null}
                                                        {this.canEditFn() ? <i className='del' onClick={() => this.onDeleteClick(index)}>删除</i> : null}
                                                    </div>
                                                    <div className='roadDiZhi' title={v.building}>
                                                        {
                                                            hasDiZhiEdit && indexDiZhiEdit === index
                                                            ? <Input defaultValue={v.building} onBlur={(e) => this.diZhiEditFn(e, index)}
                                                                     className='diZhiIptCla'/>
                                                            : <span>{`${v.building}`}</span>
                                                        }
                                                    </div>
                                                    <div className='line'></div>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className='resItem' key={index}>
                                                    <div className='shengShi'>
                                                        <span>{index + 1}</span>
                                                        {`${v.province}${v.city}${v.county}`}
                                                        {this.canEditFn() ? <Icon type="edit" type="edit" onClick={() => this.positionEditFn(index)}
                                                                                   style={{fontSize: '22px', float: 'right', cursor: 'pointer', color: '#25CCF6', marginRight: '10px'}}/> : null}
                                                        {this.canEditFn() ? <i className='del' onClick={() => this.onDeleteClick(index)}>删除</i> : null}
                                                    </div>
                                                    <div className='roadDiZhi' title={v.building}>
                                                        {
                                                            hasDiZhiEdit && indexDiZhiEdit === index
                                                                ? <Input defaultValue={v.building} onBlur={(e) => this.diZhiEditFn(e, index)}
                                                                         className='diZhiIptCla'/>
                                                                : <span>{`${v.building}`}</span>
                                                        }
                                                    </div>
                                                    <div className='line'></div>
                                                </div>
                                            )
                                        }
                                    })}
                                    {positionArr.length > 0 ? <div className='total'>该公司共有<span>{positionArr.length}</span>个地址</div> : null}
                                </div>
                            </div>
                        </div>
                        {this.canEditFn() ? <div className='save'>
                            <span onClick={this.onSaveFn}>保存</span>
                        </div> : <div className='save'>
                            <span onClick={this.onEditClick}>编辑</span>
                        </div>}
                    </div>
                    <div className='curJobItemCla' style={curTab === 'curJob' ? {} : {display: 'none'}}>
                        {itemArr.map((v, index) => {
                            return (
                                <div className='oneItem' key={index}>
                                    <div className='jibType'>
                                        {v.title}
                                    </div>
                                    <div className='info'>
                                        {this.filterCityFn(v.province, v.city) ? <span>{this.filterCityFn(v.province, v.city)}</span> : null}
                                        {this.filterCityFn(v.province, v.city) ? <span className='shuXian'></span> : null}
                                        {v.workExperience ? <span>{v.workExperience}</span> : null}
                                        {v.workExperience ? <span className='shuXian'></span> : null}
                                        {v.education ? <span>{v.education}</span> : null}
                                        {v.education ? <span className='shuXian'></span> : null}
                                        {v.positionNature ? <span>{v.positionNature}</span> : null}
                                        {v.positionNature ? <span className='shuXian'></span> : null}
                                        {v.salary ? <span>{v.salary}</span> : null}
                                        {v.salary ? <span className='shuXian'></span> : null}
                                    </div>
                                    <div className='result'>
                                        <span>{`${v.updateTime} 更新`}</span>
                                        <span>{`共收到 ${v.recommendNum ? v.recommendNum : 0} 个推荐`}</span>
                                        <span>{`已面试 ${v.recommendSuccess ? v.recommendSuccess : 0} 人`}</span>
                                        <span>{`待入职 ${v.waitEntryNum ? v.waitEntryNum : 0} 人`}</span>
                                        <span>{`已入职 ${v.entrySuccess ? v.entrySuccess : 0} 人`}</span>
                                    </div>
                                </div>
                            )
                        })}
                        <div className='my_pagination' style={{textAlign: 'right'}}>
                            <Pagination defaultCurrent={1} total={positionListAll} onChange={this.togglePagination}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default BusinessEdit
