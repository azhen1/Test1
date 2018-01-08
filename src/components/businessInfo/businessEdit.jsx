import React from 'react'
import {Icon, Input, Upload, Modal, message, Pagination, Select} from 'antd'
import './businessInfo.less'
import util from '../../common/util'
import addressData from '../../common/area'
import {getRequest, postRequest, deleteRequest} from '../../common/ajax'

const Option = Select.Option
const {TextArea} = Input

let BusinessEdit = React.createClass({
    getInitialState () {
        return {
            isEditDes: false,
            curDesHtml: '造福社会是我们的唯一动力',
            tongJiList: {},
            curTab: 'homePage',
            previewVisible: false,
            previewImage: '',
            fileList: [],
            infolist: {
                introduceByBis: '',
                serviceByBis: ''
            },
            hasSave: false,
            itemArr: [],
            publishPosition: {
                province: undefined,           // 省---发布位置
                city: undefined,               // 市---发布位置
                county: undefined,             // 区---发布位置
                building: undefined            // 详细地址---发布位置
            },
            citySelectList: [],
            countySelectList: [],
            roadSelectList: [],
            municipality: false,               // 判断是否是直辖市
            positionArr: [],
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
        let {businssInfoAllInfo, hasNew} = nextProps
        let {infolist} = this.state
        if (!hasNew) {
            infolist.introduceByBis = businssInfoAllInfo.introduce
            infolist.serviceByBis = businssInfoAllInfo.mainBusiness
            this.setState({
                logoPic: businssInfoAllInfo.logoPic,
                infolist: infolist,
                environmentPicsList: businssInfoAllInfo.environmentPics
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
        formData.memberId = 5
        positionArr = []
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                data.length > 0 && data.map((v, index) => {
                    let item = {}
                    if (v.district === null) {
                        addressData.map((vC, indexC) => {
                            if (vC.id === v.province) {
                                item.province = vC.value
                                vC.children.map((vCC, indexCC) => {
                                    if (vCC.id === v.city) {
                                        item.city = vCC.value
                                    }
                                })
                            }
                        })
                        item.building = v.address
                        item.id = v.id
                        positionArr.push(item)
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
                        item.building = v.address
                        item.id = v.id
                        positionArr.push(item)
                    }
                })
                _th.setState({
                    positionArr: positionArr
                }, () => {
                    let {positionArr} = _th.state
                    if (positionArr.length > 0) {
                        _th.drawMapToggleFn(positionArr)
                    }
                })
            } else {
                message.error('系统错误!')
            }
        })
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
                message.error('系统错误!')
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
                message.error('系统错误!')
            }
        })
    },
    // 查询当前职位list
    reqPositionList (page) {
        let URL = 'job/platformPosition/queryByPage'
        let _th = this
        let formData = {}
        formData.companyId = 1
        formData.page = page
        formData.state = 1
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    itemArr: [...res.data.list]
                })
            } else {
                message.error('系统错误!')
            }
        })
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
                message.error('系统错误!')
            }
        })
    },
    // 查询招聘职位；当月面试，当月录用率数据
    reqCurMounthData () {
        let URL = 'job/platformInterview/getDate'
        let _th = this
        let formData = {}
        formData.memberId = 5
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                _th.setState({
                    tongJiList: {...res.data}
                })
            } else {
                message.error('系统错误!')
            }
        })
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
        if (positionArr[0].province === '北京市' || positionArr[0].province === '天津市' || positionArr[0].province === '重庆市' || positionArr[0].province === '上海市') {
            _th.centerAndZoomPointFn(positionArr[0]['province'], '中国', myGeo, map, BMap)
        } else {
            _th.centerAndZoomPointFn(positionArr[0]['city'], '中国', myGeo, map, BMap)
        }
        positionArr.map((v, index) => {
            if (v.province === '北京市' || v.province === '天津市' || v.province === '重庆市' || v.province === '上海市') {
                _th.geocodeSearch(v.building, v.province, myGeo, map, BMap)
            } else {
                _th.geocodeSearch(v.building, v.city, myGeo, map, BMap)
            }
        })
    },
    centerAndZoomPointFn (add, city, myGeo, map, BMap) {
        myGeo.getPoint(add, function (point) {
            map.centerAndZoom(new BMap.Point(point.lng, point.lat), 13) // 定位城市中心区域
        }, city)
    },
    geocodeSearch (add, city, myGeo, map, BMap) {
        let _th = this
        myGeo.getPoint(add, function (point) {
            if (point) {
                let address = new BMap.Point(point.lng, point.lat)
                _th.addMarker(address, new BMap.Label(add, {offset: new BMap.Size(20, -10)}), BMap, map)
            }
        }, city)
    },
    // 判断用户输入地址是否有效
    addessInvaildFn (add, city, positionArr, publishPosition) {
        let _th = this
        let BMap = window.BMap
        let map = new BMap.Map('diTuBox') // 创建容器
        map.enableScrollWheelZoom(true) // 地图缩放功能
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        if (positionArr[0].province === '北京市' || positionArr[0].province === '天津市' || positionArr[0].province === '重庆市' || positionArr[0].province === '上海市') {
            city = positionArr[positionArr.length - 1]['province']
        } else {
            city = positionArr[positionArr.length - 1]['city']
        }
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
                    formData.companyId = 5
                    if (municipality) {
                        formData.province = publishPosition.province
                        formData.city = publishPosition.province
                        formData.district = publishPosition.city
                        formData.location = `${curAd.province}-${Object.values(curAd).join('-')}-`
                    } else {
                        formData.province = publishPosition.province
                        formData.city = publishPosition.city
                        formData.district = publishPosition.county
                        formData.location = `${Object.values(curAd).join('-')}-`
                    }
                    formData.address = publishPosition.building
                    formData.longitude = point.lng
                    formData.latitude = point.lat
                    _th.addCompanyAdress(formData)
                    _th.drawMapToggleFn(positionArr)
                    _th.setState({
                        count: ++_th.state.count
                        // publishPosition: publishPosition
                    })
                })
            }
        }, city, positionArr, publishPosition)
    },
    addMarker (point, label, BMap, map) {
        let marker = new BMap.Marker(point)
        map.addOverlay(marker)
        marker.setLabel(label)
    },
    componentDidMount () {
        let doc = document
        let [body] = doc.getElementsByTagName('body')
        body.addEventListener('click', this.bodyClickFn, false)
        this.drawMapInitFn()
        this.getCompanyAdress()
        this.reqCurMounthData()
        this.reqPositionList(1)
    },
    componentWillUnmount () {
        let doc = document
        let [body] = doc.getElementsByTagName('body')
        body.removeEventListener('click', this.bodyClickFn, false)
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
        this.setState({
            curDesHtml: val
        })
    },
    desHtmlBlur () {
        this.setState({
            isEditDes: false
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
        if (publishPosition.province === '110100' || publishPosition.province === '120100' || publishPosition.province === '310100' || publishPosition.province === '500000') {
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
        let {citySelectList, publishPosition} = this.state
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
                        countySelectList = citySelectList[0].children
                        if (countySelectList !== undefined) {
                            publishPosition.county = citySelectList[0].children[0].id
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
        }
        if (type === 'province' || type === 'city') {
            this.areaFilterFn(val, type)
        }
        publishPosition[type] = val
        this.setState({
            publishPosition: publishPosition
        })
    },
    onInputChange (e, type) {
        let {infolist} = this.state
        let val = e.target.value
        infolist[type] = val
        console.log(infolist, '[[')
        this.setState({
            infolist: infolist
        })
    },
    onSaveFn () {
        this.setState({
            hasSave: true
        }, () => {
            let {infolist, logoPic, environmentPic} = this.state
            let values = Object.values(infolist)
            let formData = {}
            let isNull = false
            values.forEach((v, index) => {
                if (v === '') {
                    isNull = true
                }
            })
            if (logoPic === '') {
                isNull = true
            }
            if (isNull) {
                message.warning('您有信息尚未填写, 或则公司logo未选择！')
                return false
            } else {
                formData.logoPic = logoPic
                if (environmentPic !== '') {
                    formData.environmentPic = environmentPic
                } else {
                    formData.environmentPic = ''
                }
                formData.memberId = 5
                formData.mainBusiness = infolist.serviceByBis
                formData.introduce = infolist.introduceByBis
                this.reqSaveFn(formData)
            }
        })
    },
    reqSaveFn (formData) {
        let URL = 'member/company/update'
        let _th = this
        this.props.countAddFn()
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('保存成功!')
                _th.props.reqBusinssInfoAllInfo()
                _th.setState({
                    hasClickEdit: false,
                    environmentPicsList: [],
                    fileList: [],
                    fileListIcon: []
                })
            } else {
                message.error('系统错误!')
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
                this.addessInvaildFn(positionVal.building, positionVal.city, positionArr, publishPosition)
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
        let city = ''
        let BMap = window.BMap
        let map = new BMap.Map('diTuBox') // 创建容器
        map.enableScrollWheelZoom(true) // 地图缩放功能
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        if (!positionArr[index].hasOwnProperty('county')) {
            city = positionArr[index].province
        } else {
            city = positionArr[index].city
        }
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
                    formData.memberId = 5
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
        val = parseInt(val)
        val = val.toFixed(2) * 100
        return val
    },
    onEditClick () {
        let {fileListIcon, logoPic, environmentPicsList, fileList} = this.state
        let imgsURL = '/images/'
        fileListIcon.push({
            url: `${imgsURL}${logoPic}`,
            name: logoPic,
            status: 'done',
            uid: `-${Math.random() * 100}`
        })
        let values = Object.values(environmentPicsList)
        let hasKong = false
        values.forEach((v, index) => {
            if (v === '') {
                hasKong = true
            }
        })
        if (!hasKong) {
            environmentPicsList.map((v, index) => {
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
    render () {
        let {environmentPicsList, logoPic, fileListIcon, previewImageIcon, previewVisibleIcon, isEditDes, curDesHtml, tongJiList, curTab, previewVisible, previewImage, fileList, infolist, count, hasSave, itemArr, citySelectList, countySelectList, roadSelectList, municipality, publishPosition, daoAddHasNull, positionArr, hasDiZhiEdit, indexDiZhiEdit} = this.state
        const uploadButton = (
            <div>
                <Icon type="plus" style={{fontSize: '26px'}}/>
                <div className="ant-upload-text">上 传</div>
            </div>
        )
        const uploadButtonIcon = (
            <div>
                <Icon type="plus" style={{fontSize: '26px'}} />
                <div className="ant-upload-text" style={{fontSize: '14px'}}>logo</div>
            </div>
        )
        let TextAreaStyle = {width: '500px', height: '80px', backgroundColor: '#E6F5FF', verticalAlign: 'top'}
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
                                    accept='image／*'
                                    onPreview={this.handlePreviewIcon}
                                    onChange={this.handleChangeIcon}
                                >
                                    {fileListIcon.length >= 1 ? null : uploadButtonIcon}
                                </Upload>
                                <Modal visible={previewVisibleIcon} footer={null} onCancel={this.handleCancelIcon}>
                                    <img alt="example" style={{width: '100%'}} src={previewImageIcon} />
                                </Modal>
                            </div>
                            : <span className='showLogo' style={{background: `url(${imgsURL}${logoPic}) no-repeat`}}></span>
                    }
                    <div className='name'>
                        <span className='busi'>杭州鼎亿网络</span>
                        <span className='attestation'>资质认证</span>
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
                        <div className='count'>{`${tongJiList.positionNum}个`}</div>
                        <div className='type'>招聘职位</div>
                    </span>
                    <span>
                        <div className='count'>{`${tongJiList.recommendYesNumByMonth}个`}</div>
                        <div className='type'>当月面试</div>
                    </span>
                    <span>
                        <div className='count'>{`${this.radiosToggle(tongJiList.entryRatio)}%`}</div>
                        <div className='type'>当月录用率</div>
                    </span>
                    <span>
                        <div className='count'>{`${this.radiosToggle(tongJiList.didRatio)}%`}</div>
                        <div className='type'>简历及时处理率</div>
                    </span>
                </div>
                <div className='tab'>
                    <div className='til'>
                        <span onClick={() => this.onTabToggle('homePage')} className={curTab === 'homePage' ? 'tabActive' : ''}>
                            公司主页
                        </span>
                        <span onClick={() => this.onTabToggle('curJob')} className={curTab === 'curJob' ? 'tabActive' : ''}>
                            当前职位({itemArr.length})
                        </span>
                    </div>
                    <div className='introduceBox' style={curTab === 'homePage' ? {} : {display: 'none'}}>
                        <div className='introduce'>
                            <lable className="lableCls">公司介绍</lable>
                            {this.canEditFn() ? <TextArea rows={4} placeholder='请输入公司介绍' onChange={(e) => this.onInputChange(e, 'introduceByBis')}
                                                          value={infolist.introduceByBis}
                                                          style={hasSave && infolist.introduceByBis === '' ? {...TextAreaStyle, borderColor: 'red'} : TextAreaStyle}/> : <span className='showText'>{infolist.introduceByBis}</span>}
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
                                             onPreview={this.handlePreview}
                                             onChange={this.handleChange}
                                         >
                                         {fileList.length >= 5 ? null : uploadButton}
                                         </Upload>
                                         <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                            <img alt="example" style={{width: '100%'}} src={previewImage} />
                                         </Modal>
                                    </span>
                                    : environmentPicsList !== undefined && environmentPicsList.map((v, index) => {
                                        if (v !== '') {
                                            return <span className='environmentPics' key={index} style={{background: `url(${imgsURL}${v}) no-repeat`}}></span>
                                        }
                                    })
                            }

                        </div>
                        <div className='service'>
                            <lable className="lableCls">主营业务</lable>
                            {this.canEditFn() ? <Input placeholder="请输入主营业务" style={hasSave && infolist.serviceByBis === '' ? {width: '500px', borderColor: 'red'} : {width: '500px'}}
                                                       value={infolist.serviceByBis} size='large' onChange={(e) => this.onInputChange(e, 'serviceByBis')}/> : <span className='showText'>{infolist.serviceByBis}</span>}
                        </div>
                        {
                            this.canEditFn()
                            ? <div className='position'>
                                <lable className="lableCls">公司位置</lable>
                                <div className='positionList'>
                                <Select placeholder="不限" style={selectStyle} size='large' value={publishPosition.province}
                                        className={this.businessInputIsNull('province') ? 'selectNullClass' : ''}
                                        onChange={(val) => this.handleSelectChange(val, 'province')}>
                                    {
                                        addressData.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select>
                                <Select placeholder="不限" style={selectStyle} size='large' value={publishPosition.city}
                                        notFoundContent='请选择省份'
                                        className={this.businessInputIsNull('city') ? 'selectNullClass' : ''}
                                        onChange={(val) => this.handleSelectChange(val, 'city')}>
                                    {
                                        citySelectList.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select>
                                {!municipality ? <Select placeholder="不限" style={{...selectStyle, marginRight: 0}} size='large' value={publishPosition.county}
                                                         notFoundContent='请选择城市'
                                                         className={this.businessInputIsNull('county') ? 'selectNullClass' : ''}
                                                         onChange={(val) => this.handleSelectChange(val, 'county')}>
                                    {
                                        countySelectList.map((v, index) => {
                                            return <Option value={v.id} key={v.id}>{v.value}</Option>
                                        })
                                    }
                                </Select> : null}
                                <Input placeholder="请输入具体地址" key={`BUILDING_${count}`}
                                       style={this.businessInputIsNull('building') ? {width: '500px', marginTop: '20px', borderColor: 'red'} : {width: '500px', marginTop: '20px'}}
                                       size='large' onChange={(val) => this.handleSelectChange(val, 'building')}/>
                                </div>
                                <span className='add' onClick={this.onAddClickFn}><Icon type="plus" /></span>
                            </div> : null
                        }
                        <div className='diTu'>
                            <div id='diTuBox'></div>
                            <div className='posEdit'>
                                <div className='editBox'>
                                    {positionArr.map((v, index) => {
                                        if (v.county === undefined) {
                                            return (
                                                <div className='resItem' key={index}>
                                                    <div className='shengShi'>
                                                        <span>{index + 1}</span>
                                                        {`${v.province}${v.city}`}
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
                        {this.canEditFn() ? <div className='save' onClick={this.onSaveFn}>
                            <span>保存</span>
                        </div> : <div className='save' onClick={this.onEditClick}>
                            <span>编辑</span>
                        </div>}
                    </div>
                    <div className='curJobItemCla' style={curTab === 'curJob' ? {} : {display: 'none'}}>
                        {itemArr.map((v, index) => {
                            return (
                                <div className='oneItem' key={index}>
                                    <div className='jibType'>
                                        {v.companyName}
                                    </div>
                                    <div className='info'>
                                        <span>{v.city}</span>
                                        <span className='shuXian'></span>
                                        <span>{v.workExperience}</span>
                                        <span className='shuXian'></span>
                                        <span>{v.education}</span>
                                        <span className='shuXian'></span>
                                        <span>{v.positionNature}</span>
                                        <span className='shuXian'></span>
                                        <span>{v.salary}</span>
                                    </div>
                                    <div className='result'>
                                        <span>{`${v.updateTime} 更新`}</span>
                                        <span>{`共收到 ${v.recommendNum} 个推荐`}</span>
                                        <span>{`已面试 ${v.recommendSuccess} 人`}</span>
                                        <span>{`待入职 ${v.waitEntryNum} 人`}</span>
                                        <span>{`已入职 ${v.entrySuccess} 人`}</span>
                                    </div>
                                </div>
                            )
                        })}
                        <div className='my_pagination' style={{textAlign: 'right'}}>
                            <Pagination defaultCurrent={1} total={itemArr.length} onChange={this.togglePagination}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default BusinessEdit
