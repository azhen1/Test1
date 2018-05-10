import React from 'react'
import {Select, Input, Icon, message, Cascader} from 'antd'
import './positionManagerEdit.less'
import addressData from '../../../common/area'
import positionTypeList from '../../../common/multilevelPosition'
import {getRequest, postRequest} from '../../../common/ajax'
import $ from 'jquery'

const {TextArea} = Input
const Option = Select.Option

let mianShiList = ['25', '50']
let entryList = ['300', '500', '800', '1500']
let labelList = ['五险一金', '带薪年假', '周末双休']
let ageList = ['16', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '99']
let PositionManagerEdit = React.createClass({
    getInitialState () {
        return {
            citySelectList: [],                 // 城市列表
            countySelectList: [],               // 市区列表
            roadSelectList: [],                 // 街道列表
            municipality: false,                // 判断是否是直辖市
            publishPosition: {
                province: undefined,            // 省---发布位置  直辖-市
                city: undefined,                // 市---发布位置  直辖-区
                county: undefined               // 区---发布位置
            },
            jobTil: '',                         // 职位标题
            filterItem: {
                jobType: undefined,             // 职位类别
                educational: undefined,         // 学历
                experience: undefined,          // 经验
                ageForm: undefined,             // 年龄-开始
                ageTo: undefined,               // 年龄-结束
                pay: undefined,                 // 月薪
                jobNature: undefined            // 工作性质
            },
            ageMeiJuListL: ageList,             // 年龄列表
            meiJuList: {                        // 各种下拉列表枚举列表
                jobType: positionTypeList,      // 职位类别
                pay: [],                        // 月薪
                experience: [],                 // 经验
                educational: [],                // 学历
                jobXingZhi: []                  // 工作性质
            },
            peopleNum: '',
            mianShiList: mianShiList,           // 奖赏金额---面试费列表
            entryList: entryList,               // 奖赏金额---入职费列表
            curMainshiChoiceIn: 0,              // 面试费
            curEntryChoiceIn: 0,                // 入职费
            labelList: labelList,               // 福利标签
            jobDes: undefined,                  // 职位描述
            citySelectListPlace: [],            // 城市列表
            countySelectListPlace: [],          // 市区列表
            roadSelectListPlace: [],            // 街道列表
            municipalityPlace: false,           // 判断是否是直辖市
            jobPlace: {
                province: undefined,            // 省---工作地点   直辖-市
                city: undefined,                // 市---工作地点   直辖-区
                county: undefined,              // 区---工作地点   直辖-街道
                road: undefined,                // 街道---工作地点   直辖-空
                building: undefined             // 详细地址---工作地点   直辖-详细地址
            },
            textAreaCount: 0,                   // 职位描述字数
            jobTilCount: 0,                     // 职位标题字数
            isPublish: false,                   // 是否发布  控制点击发布时是否有未填写的信息
            hasPublish: false,                  // 是否发布  控制点击发布时信息是否已经提交
            isChange: false,                    // 信息是否被编辑
            isAttestation: false,
            publishLongitude: {},               // 发布位置经纬度
            placeLongitude: {},                 // 工作地点经纬度
            shangQuanList: {},                  // 商圈枚举列表
            memberId: '',                       // 公司ID
            positionId: '',                     // 职位ID
            pageType: '',                       // 职位编辑类型
            freePosition: false                 // 是否免费职位
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        hash = hash.split('?')[1]
        let memberId = localStorage.getItem('memberId')
        if (hash.indexOf('id') !== -1) {
            let positionId = hash.split('&')[1].split('=')[1]
            let pageType = hash.split('&')[0].split('=')[1]
            this.setState({
                positionId: positionId,
                pageType: pageType,
                memberId: memberId
            }, () => {
                this.checkAttestationFn()
            })
        } else {
            let pageType = hash.split('=')[1]
            this.setState({
                pageType: pageType,
                memberId: memberId
            }, () => {
                this.checkAttestationFn()
            })
        }
        this.reqMeiJUListFn()
        this.props.router.setRouteLeaveHook(
            this.props.route,
            this.routerWillLeave
        )
    },
    routerWillLeave (nextLocation) {
        let _th = this
        // 返回 false 会继续停留当前页面，
        // 否则，返回一个字符串，会显示给用户，让其自己决定
        if (!_th.state.hasPublish && _th.state.isChange) {
            return '职位信息还未保存，确认要离开？'
        }
    },
    // 编辑职位时查询所有职位信息
    reqTotalPosition () {
        let URL = 'job/platformPosition/webGet'
        let _th = this
        let {positionId, publishPosition, filterItem, jobPlace, entryList, mianShiList, curEntryChoiceIn, curMainshiChoiceIn, meiJuList, peopleNum, placeLongitude} = _th.state
        let formData = {}
        formData.id = positionId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            let municipalityPlace = false
            let municipality = false
            if (code === 0) {
                let data = res.data
                if (data.age !== null) {
                    let ageList = data.age.split('-')
                    filterItem.ageForm = ageList[0]
                    filterItem.ageTo = ageList[1]
                }
                entryList.forEach((v, index) => {
                    if (data.entryBid === parseInt(v)) {
                        curEntryChoiceIn = index
                    }
                })
                mianShiList.forEach((v, index) => {
                    // console.log(v)
                    // console.log(data.interviewBid)
                    if (data.interviewBid === parseInt(v)) {
                        curMainshiChoiceIn = index
                    }
                })
                filterItem.jobType = data.typeCode.split(';')
                peopleNum = data.number
                meiJuList.educational.map((v, index) => {
                    if (data.education !== null && v.content === data.education) {
                        filterItem.educational = v.code
                    }
                })
                meiJuList.experience.map((v, index) => {
                    if (data.workExperience !== null && v.content === data.workExperience) {
                        filterItem.experience = v.code
                    }
                })
                meiJuList.pay.map((v, index) => {
                    if (data.salary !== null && v.content === data.salary) {
                        filterItem.pay = v.code
                    }
                })
                meiJuList.jobXingZhi.map((v, index) => {
                    if (data.positionNature !== null && v.content === data.positionNature) {
                        filterItem.jobNature = v.code
                    }
                })
                if (data.title !== null) {
                    _th.setState({
                        jobTil: data.title
                    })
                }
                if (data.description !== null) {
                    _th.setState({
                        jobDes: data.description
                    })
                }
                if (data.welfare !== null) {
                    _th.setState({
                        labelList: data.welfare.split(';')
                    })
                }
                if (data.province === data.city) {
                    municipality = true
                    publishPosition.province = data.city
                    if (data.district === '') {
                        publishPosition.city = 'ALL_BUXIAN'
                    } else {
                        publishPosition.city = data.district
                    }
                } else {
                    municipality = false
                    publishPosition.province = data.province
                    if (data.city === '') {
                        publishPosition.city = 'ALL_BUXIAN'
                    } else {
                        publishPosition.city = data.city
                    }
                    if (data.district === '') {
                        publishPosition.county = 'ALL_BUXIAN'
                    } else {
                        publishPosition.county = data.district
                    }
                }
                if (data.workProvince === data.workCity) {
                    municipalityPlace = true
                    jobPlace.province = data.workCity
                    if (data.workDistrict === '') {
                        jobPlace.city = 'ALL_BUXIAN'
                    } else {
                        jobPlace.city = data.workDistrict
                    }
                    if (data.workStreet === '') {
                        jobPlace.road = 'ALL_BUXIAN'
                    } else {
                        jobPlace.road = data.workStreet
                    }
                    jobPlace.building = data.workAddress
                } else {
                    municipalityPlace = false
                    jobPlace.province = data.workProvince
                    if (data.workCity === '') {
                        jobPlace.city = 'ALL_BUXIAN'
                    } else {
                        jobPlace.city = data.workCity
                    }
                    if (data.workDistrict === '') {
                        jobPlace.county = 'ALL_BUXIAN'
                    } else {
                        jobPlace.county = data.workDistrict
                    }
                    if (data.workStreet === '') {
                        jobPlace.road = 'ALL_BUXIAN'
                    } else {
                        jobPlace.road = data.workStreet
                    }
                    jobPlace.building = data.workAddress
                }
                placeLongitude.lng = data.longitude
                placeLongitude.lat = data.latitude
                _th.setState({
                    curEntryChoiceIn: curEntryChoiceIn,
                    curMainshiChoiceIn: curMainshiChoiceIn,
                    filterItem: filterItem,
                    peopleNum: peopleNum,
                    municipality: municipality,
                    municipalityPlace: municipalityPlace,
                    publishPosition: publishPosition,
                    jobPlace: jobPlace,
                    placeLongitude: placeLongitude
                }, () => {
                    let {publishPosition, municipality, jobPlace, municipalityPlace} = _th.state
                    _th.filterEditCityList(publishPosition, 'publish', municipality)
                    _th.filterEditCityList(jobPlace, 'place', municipalityPlace)
                    if (municipalityPlace) {
                        _th.shangQuanListFn(jobPlace.city)
                    } else {
                        _th.shangQuanListFn(jobPlace.county)
                    }
                })
            } else if (code !== 401) {
                message.error('系统错误!')
            }
        })
    },
    // 省市区列表更新--筛选编辑页面省市
    filterEditCityList (position, type, isMunicipality) {
        if (type === 'publish') {
            let result = []
            if (isMunicipality) {
                addressData.map((v, index) => {
                    if (v.id === position.province) {
                        result = [...v.children]
                    }
                })
                this.setState({
                    citySelectList: result
                })
            } else {
                addressData.map((v, index) => {
                    if (v.id === position.province) {
                        result = [...v.children]
                    }
                })
                this.setState({
                    citySelectList: result
                }, () => {
                    let {citySelectList} = this.state
                    let resultC = []
                    citySelectList.map((v, index) => {
                        if (v.id === position.city) {
                            resultC = [...v.children]
                        }
                    })
                    this.setState({
                        countySelectList: resultC
                    })
                })
            }
        } else {
            let result = []
            if (isMunicipality) {
                addressData.map((v, index) => {
                    if (v.id === position.province) {
                        result = [...v.children]
                    }
                })
                this.setState({
                    citySelectListPlace: result
                })
            } else {
                addressData.map((v, index) => {
                    if (v.id === position.province) {
                        result = [...v.children]
                    }
                })
                this.setState({
                    citySelectListPlace: result
                }, () => {
                    let {citySelectListPlace} = this.state
                    let resultC = []
                    citySelectListPlace.map((v, index) => {
                        if (v.id === position.city) {
                            resultC = [...v.children]
                        }
                    })
                    this.setState({
                        countySelectListPlace: resultC
                    })
                })
            }
        }
    },
    // 学历；工作经验；月薪；工作性质枚举接口
    reqMeiJUListFn () {
        let URL = 'member/platformDict/selectDictionariesGroupByType'
        let _th = this
        let {meiJuList} = _th.state
        let formData = {}
        formData.types = '1;2;26;27'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                meiJuList.pay = [...data['2']]
                meiJuList.experience = [...data['26']]
                meiJuList.educational = [...data['1']]
                meiJuList.jobXingZhi = [...data['27']]
                _th.setState({
                    meiJuList: meiJuList
                })
            } else if (code === 401) {
                window.location.hash = '/login'
                message.warning('您的账号已在其他设备登录，请重新登录')
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 获取公司地址
    getCompanyAdress () {
        let URL = 'member/companyAddress/getAddresses'
        let _th = this
        let formData = {}
        let {publishPosition, jobPlace, placeLongitude} = _th.state
        let municipalityPlace = false
        let municipality = false
        formData.memberId = window.localStorage.getItem('memberId')
        getRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                let data = res.data[0]
                if (data.province === data.city) {
                    municipality = true
                    municipalityPlace = true
                    publishPosition.province = data.city
                    jobPlace.province = data.city
                    if (data.district === '') {
                        publishPosition.city = 'ALL_BUXIAN'
                        jobPlace.city = 'ALL_BUXIAN'
                    } else {
                        publishPosition.city = data.district
                        jobPlace.city = data.district
                    }
                    if (data.street === '' || data.street === null) {
                        jobPlace.county = 'ALL_BUXIAN'
                    } else {
                        jobPlace.county = 'ALL_BUXIAN'
                    }
                } else {
                    municipality = false
                    municipalityPlace = false
                    publishPosition.province = data.province
                    jobPlace.province = data.province
                    if (data.city === '' || data.city === null) {
                        publishPosition.city = 'ALL_BUXIAN'
                        jobPlace.city = 'ALL_BUXIAN'
                    } else {
                        publishPosition.city = data.city
                        jobPlace.city = data.city
                    }
                    if (data.district === '' || data.district === null) {
                        publishPosition.county = 'ALL_BUXIAN'
                        jobPlace.county = 'ALL_BUXIAN'
                    } else {
                        publishPosition.county = data.district
                        jobPlace.county = data.district
                    }
                    if (data.street === '' || data.street === null) {
                        jobPlace.road = 'ALL_BUXIAN'
                    } else {
                        jobPlace.road = data.street
                    }
                    jobPlace.building = data.address
                }
                placeLongitude.lng = data.longitude
                placeLongitude.lat = data.latitude
                _th.setState({
                    municipality: municipality,
                    municipalityPlace: municipalityPlace,
                    publishPosition: publishPosition,
                    jobPlace: jobPlace,
                    placeLongitude: placeLongitude
                }, () => {
                    let {publishPosition, municipality, jobPlace, municipalityPlace} = _th.state
                    _th.filterEditCityList(publishPosition, 'publish', municipality)
                    _th.filterEditCityList(jobPlace, 'place', municipalityPlace)
                    if (municipalityPlace) {
                        _th.shangQuanListFn(jobPlace.city)
                    } else {
                        _th.shangQuanListFn(jobPlace.county)
                    }
                })
            }
        })
    },
    // 商圈枚举接口
    shangQuanListFn (id) {
        let URL = `http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/town${id}.json`
        // let URL = `images/town${id}.json`
        let _th = this
        let {jobPlace} = _th.state
        getRequest(true, URL, {}).then(function (res) {
            let data = JSON.parse(res)
            let roadIdList = Object.keys(data)
            if (jobPlace.road === 'ALL_BUXIAN' || roadIdList.indexOf(jobPlace.road) === -1) {
                jobPlace.road = Object.keys(data)[0]
            }
            _th.setState({
                shangQuanList: {...data},
                jobPlace: jobPlace
            })
        })
    },
    // 检测公司是否认证成功
    checkAttestationFn () {
        let URL = 'job/platformPosition/getInitPostPosition'
        let _th = this
        let {memberId, pageType} = _th.state
        let formData = {}
        formData.memberId = memberId
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                let entryBids = data.entryBids
                let interviewBIds = data.interviewBIds
                let welfares = data.welfares
                if (pageType === 'new') {
                    if (data.state === 3) {
                        if (welfares !== null && welfares.length > 0) {
                            _th.setState({
                                labelList: [...welfares]
                            })
                        }
                        if (interviewBIds !== null && interviewBIds.length > 0) {
                            _th.setState({
                                mianShiList: [...interviewBIds]
                            })
                        }
                        if (entryBids !== null && entryBids.length > 0) {
                            _th.setState({
                                entryList: [...entryBids]
                            })
                        }
                        _th.setState({
                            isAttestation: true
                        }, () => {
                            _th.getCompanyAdress()
                        })
                    } else {
                        message.error('还未认证成功，暂时还不能发布职位!')
                        return false
                    }
                } else {
                    if (welfares !== null && welfares.length > 0) {
                        _th.setState({
                            labelList: [...welfares]
                        })
                    }
                    if (interviewBIds !== null && interviewBIds.length > 0) {
                        _th.setState({
                            mianShiList: [...interviewBIds]
                        })
                    }
                    if (entryBids !== null && entryBids.length > 0) {
                        _th.setState({
                            entryList: [...entryBids]
                        })
                    }
                    _th.setState({
                        isAttestation: true
                    }, () => {
                        _th.reqTotalPosition()
                    })
                }
            } else if (code !== 401) {
                message.error(res.message)
            }
        })
    },
    welfareLableDelete (index, type) {
        let {labelList, mianShiList, entryList} = this.state
        if (type === 'labelList') {
            labelList.splice(index, 1)
            this.setState({
                labelList: labelList
            })
        } else if (type === 'mianShiList') {
            mianShiList.splice(index, 1)
            this.setState({
                mianShiList: mianShiList
            })
        } else if (type === 'entryList') {
            entryList.splice(index, 1)
            this.setState({
                entryList: entryList
            })
        }
        this.changeAny()
    },
    welfareLableAdd (type) {
        let {labelList, mianShiList, entryList} = this.state
        if (type === 'labelList') {
            labelList.push('init')
            this.setState({
                labelList: labelList
            }, () => {
                this.textInput.focus()
            })
        } else if (type === 'mianShiList') {
            mianShiList.push('init')
            this.setState({
                mianShiList: mianShiList
            }, () => {
                this.textInput.focus()
            })
        } else if (type === 'entryList') {
            entryList.push('init')
            this.setState({
                entryList: entryList
            }, () => {
                this.textInput.focus()
            })
        }
        this.changeAny()
    },
    addLableFn (e, index, type) {
        let {labelList, mianShiList, entryList} = this.state
        let val = e.target.value
        if (type === 'labelList') {
            labelList[index] = val
            this.setState({
                labelList: labelList
            })
        } else if (type === 'mianShiList') {
            if (!/^[0-9]*$/.test(val) || val < 25) {
                mianShiList[index] = ''
                message.warning('请输入数字且金额大于25元')
                this.setState({
                    mianShiList: mianShiList
                })
            } else {
                mianShiList[index] = val
                this.setState({
                    mianShiList: mianShiList
                })
            }
        } else if (type === 'entryList') {
            if (!/^[0-9]*$/.test(val) || val < 300) {
                entryList[index] = ''
                message.warning('请输入数字且金额大于300元')
                this.setState({
                    entryList: entryList
                })
            } else {
                entryList[index] = val
                this.setState({
                    entryList: entryList
                })
            }
        }
    },
    // 职位描述
    jobDesChange (e) {
        let val = e.target.value
        if (val.length < 801) {
            this.setState({
                jobDes: val,
                textAreaCount: val.length
            }, () => {
                this.changeAny()
            })
        }
    },
    // 职位标题
    jobTilChange (e) {
        let val = e.target.value
        if (val.length < 21) {
            this.setState({
                jobTil: val,
                jobTilCount: val.length
            }, () => {
                this.changeAny()
            })
        }
    },
    // 招聘人数
    peopleChange (e) {
        let val = e.target.value
        let reg = /^[0-9]*$/
        if (val === '') {
            val = ''
        } else if (reg.test(val)) {
            val = parseInt(val)
            if (val > 100000) {
                message.warning('招聘人数不能大于100000')
                val = ''
            }
        } else {
            val = ''
            message.warning('只能输入数字')
        }
        this.setState({
            peopleNum: val
        }, () => {
            this.changeAny()
        })
    },
    // 职位类别，学历要求，工作经验，年龄，到，月薪，工作性质
    filterItemFn (val, type) {
        let {filterItem} = this.state
        filterItem[type] = val
        this.setState({
            filterItem: filterItem
        }, () => {
            this.changeAny()
        })
    },
    // 省市县三级列表筛选---发布位置
    areaFilterFn (val, type) {
        let {citySelectList, publishPosition} = this.state
        if (type === 'province') {
            if (val === '110100' || val === '120100' || val === '310100' || val === '500100') {
                this.setState({
                    municipality: true
                })
            } else {
                this.setState({
                    municipality: false
                })
            }
        }
        if (type === 'province') {
            addressData.map((v, index) => {
                if (v.id === val) {
                    citySelectList = [...v.children]
                    publishPosition.city = [...v.children][0].id
                    this.setState({
                        citySelectList: citySelectList,
                        publishPosition: publishPosition
                    }, () => {
                        let {countySelectList, citySelectList} = this.state
                        countySelectList = citySelectList[0].children
                        if (countySelectList !== undefined) {
                            publishPosition.county = citySelectList[0].children[0].id
                            this.setState({
                                countySelectList: countySelectList,
                                publishPosition: publishPosition
                            })
                        }
                    })
                }
            })
        } else if (type === 'city') {
            citySelectList.map((v, index) => {
                if (v.id === val && v.children !== undefined) {
                    publishPosition.county = [...v.children][0].id
                    this.setState({
                        countySelectList: [...v.children]
                    })
                }
            })
        }
    },
    // 查询发布位置经纬度
    queryLongitudePublish (add, city) {
        let BMap = window.BMap
        let _th = this
        let {publishPosition} = _th.state
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        myGeo.getPoint(add, function (point) {
            if (!point) {
                message.warning('您输入的地址在地图中未找到，请重新输入！')
                publishPosition.building = undefined
                _th.setState({
                    publishPosition: publishPosition
                })
            } else {
                console.log(point)
                _th.setState({
                    publishLongitude: {...point}
                })
            }
        }, city)
    },
    // 发布位置
    filterItemPublish (val, type) {
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
        }, () => {
            this.changeAny()
        })
    },
    adressPublishBlur (e) {
        let val = e.target.value
        let {publishPosition} = this.state
        let province = publishPosition.province
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            this.queryLongitudePublish(val, this.queryCodeCity(publishPosition.province, publishPosition))
        } else {
            this.queryLongitudePublish(val, this.queryCodeCity(publishPosition.city, publishPosition))
        }
    },
    // 省市区街道四级列表筛选---工作地点
    areaFilterPlaceFn (val, type) {
        let {citySelectListPlace, municipalityPlace, jobPlace} = this.state
        municipalityPlace = this.isZhiXizCityFn(jobPlace)
        this.setState({
            municipalityPlace: municipalityPlace
        })
        if (municipalityPlace) {
            if (type === 'province') {
                addressData.map((v, index) => {
                    if (v.id === val) {
                        citySelectListPlace = [...v.children]
                        jobPlace.city = [...v.children][0].id
                        this.setState({
                            citySelectListPlace: citySelectListPlace,
                            jobPlace: jobPlace
                        }, () => {
                            let {citySelectListPlace} = this.state
                            let id = citySelectListPlace[0].id
                            if (id !== 'ALL_BUXIAN') {
                                this.shangQuanListFn(id)
                            }
                        })
                    }
                })
            } else if (type === 'city') {
                if (val !== 'ALL_BUXIAN') {
                    this.shangQuanListFn(val)
                }
            }
        } else {
            if (type === 'province') {
                addressData.map((v, index) => {
                    if (v.id === val) {
                        citySelectListPlace = [...v.children]
                        jobPlace.city = [...v.children][0].id
                        this.setState({
                            citySelectListPlace: citySelectListPlace,
                            jobPlace: jobPlace
                        }, () => {
                            let {countySelectListPlace, citySelectListPlace} = this.state
                            countySelectListPlace = citySelectListPlace[0].children
                            if (countySelectListPlace !== undefined) {
                                jobPlace.county = citySelectListPlace[0].children[0].id
                                this.setState({
                                    countySelectListPlace: countySelectListPlace,
                                    jobPlace: jobPlace
                                }, () => {
                                    let {countySelectListPlace} = this.state
                                    let id = countySelectListPlace[0].id
                                    if (id !== 'ALL_BUXIAN') {
                                        this.shangQuanListFn(id)
                                    }
                                })
                            }
                        })
                    }
                })
            } else if (type === 'city') {
                citySelectListPlace.map((v, index) => {
                    if (v.id === val && v.children !== undefined) {
                        jobPlace.county = [...v.children][0].id
                        this.setState({
                            countySelectListPlace: [...v.children]
                        }, () => {
                            let {countySelectListPlace} = this.state
                            let id = countySelectListPlace[0].id
                            if (id !== 'ALL_BUXIAN') {
                                this.shangQuanListFn(id)
                            }
                        })
                    }
                })
            } else {
                if (val !== 'ALL_BUXIAN') {
                    this.shangQuanListFn(val)
                }
            }
        }
    },
    // 查询工作地点经纬度
    queryLongitudePlace (add, city) {
        let BMap = window.BMap
        let _th = this
        let {jobPlace} = _th.state
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        myGeo.getPoint(add, function (point) {
            if (!point) {
                message.warning('您输入的地址在地图中未找到，请重新输入！')
                jobPlace.building = undefined
                _th.setState({
                    jobPlace: jobPlace
                })
            } else {
                _th.setState({
                    placeLongitude: {...point}
                })
            }
        }, city)
    },
    // 省市区街道四级变动筛选---工作地点
    filterItemFnPlace (val, type) {
        let {jobPlace, countySelectListPlace, shangQuanList} = this.state
        if (type === 'building') {
            val = val.target.value
        }
        jobPlace[type] = val
        if (type === 'city' && val === 'ALL_BUXIAN') {
            jobPlace.county = 'ALL_BUXIAN'
            jobPlace.road = 'ALL_BUXIAN'
            countySelectListPlace = [{id: 'ALL_BUXIAN', value: '不限'}]
            shangQuanList = {}
        }
        if (type === 'county' && val === 'ALL_BUXIAN') {
            jobPlace.road = 'ALL_BUXIAN'
            shangQuanList = {}
        }
        this.setState({
            jobPlace: jobPlace,
            countySelectListPlace: countySelectListPlace,
            shangQuanList: shangQuanList
        }, () => {
            if (type === 'province' || type === 'city' || type === 'county') {
                this.areaFilterPlaceFn(val, type)
            }
            this.changeAny()
        })
    },
    adressPlaceBlur (e) {
        let val = e.target.value
        let {jobPlace} = this.state
        let province = jobPlace.province
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            this.queryLongitudePlace(val, this.queryCodeCity(jobPlace.province, jobPlace))
        } else {
            this.queryLongitudePlace(val, this.queryCodeCity(jobPlace.city, jobPlace))
        }
    },
    // 通过code查询城市名
    queryCodeCity (id, type) {
        let addressDataCopy = addressData
        let city = ''
        let zhiXiaCity = {
            '110100': '北京市',
            '120100': '天津市',
            '310100': '上海市',
            '500100': '重庆市'
        }
        if (type.province !== undefined) {
            if (id === '110100' || id === '120100' || id === '310100' || id === '500100') {
                city = zhiXiaCity[id]
            } else {
                addressDataCopy.map((v, index) => {
                    if (v.id === type.province) {
                        v.children.map((vC, indexC) => {
                            if (vC.id === id) {
                                city = vC.value
                            }
                        })
                    }
                })
            }
        }
        return city
    },
    // 判断选择的是否是直辖市
    isZhiXizCityFn (data) {
        let province = data.province
        let result = false
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            result = true
        }
        return result
    },
    // 判断城市列表是否为空
    cityHasNullFn (data) {
        let province = data.province
        let dataCopy = {...data}
        let result = false
        if (province === '110100' || province === '120100' || province === '310100' || province === '500100') {
            delete dataCopy.county
        }
        for (var v in dataCopy) {
            if (dataCopy[v] === '' || dataCopy[v] === undefined) {
                result = true
            }
        }
        return result
    },
    // 根据城市列表code查询具体城市名
    queryCityNameFn (data, type) {
        let result = ''
        let addressDataCopy = addressData
        let {municipality, municipalityPlace, shangQuanList} = this.state
        if (type === 'publishPosition') {
            if (municipality) {
                addressDataCopy.map((v, index) => {
                    if (v.id === data.province) {
                        result += `${v.value}-${v.value}-`
                        v.children.map((vC, indexC) => {
                            if (vC.id === data.city) {
                                result += `${vC.value}-`
                            }
                        })
                    }
                })
            } else {
                addressDataCopy.map((v, index) => {
                    if (v.id === data.province) {
                        result += `${v.value}-`
                        v.children.map((vC, indexC) => {
                            if (vC.id === data.city) {
                                result += `${vC.value}-`
                                vC.children.map((vCG, indexCG) => {
                                    if (vCG.id === data.county) {
                                        result += `${vCG.value}-`
                                    }
                                })
                            }
                        })
                    }
                })
            }
        } else if (type === 'jobPlace') {
            if (municipalityPlace) {
                addressDataCopy.map((v, index) => {
                    if (v.id === data.province) {
                        result += `${v.value}-${v.value}-`
                        v.children.map((vC, indexC) => {
                            if (vC.id === data.city) {
                                result += `${vC.value}-`
                            }
                        })
                    }
                })
                for (let key in shangQuanList) {
                    if (key === data.road) {
                        result = `${result}${shangQuanList[key]}`
                    }
                }
            } else {
                addressDataCopy.map((v, index) => {
                    if (v.id === data.province) {
                        result += `${v.value}-`
                        v.children.map((vC, indexC) => {
                            if (vC.id === data.city) {
                                result += `${vC.value}-`
                                vC.children.map((vCG, indexCG) => {
                                    if (vCG.id === data.county) {
                                        result += `${vCG.value}-`
                                    }
                                })
                            }
                        })
                    }
                })
                for (let key in shangQuanList) {
                    if (key === data.road) {
                        result = `${result}${shangQuanList[key]}`
                    }
                }
            }
        }
        return result
    },
    // 确认发布
    onPublish (type) {
        this.setState({
            isPublish: true
        }, () => {
            let {publishPosition, jobPlace, filterItem, peopleNum, placeLongitude, jobTil, mianShiList, entryList, labelList, curMainshiChoiceIn, curEntryChoiceIn, jobDes, memberId, freePosition} = this.state
            let hasNull = false
            let formDate = {}
            hasNull = this.cityHasNullFn(publishPosition) || this.cityHasNullFn(jobPlace)
            if (this.isNull(filterItem.jobType) || this.isNull(filterItem.jobNature) || this.isNull(filterItem.pay) || this.isNull(filterItem.educational) || this.isNull(filterItem.experience) || this.isNull(peopleNum) || this.isNull(jobDes) || this.isNull(jobTil)) {
                hasNull = true
            }
            if (filterItem.ageForm !== undefined && filterItem.ageTo === undefined) {
                hasNull = true
            }
            if (hasNull) {
                message.warning('您有未添信息，请完善信息！')
                return false
            } else {
                this.setState({
                    hasPublish: true
                })
                if (this.isZhiXizCityFn(publishPosition)) {
                    formDate.province = publishPosition.province
                    formDate.city = publishPosition.province
                    if (publishPosition.city !== 'ALL_BUXIAN') {
                        formDate.district = publishPosition.city
                    } else {
                        formDate.district = ''
                    }
                } else {
                    formDate.province = publishPosition.province
                    if (publishPosition.city !== 'ALL_BUXIAN') {
                        formDate.city = publishPosition.city
                    } else {
                        formDate.city = ''
                    }
                    if (publishPosition.county !== 'ALL_BUXIAN') {
                        formDate.district = publishPosition.county
                    } else {
                        formDate.district = ''
                    }
                }
                if (this.isZhiXizCityFn(jobPlace)) {
                    formDate.workProvince = jobPlace.province
                    formDate.workCity = jobPlace.province
                    if (jobPlace.city !== 'ALL_BUXIAN') {
                        formDate.workDistrict = jobPlace.city
                    } else {
                        formDate.workDistrict = ''
                    }
                    if (jobPlace.road !== 'ALL_BUXIAN') {
                        formDate.workStreet = jobPlace.road
                    } else {
                        formDate.workStreet = ''
                    }
                    formDate.workAddress = jobPlace.building
                } else {
                    formDate.workProvince = jobPlace.province
                    if (jobPlace.city !== 'ALL_BUXIAN') {
                        formDate.workCity = jobPlace.city
                    } else {
                        formDate.workCity = ''
                    }
                    if (jobPlace.county !== 'ALL_BUXIAN') {
                        formDate.workDistrict = jobPlace.county
                    } else {
                        formDate.workDistrict = ''
                    }
                    if (jobPlace.road !== 'ALL_BUXIAN') {
                        formDate.workStreet = jobPlace.road
                    } else {
                        formDate.workStreet = ''
                    }

                    formDate.workAddress = jobPlace.building
                }
                formDate.title = jobTil       // 职位标题
                // formDate.type = filterItem.jobType.join(';')
                formDate.type = this.positionTypeFn(filterItem.jobType)  // 职位类别string
                formDate.typeCode = filterItem.jobType.join(';')  // 职位类别code码
                formDate.education = filterItem.educational      // 学历
                formDate.workExperience = filterItem.experience      // 经验
                if (filterItem.ageForm !== undefined) {
                    formDate.age = `${filterItem.ageForm}-${filterItem.ageTo}`     // 年龄
                }
                formDate.salary = filterItem.pay      // 薪资
                formDate.positionNature = filterItem.jobNature      // 性质
                formDate.number = peopleNum      // 招聘人数
                formDate.welfare = labelList.join(';')      // 福利标签
                formDate.description = jobDes      // 描述
                formDate.interviewBids = mianShiList.join(';')     // 面试费list
                formDate.entryBids = entryList.join(';')     // 入职费list
                formDate.longitude = placeLongitude.lng      // 经度
                formDate.latitude = placeLongitude.lat      // 纬度
                formDate.location = this.queryCityNameFn(publishPosition, 'publishPosition')
                formDate.workLocation = this.queryCityNameFn(jobPlace, 'jobPlace')
                formDate.companyId = memberId
                if (type === 'free') {
                    freePosition = true
                    formDate.interviewBid = '0'      // 面试费选中
                    formDate.entryBid = '0'      // 入职费选中
                } else {
                    freePosition = false
                    formDate.interviewBid = mianShiList[curMainshiChoiceIn]      // 面试费选中
                    formDate.entryBid = entryList[curEntryChoiceIn]      // 入职费选中
                }
                formDate.free = freePosition
                // console.log('success')
                this.addDoPublish(formDate)
            }
        })
    },
    // 查询发布职位类别
    positionTypeFn (val) {
        let {meiJuList} = this.state
        let result = ''
        meiJuList.jobType.forEach((v, index) => {
            if (v.value === val[0]) {
                v.children.forEach((vC, indexC) => {
                    if (vC.value === val[1]) {
                        vC.children.forEach((vCC, indexCC) => {
                            if (vCC.value === val[2]) {
                                result = vCC.label
                            }
                        })
                    }
                })
            }
        })
        return result
    },
    // 新建---确认发布
    addDoPublish (formData) {
        let URL = ''
        let _th = this
        let {pageType, positionId} = _th.state
        if (pageType === 'new') {
            URL = 'job/platformPosition/insert'
        } else {
            URL = 'job/platformPosition/update'
            formData.id = positionId
        }
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('发布成功!')
                if (res.data.compare === -1) {
                    message.warning('您帐号中余额不足以支付该职位的费用，请及时充值')
                }
                // else {
                //     sessionStorage.setItem('positionTab', '0')
                //     window.location.hash = 'positionManager/recruitIng'
                // }
                sessionStorage.setItem('positionTab', '0')
                window.location.hash = 'positionManager/recruitIng'
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 入职费用, 面试费用选择
    payChioseFn (index, type) {
        if (type === 'curEntryChoiceIn') {
            this.setState({
                curEntryChoiceIn: index
            })
        } else {
            this.setState({
                curMainshiChoiceIn: index
            })
        }
    },
    hasProtopyFn (type) {
        let {meiJuList} = this.state
        let value = []
        if (meiJuList.hasOwnProperty(type)) {
            value = [...meiJuList[type]]
        }
        return value
    },
    onJobTypeChange (val) {
        let {filterItem} = this.state
        filterItem.jobType = val
        this.setState({
            filterItem: filterItem
        }, () => {
            this.changeAny()
        })
    },
    createRoadSelect () {
        let {shangQuanList} = this.state
        if (!shangQuanList.hasOwnProperty('ALL_BUXIAN')) {
            shangQuanList['ALL_BUXIAN'] = '不限'
        }
        let result = []
        for (let key in shangQuanList) {
            result.push(<Option value={key} key={key}>{shangQuanList[key]}</Option>)
        }
        return result
    },
    hasBuXianFn (list) {
        let result = false
        list.forEach((v, index) => {
            if (v.id === 'ALL_BUXIAN') {
                result = true
            }
        })
        return result
    },
    changeAny () {
        this.setState({
            hasPublish: false,
            isChange: true
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
        let {mianShiList, entryList, labelList, textAreaCount, jobTilCount, jobDes, jobTil, jobPlace, filterItem, publishPosition, isPublish, hasPublish, isChange, curMainshiChoiceIn, curEntryChoiceIn, citySelectList, countySelectList, roadSelectList, municipality, citySelectListPlace, countySelectListPlace, municipalityPlace, meiJuList, peopleNum, ageMeiJuListL} = this.state
        let selectStyle = {marginRight: '10px', width: '128px'}
        let inputStyle = {width: '500px', backgroundColor: '#E6F5FF'}
        if (!this.hasBuXianFn(citySelectList) && municipalityPlace) {
            citySelectList.push({id: 'ALL_BUXIAN', value: '不限'})
        }
        if (!this.hasBuXianFn(countySelectList)) {
            countySelectList.push({id: 'ALL_BUXIAN', value: '不限'})
        }
        if (!this.hasBuXianFn(citySelectListPlace) && municipalityPlace) {
            citySelectListPlace.push({id: 'ALL_BUXIAN', value: '不限'})
        }
        if (!this.hasBuXianFn(countySelectListPlace)) {
            countySelectListPlace.push({id: 'ALL_BUXIAN', value: '不限'})
        }
        if (!this.hasBuXianFn(countySelectListPlace)) {
            countySelectListPlace.push({id: 'ALL_BUXIAN', value: '不限'})
        }
        return (
            <div className='positionManagerEdit'>
                <div className='editForm'>
                    <div className='publishPosition'>
                        <lable className="lab">发布位置</lable>
                        <Select placeholder="省" style={selectStyle} size='large' value={publishPosition.province}
                                className={isPublish && publishPosition.province === undefined ? 'selectNullClass' : ''}
                                onChange={(val) => this.filterItemPublish(val, 'province')}>
                            {
                                addressData.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select>
                        <Select placeholder={!municipality ? '市' : '区'} style={selectStyle} size='large' value={publishPosition.city}
                                className={isPublish && publishPosition.city === undefined ? 'selectNullClass' : ''}
                                notFoundContent='请选择省份'
                                onChange={(val) => this.filterItemPublish(val, 'city')}>
                            {
                                citySelectList.map((v, index) => {
                                    return <Option key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select>
                        {!municipality ? <Select placeholder="区" style={selectStyle} size='large' value={publishPosition.county}
                                className={isPublish && publishPosition.county === undefined ? 'selectNullClass' : ''}
                                notFoundContent='请选择城市'
                                onChange={(val) => this.filterItemPublish(val, 'county')}>
                            {
                                countySelectList.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select> : null}
                    </div>
                    <div className='jobTitle'>
                        <lable className="lab">职位标题</lable>
                        <Input placeholder="请输入职位标题" style={inputStyle} className={isPublish && this.isNull(jobTil) ? 'selectNullClass' : ''} size='large' onChange={this.jobTilChange} value={jobTil}/>
                        <span style={{fontSize: '14px', color: '#999999', marginLeft: '10px'}}>{`${jobTilCount} / 20`}</span>
                    </div>
                    <div className='screen'>
                        <Cascader options={meiJuList.jobType} size='large' style={{...selectStyle, width: '200px'}}
                                  onChange={this.onJobTypeChange}
                                  value={filterItem.jobType}
                                  popupClassName='positionPopupCName'
                                  className={isPublish && filterItem.jobType === undefined ? 'selectNullClass' : ''}
                                  placeholder="职位类别" />
                        <Select placeholder="学历要求" style={selectStyle} value={filterItem.educational}
                                className={isPublish && filterItem.educational === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFn(val, 'educational')}>
                            {this.hasProtopyFn('educational').map((v, index) => {
                                return (
                                    <Option value={`${v.code}`} key={index}>{v.content}</Option>
                                )
                            })}
                        </Select>
                        <Select placeholder="工作经验" style={selectStyle} value={filterItem.experience}
                                className={isPublish && filterItem.experience === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFn(val, 'experience')}>
                            {this.hasProtopyFn('experience').map((v, index) => {
                                return (
                                    <Option value={`${v.code}`} key={index}>{v.content}</Option>
                                )
                            })}
                        </Select>
                        <Select placeholder="年龄" style={selectStyle} value={filterItem.ageForm}
                                size='large' onChange={(val) => this.filterItemFn(val, 'ageForm')}>
                            {ageMeiJuListL.map((v, index) => {
                                return (
                                    <Option value={v} key={index}>{v}</Option>
                                )
                            })}
                        </Select>
                        <Select placeholder="到" style={selectStyle} value={filterItem.ageTo}
                                className={isPublish && filterItem.ageTo === undefined && filterItem.ageForm !== undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFn(val, 'ageTo')}>
                            {ageMeiJuListL.filter(v => v > filterItem.ageForm).map((v, index) => {
                                return (
                                    <Option value={v} key={index}>{v}</Option>
                                )
                            })}
                        </Select>
                    </div>
                    <div className='screen'>
                        <Select placeholder="月薪" style={selectStyle} value={filterItem.pay}
                                className={isPublish && filterItem.pay === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFn(val, 'pay')}>
                            {this.hasProtopyFn('pay').map((v, index) => {
                                return (
                                    <Option value={`${v.code}`} key={index}>{v.content}</Option>
                                )
                            })}
                        </Select>
                        <Select placeholder="工作性质" style={selectStyle} value={filterItem.jobNature}
                                className={isPublish && filterItem.jobNature === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFn(val, 'jobNature')}>
                            {this.hasProtopyFn('jobXingZhi').map((v, index) => {
                                return (
                                    <Option value={`${v.code}`} key={index}>{v.content}</Option>
                                )
                            })}
                        </Select>
                        <Input placeholder="请输入招聘人数" style={selectStyle} className={isPublish && this.isNull(peopleNum) ? 'selectNullClass' : ''} size='large' onChange={(val) => this.peopleChange(val)} value={peopleNum}/>
                    </div>
                    <div className='welfareLable'>
                        <lable className="lab">福利标签</lable>
                        <div className='itemBox'>
                            {labelList.map((v, index) => {
                                if (v !== 'init' && v !== '') {
                                    return (
                                        <span className='val' key={index}>
                                            {v}
                                            <span className='close' onClick={() => this.welfareLableDelete(index, 'labelList')}>×</span>
                                        </span>
                                    )
                                } else if (v === 'init' && v !== '') {
                                    return (
                                        <span className='val' key={index} style={{padding: '0'}}>
                                            <Input size='large' onBlur={(e) => this.addLableFn(e, index, 'labelList')}
                                                   ref={(input) => { this.textInput = input }}
                                                   style={{width: '90px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                            <span className='close' onClick={() => this.welfareLableDelete(index, 'labelList')}>×</span>
                                        </span>
                                    )
                                }
                            })}
                            <span className='custom' onClick={() => this.welfareLableAdd('labelList')}>
                                <Icon type="plus" style={{fontSize: '20px', verticalAlign: 'sub', marginRight: '5px'}}/>
                                自定义
                        </span>
                        </div>
                    </div>
                    <div className='jobDescribe'>
                        <lable className="lab">职位描述</lable>
                        <TextArea rows={4} style={{height: '140px', ...inputStyle}} className={isPublish && this.isNull(jobDes) ? 'selectNullClass' : ''} placeholder='岗位职责：任职资格：工作时间：' onChange={this.jobDesChange} value={jobDes}/>
                        <span style={{fontSize: '14px', color: '#999999', marginLeft: '10px'}}>{`${textAreaCount} / 800`}</span>
                    </div>
                    <div className='jobPlace'>
                        <lable className="lab">工作地点</lable>
                        <Select placeholder="省" style={selectStyle} value={jobPlace.province}
                                className={isPublish && jobPlace.province === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFnPlace(val, 'province')}>
                            {
                                addressData.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select>
                        <Select placeholder={!municipalityPlace ? '市' : '区'} style={selectStyle} value={jobPlace.city}
                                className={isPublish && jobPlace.city === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFnPlace(val, 'city')}>
                            {
                                citySelectListPlace.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select>
                        {!municipalityPlace ? <Select placeholder="区" style={selectStyle} value={jobPlace.county}
                                className={isPublish && jobPlace.county === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFnPlace(val, 'county')}>
                            {
                                countySelectListPlace.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select> : null}
                        <Select placeholder="街道" style={selectStyle} value={jobPlace.road}
                                className={isPublish && jobPlace.road === undefined ? 'selectNullClass' : ''}
                                size='large' onChange={(val) => this.filterItemFnPlace(val, 'road')}>
                            {this.createRoadSelect()}
                        </Select>
                        <div className='juTi'>
                            <Input placeholder="例：东宁路553号东溪德必易园C366" value={jobPlace.building} onBlur={this.adressPlaceBlur}
                                    onChange={(val) => this.filterItemFnPlace(val, 'building')}
                                    style={isPublish && jobPlace.building === undefined ? {...inputStyle, marginLeft: '76px', borderColor: 'red'} : {...inputStyle, marginLeft: '76px'}} size='large'/>
                        </div>
                    </div>
                    <div className='shangJin'>
                        <lable className="lab">奖赏金额</lable>
                        <div className='mianBan'>
                            <div className='audition'>
                                <lable className="labC">面试费: </lable>
                                <div className='itemBox'>
                                    {mianShiList.map((v, index) => {
                                        if (v !== 'init' && v !== '') {
                                            return (
                                                <span key={index} className={curMainshiChoiceIn === index ? 'val activeChioce' : 'val'}
                                                        onClick={() => this.payChioseFn(index, 'curMainshiChoiceIn')}>
                                                    {v}
                                                    <span className='close' onClick={() => this.welfareLableDelete(index, 'mianShiList')}>×</span>
                                                </span>
                                            )
                                        } else if (v === 'init' && v !== '') {
                                            return (
                                                <span className='val chioceInput' key={index} style={{padding: '0'}}>
                                                    <Input size='large' onBlur={(e) => this.addLableFn(e, index, 'mianShiList')}
                                                            ref={(input) => { this.textInput = input }}
                                                            style={{width: '88px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                                    <span className='close' onClick={() => this.welfareLableDelete(index, 'mianShiList')}>×</span>
                                                </span>
                                            )
                                        }
                                    })}
                                    <span className='custom' onClick={() => this.welfareLableAdd('mianShiList')}>
                                        <Icon type="plus" style={{fontSize: '20px', verticalAlign: 'sub', marginRight: '5px'}}/>
                                        自定义
                                    </span>
                                </div>
                            </div>
                            <div className='entry'>
                                <lable className="labC">入职费: </lable>
                                <div className='itemBox'>
                                    {entryList.map((v, index) => {
                                        if (v !== 'init' && v !== '') {
                                            return (
                                                <span className='val' key={index} className={curEntryChoiceIn === index ? 'val activeChioce' : 'val'}
                                                        onClick={() => this.payChioseFn(index, 'curEntryChoiceIn')}>
                                                    {v}
                                                    <span className='close' onClick={() => this.welfareLableDelete(index, 'entryList')}>×</span>
                                                </span>
                                            )
                                        } else if (v === 'init' && v !== '') {
                                            return (
                                                <span className='val chioceInput' key={index} style={{padding: '0'}}>
                                                    <Input size='large' onBlur={(e) => this.addLableFn(e, index, 'entryList')}
                                                           ref={(input) => { this.textInput = input }}
                                                           style={{width: '88px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                                    <span className='close' onClick={() => this.welfareLableDelete(index, 'entryList')}>×</span>
                                                </span>
                                            )
                                        }
                                    })}
                                    <span className='custom' onClick={() => this.welfareLableAdd('entryList')}>
                                        <Icon type="plus" style={{fontSize: '20px', verticalAlign: 'sub', marginRight: '5px'}}/>
                                        自定义
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        hasPublish ? <div className='confirm'>
                                <span className='btn btnFree onBtn'>我要免费发布</span>
                                <span className='btn onBtn'>确认发布</span>
                            </div> : <div className='confirm'>
                                <span className='btn btnFree' onClick={() => this.onPublish('free')}>我要免费发布</span>
                                <span className='btn' onClick={() => this.onPublish()}>确认发布</span>
                            </div>
                    }
                </div>
            </div>
        )
    }
})

export default PositionManagerEdit
