import React from 'react'
import {Select, Input, Icon, message, Cascader} from 'antd'
import './positionManagerEdit.less'
import addressData from '../../../common/area'
import positionTypeList from '../../../common/multilevelPosition'
import {getRequest, postRequest} from '../../../common/ajax'

const {TextArea} = Input
const Option = Select.Option

let mianShiList = ['25', '50']
let entryList = ['300', '500', '800', '1500']
let lableList = ['五险一金', '带薪年假', '周末双休']
let ageList = ['20', '25', '30', '35', '40', '45', '50', '55', '60']
let PositionManagerEdit = React.createClass({
    getInitialState () {
        return {
            publishPosition: {
                province: undefined,           // 省---发布位置
                city: undefined,               // 市---发布位置
                county: undefined             // 区---发布位置
                // road: '测试',               // 街道---发布位置
                // building: undefined            // 详细地址---发布位置
            },
            jobTil: '',                 // 职位标题
            filterItem: {
                jobType: undefined,            // 职位类别
                educational: undefined,        // 学历
                experience: undefined,         // 经验
                ageForm: undefined,
                ageTo: undefined,
                pay: undefined,                // 月薪
                jobNature: undefined          // 工作性质
            },
            mianShiList: mianShiList,   // 奖赏金额---面试
            entryList: entryList,       // 奖赏金额---入职
            lableList: lableList,       // 福利标签
            jobDes: undefined,                 // 职位描述
            jobPlace: {
                province: undefined,           // 省---工作地点
                city: undefined,               // 市---工作地点
                county: undefined,             // 区---工作地点
                road: undefined,               // 街道---工作地点
                building: undefined            // 详细地址---工作地点
            },
            textAreaCount: 0,
            jobTilCount: 0,
            isPublish: false,                  // 是否发布
            curEntryChoiceIn: 0,
            curMainshiChoiceIn: 0,
            citySelectList: [],
            countySelectList: [],
            roadSelectList: [],
            municipality: false,               // 判断是否是直辖市
            citySelectListPlace: [],
            countySelectListPlace: [],
            roadSelectListPlace: [],
            municipalityPlace: false,          // 判断是否是直辖市
            meiJuList: {           // 各种下拉列表枚举列表
                jobType: positionTypeList,     // 职位类别
                pay: [],                       // 月薪
                experience: [],                // 经验
                educational: [],               // 学历
                jobXingZhi: []                 // 工作性
            },
            isAttestation: false,
            ageMeiJuListL: ageList,
            publishLongitude: {},               // 发布位置经纬度
            placeLongitude: {},                // 工作地点经纬度
            shangQuanList: {},                  // 商圈枚举列表
            memberId: '',
            positionId: '',
            pageType: ''
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
    },
    // 编辑职位时查询所有职位信息
    reqTotalPosition () {
        let URL = 'job/platformPosition/webGet'
        let _th = this
        let {positionId, publishPosition, filterItem, jobPlace, entryList, mianShiList, curEntryChoiceIn, curMainshiChoiceIn, meiJuList, placeLongitude} = _th.state
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
                    if (data.interviewBid === parseInt(v)) {
                        curMainshiChoiceIn = index
                    }
                })
                filterItem.jobType = data.typeCode.split(';')
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
                if (data.lableList !== null) {
                    _th.setState({
                        lableList: data.welfare.split(';')
                    })
                }
                if (data.province === '') {
                    municipality = true
                    publishPosition.province = data.city
                    if (data.district === '') {
                        publishPosition.city = 'ALL_BUXIAN'
                    } else {
                        publishPosition.city = data.district
                    }
                } else {
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
                if (data.workProvince === '') {
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
                    jobPlace.building = data.workLocation.split('-').pop()
                } else {
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

                    jobPlace.building = data.workLocation.split('-').pop()
                }
                placeLongitude.lng = data.longitude
                placeLongitude.lat = data.latitude
                _th.setState({
                    curEntryChoiceIn: curEntryChoiceIn,
                    curMainshiChoiceIn: curMainshiChoiceIn,
                    filterItem: filterItem,
                    municipalityPlace: municipalityPlace,
                    publishPosition: publishPosition,
                    jobPlace: jobPlace,
                    placeLongitude: placeLongitude
                }, () => {
                    let {jobPlace, municipalityPlace} = _th.state
                    _th.filterEditCityList(publishPosition, 'publish')
                    _th.filterEditCityList(jobPlace, 'place')
                    if (municipalityPlace) {
                        _th.shangQuanListFn(jobPlace.city)
                    } else {
                        _th.shangQuanListFn(jobPlace.county)
                    }
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 筛选编辑页面省市
    filterEditCityList (position, type) {
        if (type === 'publish') {
            let result = []
            if (position.province === '110100' || position.province === '120100' || position.province === '310100' || position.province === '500100') {
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
            if (position.province === '110100' || position.province === '120100' || position.province === '310100' || position.province === '500100') {
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
        formData.types = '1;2;5;27'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                meiJuList.pay = [...data['2']]
                meiJuList.experience = [...data['5']]
                meiJuList.educational = [...data['1']]
                meiJuList.jobXingZhi = [...data['27']]
                _th.setState({
                    meiJuList: meiJuList
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 商圈枚举接口
    shangQuanListFn (id) {
        let URL = `images/town${id}.json`
        let _th = this
        let {jobPlace} = _th.state
        getRequest(true, URL, {}).then(function (res) {
            let data = JSON.parse(res)
            if (jobPlace.road !== 'ALL_BUXIAN') {
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
                                lableList: [...welfares]
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
                        })
                    } else {
                        message.error('还未认证成功，暂时还不能发布职位!')
                        return false
                    }
                } else {
                    if (welfares !== null && welfares.length > 0) {
                        _th.setState({
                            lableList: [...welfares]
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
            } else {
                message.error('系统错误!')
            }
        })
    },
    welfareLableDelete (index, type) {
        let {lableList, mianShiList, entryList} = this.state
        if (type === 'lableList') {
            lableList.splice(index, 1)
            this.setState({
                lableList: lableList
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
    },
    welfareLableAdd (type) {
        let {lableList, mianShiList, entryList} = this.state
        if (type === 'lableList') {
            lableList.push('init')
            this.setState({
                lableList: lableList
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
    },
    addLableFn (e, index, type) {
        let {lableList, mianShiList, entryList} = this.state
        let val = e.target.value
        if (type === 'lableList') {
            lableList[index] = val
            this.setState({
                lableList: lableList
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
            })
        }
    },
    // 职位类别，学历要求，工作经验，年龄，到，月薪，工作性质
    filterItemFn (val, type) {
        let {filterItem} = this.state
        filterItem[type] = val
        this.setState({
            filterItem: filterItem
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
    // 省市县三级列表筛选---工作地点
    areaFilterPlaceFn (val, type) {
        let {citySelectListPlace, jobPlace} = this.state
        if (type === 'province') {
            if (val === '110100' || val === '120100' || val === '310100' || val === '500100') {
                this.setState({
                    municipalityPlace: true
                })
            } else {
                this.setState({
                    municipalityPlace: false
                })
            }
        }
        if (this.isZhiXizCityFn(jobPlace)) {
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
    // 工作地点
    filterItemFnPlace (val, type) {
        let {jobPlace, countySelectListPlace, roadSelectListPlace, shangQuanList} = this.state
        if (type === 'building') {
            val = val.target.value
        }
        jobPlace[type] = val
        if (type === 'city' && val === 'ALL_BUXIAN') {
            jobPlace.county = 'ALL_BUXIAN'
            jobPlace.road = 'ALL_BUXIAN'
            countySelectListPlace = [{id: 'ALL_BUXIAN', value: '不限'}]
            roadSelectListPlace = [{id: 'ALL_BUXIAN', value: '不限'}]
            shangQuanList = {}
        }
        if (type === 'county' && val === 'ALL_BUXIAN') {
            jobPlace.road = 'ALL_BUXIAN'
            roadSelectListPlace = [{id: 'ALL_BUXIAN', value: '不限'}]
            shangQuanList = {}
        }
        this.setState({
            jobPlace: jobPlace,
            countySelectListPlace: countySelectListPlace,
            roadSelectListPlace: roadSelectListPlace,
            shangQuanList: shangQuanList
        }, () => {
            if (type === 'province' || type === 'city' || type === 'county') {
                this.areaFilterPlaceFn(val, type)
            }
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
        Object.values(dataCopy).forEach((v, index) => {
            if (v === '' || v === undefined) {
                result = true
            }
        })
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
                                        result += `${vCG.value}`
                                    }
                                })
                            }
                        })
                    }
                })
                for (let key in shangQuanList) {
                    if (key === data.road) {
                        result = `${result}-${shangQuanList[key]}`
                    }
                }
            }
        }
        return result
    },
    // 确认发布
    onPublish () {
        this.setState({
            isPublish: true
        }, () => {
            let {publishPosition, jobPlace, filterItem, placeLongitude, jobTil, mianShiList, entryList, lableList, curMainshiChoiceIn, curEntryChoiceIn, jobDes, memberId} = this.state
            let hasNull = false
            let formDate = {}

            hasNull = this.cityHasNullFn(publishPosition)
            hasNull = this.cityHasNullFn(jobPlace)
            if (filterItem.jobType === undefined || filterItem.jobNature === undefined) {
                hasNull = true
            }
            if (filterItem.ageForm !== undefined && filterItem.ageTo === undefined) {
                hasNull = true
            }
            if (hasNull) {
                message.warning('您有未添信息，请完善信息！')
                return false
            } else {
                if (this.isZhiXizCityFn(publishPosition)) {
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
                formDate.welfare = lableList.join(';')      // 福利标签
                formDate.description = jobDes      // 描述
                formDate.interviewBid = mianShiList[curMainshiChoiceIn]      // 面试费选中
                formDate.entryBid = entryList[curEntryChoiceIn]      // 入职费选中
                formDate.interviewBids = entryList.join(';')     // 面试费list
                formDate.entryBids = entryList.join(';')     // 入职费list
                formDate.longitude = placeLongitude.lng      // 经度
                formDate.latitude = placeLongitude.lat      // 纬度
                formDate.location = this.queryCityNameFn(publishPosition, 'publishPosition')
                formDate.workLocation = this.queryCityNameFn(jobPlace, 'jobPlace')
                formDate.companyId = memberId
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
                message.success('保存成功!')
                if (pageType === 'new') {
                    window.location.hash = 'positionManager/recruitIng?newSkip=true'
                } else {
                    _th.reqTotalPosition()
                }
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
    render () {
        let {mianShiList, entryList, lableList, textAreaCount, jobTilCount, jobDes, jobTil, jobPlace, filterItem, publishPosition, isPublish, curMainshiChoiceIn, curEntryChoiceIn, citySelectList, countySelectList, roadSelectList, municipality, citySelectListPlace, countySelectListPlace, roadSelectListPlace, municipalityPlace, meiJuList, ageMeiJuListL} = this.state
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
                        {/* <Select placeholder="不限" style={selectStyle} size='large'
                                value={publishPosition.road}
                                notFoundContent='请选择区县'
                                className={isPublish && publishPosition.road === undefined ? 'selectNullClass' : ''}
                                onChange={(val) => this.filterItemPublish(val, 'road')}>
                            {
                                roadSelectList.map((v, index) => {
                                    return <Option value={v.id} key={v.id}>{v.value}</Option>
                                })
                            }
                        </Select>
                        <div className='juTi'>
                            <Input placeholder="请输入地址" style={isPublish && publishPosition.building === undefined ? {...inputStyle, marginLeft: '76px', borderColor: 'red'} : {...inputStyle, marginLeft: '76px'}}
                                    value={publishPosition.building} onBlur={this.adressPublishBlur}
                                    size='large' onChange={(val) => this.filterItemPublish(val, 'building')}/>
                        </div> */}
                    </div>
                    <div className='jobTitle'>
                        <lable className="lab">职位标题</lable>
                        <Input placeholder="请输入职位标题" style={inputStyle} size='large' onChange={this.jobTilChange} value={jobTil}/>
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
                                size='large' onChange={(val) => this.filterItemFn(val, 'educational')}>
                            {this.hasProtopyFn('educational').map((v, index) => {
                                return (
                                    <Option value={`${v.code}`} key={index}>{v.content}</Option>
                                )
                            })}
                        </Select>
                        <Select placeholder="工作经验" style={selectStyle} value={filterItem.experience}
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
                        <Select placeholder="月薪" style={selectStyle} value={filterItem.pay}
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
                    </div>
                    <div className='welfareLable'>
                        <lable className="lab">福利标签</lable>
                        <div className='itemBox'>
                            {lableList.map((v, index) => {
                                if (v !== 'init' && v !== '') {
                                    return (
                                        <span className='val' key={index}>
                                            {v}
                                            <span className='close' onClick={() => this.welfareLableDelete(index, 'lableList')}>×</span>
                                        </span>
                                    )
                                } else if (v === 'init' && v !== '') {
                                    return (
                                        <span className='val' key={index} style={{padding: '0'}}>
                                            <Input size='large' onBlur={(e) => this.addLableFn(e, index, 'lableList')}
                                                   ref={(input) => { this.textInput = input }}
                                                   style={{width: '90px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                            <span className='close' onClick={() => this.welfareLableDelete(index, 'lableList')}>×</span>
                                        </span>
                                    )
                                }
                            })}
                            <span className='custom' onClick={() => this.welfareLableAdd('lableList')}>
                                <Icon type="plus" style={{fontSize: '20px', verticalAlign: 'sub', marginRight: '5px'}}/>
                                自定义
                        </span>
                        </div>
                    </div>
                    <div className='jobDescribe'>
                        <lable className="lab">职位描述</lable>
                        <TextArea rows={4} style={{height: '140px', ...inputStyle}} placeholder='岗位职责：任职资格：工作时间：' onChange={this.jobDesChange} value={jobDes}/>
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
                            <Input placeholder="请输入工作地点" value={jobPlace.building} onBlur={this.adressPlaceBlur}
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
                    <div className='confirm'>
                        <span className='btn' onClick={this.onPublish}>确认发布</span>
                    </div>
                </div>
            </div>
        )
    }
})

export default PositionManagerEdit
