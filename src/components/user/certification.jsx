import React from 'react'
import {Input, Upload, Icon, Modal, message, Select} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import './certification.less'
import addressData from '../../common/area'

const Option = Select.Option
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
let Certification = React.createClass({
    getInitialState () {
        return {
            previewVisible: false,
            previewImage: '',
            fileList: [],
            formList: {
                userName: '',
                zhiWei: '',
                companyName: '',
                trade: undefined,
                companyJian: ''
            },
            tradeList: [],
            companyPosition: {
                province: undefined,           // 省
                city: undefined,               // 市
                county: undefined,             // 区
                building: undefined            // 详细地址
            },
            citySelectList: [],
            countySelectList: [],
            roadSelectList: [],
            municipality: false,               // 判断是否是直辖市
            daoAddHasNull: false,
            count: 0,
            hasSave: false,
            isLookThrough: false,
            picName: '',
            memberId: ''
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        if (hash.indexOf('memberId') > -1) {
            hash = hash.split('?')[1].split('=')[1]
            this.setState({
                memberId: hash
            })
            this.reqMeiJUListFn()
        } else {
            window.location.href = ''
        }
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
    handleChange ({ fileList }) {
        let result = ''
        fileList.forEach((v, index) => {
            if (v.response !== undefined) {
                result = v.response.data
            }
        })
        this.setState({
            fileList: fileList,
            picName: result
        })
    },
    formListChangeFn (val, type) {
        let {formList} = this.state
        let value = ''
        if (type === 'trade') {
            value = val
        } else {
            value = val.target.value
        }
        formList[type] = value
        this.setState({
            formList: formList
        })
    },
    // 判断公司位置是否为空
    // businessInputIsNull (type) {
    //     let {daoAddHasNull, companyPosition} = this.state
    //     return (daoAddHasNull && (companyPosition[type] === undefined || companyPosition[type] === '')) ? true : false
    // },
    reqMeiJUListFn () {
        let URL = 'member/platformDict/selectDictionariesGroupByType'
        let _th = this
        let formData = {}
        formData.types = '12'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    tradeList: [...data['12']]
                })
            } else if (code !== 401) {
                message.error(res.message)
            }
        })
    },
    handleSelectChange (val, type) {
        let {companyPosition} = this.state
        if (type === 'building') {
            val = val.target.value
            if (val.length > 30) {
                val = val.slice(0, 30)
            }
        }
        if (type === 'province' || type === 'city') {
            this.areaFilterFn(val, type)
        }
        companyPosition[type] = val
        this.setState({
            companyPosition: companyPosition
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
    areaFilterFn (val, type) {
        let {citySelectList, countySelectList, companyPosition} = this.state
        if (type === 'province') {
            addressData.map((v, index) => {
                if (v.id === val) {
                    citySelectList = [...v.children]
                    companyPosition.city = citySelectList[0].id
                    if (citySelectList[0].children !== undefined) {
                        countySelectList = citySelectList[0].children
                        companyPosition.county = countySelectList[0].id
                    } else {
                        countySelectList = []
                        companyPosition.county = ''
                    }
                    this.setState({
                        citySelectList: citySelectList,
                        countySelectList: countySelectList,
                        companyPosition: companyPosition
                    })
                    this.isMunicipalityFn(val)
                }
            })
        } else if (type === 'city') {
            citySelectList.map((v, index) => {
                if (v.id === val && v.children !== undefined) {
                    countySelectList = [...v.children]
                    companyPosition.county = countySelectList[0].id
                    this.setState({
                        countySelectList: countySelectList,
                        companyPosition: companyPosition
                    })
                }
            })
        }
    },
    // 判断是否是直辖市
    isMunicipalityFn (val) {
        if (val === '110100' || val === '120100' || val === '310100' || val === '500100') {
            this.setState({
                municipality: true
            })
        } else {
            this.setState({
                municipality: false
            })
        }
    },
    getHeaders () {
        let uuid = window.localStorage.getItem('sessionUuid')
        return {
            Authorization: uuid === null ? '' : `DingYi ${uuid}`
        }
    },
    onSave () {
        this.setState({
            hasSave: true
        }, () => {
            let {formList, companyPosition, citySelectList, countySelectList, picName, memberId, municipality} = this.state
            let hasNull = false
            let formData = {}
            for (var v in formList) {
                if (formList[v] === '' || formList[v] === null || formList[v] === undefined) {
                    hasNull = true
                }
            }
            if (municipality) {
                for (let key in companyPosition) {
                    if (key !== 'county') {
                        if (companyPosition[key] === undefined || companyPosition[key] === '') {
                            hasNull = true
                        }
                    }
                }
            } else {
                for (let key in companyPosition) {
                    if (companyPosition[key] === undefined || companyPosition[key] === '') {
                        hasNull = true
                    }
                }
            }
            if (picName === '') {
                hasNull = true
            }
            if (hasNull) {
                message.warning('你有信息尚未填写或者未上传企业执照片，请完善信息！')
            } else {
                // 获取用户输入的地址信息
                let positionVal = {}
                addressData.map((v, index) => {
                    if (v.id === companyPosition.province) {
                        positionVal.province = v.value
                    }
                })
                citySelectList.length > 0 && citySelectList.map((v, index) => {
                    if (v.id === companyPosition.city) {
                        positionVal.city = v.value
                    }
                })
                countySelectList.length > 0 && countySelectList.map((v, index) => {
                    if (v.id === companyPosition.county) {
                        positionVal.county = v.value
                    }
                })
                positionVal.building = companyPosition.building
                formData.userName = formList.userName
                formData.userPosition = formList.zhiWei
                formData.name = formList.companyName
                formData.shortName = formList.companyJian
                formData.trade = formList.trade
                formData.licencePic = picName
                formData.memberId = memberId
                if (municipality) {
                    formData.province = companyPosition.province
                    formData.city = companyPosition.province
                    formData.district = companyPosition.city
                    formData.location = `${positionVal.province}-${positionVal.city}-`
                } else {
                    formData.province = companyPosition.province
                    formData.city = companyPosition.city
                    formData.district = companyPosition.county
                    formData.location = `${positionVal.province}-${positionVal.city}-${positionVal.county}-`
                }
                formData.address = companyPosition.building
                this.addessInvaildFn(positionVal, formData)
            }
        })
    },
    // 判断用户输入地址是否有效
    addessInvaildFn (positionVal, formData) {
        let _th = this
        let building = positionVal.building
        let city = ''
        if (positionVal.province === '北京市' || positionVal.province === '天津市' || positionVal.province === '重庆市' || positionVal.province === '上海市') {
            city = positionVal.province
        } else {
            city = positionVal.city
        }
        let BMap = window.BMap
        let myGeo = new BMap.Geocoder() // 创建一个地址解析器的实例
        myGeo.getPoint(building, function (point) {
            if (point === null) {
                message.warning('您输入的地址无效，请重新输入！')
            } else {
                formData.longitude = point.lng
                formData.latitude = point.lat
                _th.reqShenHe(formData)
            }
        }, city)
    },
    // 提交审核
    reqShenHe (formData) {
        let URL = 'member/company/updateCheckInformation'
        let _th = this
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('提交成功，正在审核中...!')
                _th.setState({
                    isLookThrough: true
                })
            } else if (code === 1062) {
                if (res.data.state === 3) {
                    message.warning('审核通过请登录')
                    window.location.hash = '/login'
                } else if (res.data.state === 1) {
                    message.warning('正在审核中，请等待审核通过后再登录')
                    window.location.hash = '/login'
                }
            } else if (code === 401) {
                message.warning('没有权限，不能提交审核！')
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 地址代码转文字
    changePosition (v) {
        let {municipality} = this.state
        let item = {}
        if (municipality) {
            addressData.map((vC, indexC) => {
                if (vC.id === v.province) {
                    item.province = vC.value
                    item.city = vC.value
                    vC.children.map((vCC, indexCC) => {
                        if (vCC.id === v.city) {
                            item.county = vCC.value
                        }
                    })
                }
            })
            return (item.province + '-' + item.county + '-' + v.building)
        } else {
            addressData.map((vC, indexC) => {
                if (vC.id === v.province) {
                    item.province = vC.value
                    vC.children.map((vCC, indexCC) => {
                        if (vCC.id === v.city) {
                            item.city = vCC.value
                            vCC.children.map((vCCC, indexCCC) => {
                                if (vCCC.id === v.county) {
                                    item.county = vCCC.value
                                }
                            })
                        }
                    })
                }
            })
            return (item.province + '-' + item.city + '-' + item.county + '-' + v.building)
        }
    },
    render () {
        let {previewVisible, previewImage, fileList, formList, tradeList, companyPosition, citySelectList, countySelectList, municipality, count, hasSave, isLookThrough, picName} = this.state
        let inputStyle = {width: '500px', backgroundColor: '#E6F5FF'}
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        const uploadButton = (
            <div>
                <Icon type="plus" style={{fontSize: '30px'}}/>
                <div className="ant-upload-text">营业执照</div>
            </div>
        )
        let selectStyle = {marginRight: '10px', width: '160px', backgroundColor: 'rgb(230, 245, 255)'}
        let tradeSelectStyle = {width: '500px', backgroundColor: 'rgb(230, 245, 255)'}
        return (
            <div className='Certification'>
                <div className="content">
                    <div className='header'>
                        资质认证
                    </div>
                    <div className='form'>
                        <div className='leftBox'>
                            <div className='inputBox'>
                                <label className='lable'>账号使用者</label>
                                {isLookThrough && formList.userName !== '' ? <span className='isLookThroughText'>{formList.userName}</span> : <Input placeholder="请输入姓名"
                                       style={hasSave && formList.userName === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'userName')} value={formList.userName}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>职位</label>
                                {isLookThrough && formList.zhiWei !== '' ? <span className='isLookThroughText'>{formList.zhiWei}</span> : <Input placeholder="请输入职位"
                                       style={hasSave && formList.zhiWei === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'zhiWei')} value={formList.zhiWei}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>公司名称</label>
                                {isLookThrough && formList.companyName !== '' ? <span className='isLookThroughText'>{formList.companyName}</span> : <Input placeholder="请输入公司名称"
                                       style={hasSave && formList.companyName === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'companyName')} value={formList.companyName}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>公司简称</label>
                                {isLookThrough && formList.companyJian !== '' ? <span className='isLookThroughText'>{formList.companyJian}</span> : <Input placeholder="请输入公司简称"
                                       style={hasSave && formList.companyJian === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'companyJian')} value={formList.companyJian}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>所在行业</label>
                                {isLookThrough && formList.trade !== '' ? <span className='isLookThroughText'>{formList.trade}</span> : <Select placeholder="请选择所在行业" style={tradeSelectStyle} size='large'
                                            className={hasSave && formList.trade === '' ? 'selectNullClass' : ''}
                                            onChange={(e) => this.formListChangeFn(e, 'trade')} value={formList.trade}>
                                        {tradeList.map((v, index) => {
                                            return (
                                                <Option value={v.content} key={index}>
                                                    {v.content}
                                                </Option>
                                            )
                                        })}
                                    </Select>}
                            </div>
                            <div className='inputBox'>
                                <lable className="lable">公司位置</lable>
                                {isLookThrough ? <span className='isLookThroughText'>{this.changePosition(companyPosition)}</span> : <div className='positionList'>
                                    <Select placeholder="请选择" style={selectStyle} size='large' value={companyPosition.province}
                                            className={hasSave && companyPosition.province === '' ? 'selectNullClass' : ''}
                                            onChange={(val) => this.handleSelectChange(val, 'province')}>
                                        {
                                            addressData.map((v, index) => {
                                                return <Option value={v.id} key={v.id}>{v.value}</Option>
                                            })
                                        }
                                    </Select>
                                    <Select placeholder="请选择" style={selectStyle} size='large' value={companyPosition.city}
                                            notFoundContent='请选择省份'
                                            className={hasSave && companyPosition.city === '' ? 'selectNullClass' : ''}
                                            onChange={(val) => this.handleSelectChange(val, 'city')}>
                                        {
                                            citySelectList.map((v, index) => {
                                                return <Option value={v.id} key={v.id}>{v.value}</Option>
                                            })
                                        }
                                    </Select>
                                    {!municipality ? <Select placeholder="请选择" style={{...selectStyle, marginRight: 0}} size='large' value={companyPosition.county}
                                                             notFoundContent='请选择城市'
                                                             className={hasSave && companyPosition.county === '' ? 'selectNullClass' : ''}
                                                             onChange={(val) => this.handleSelectChange(val, 'county')}>
                                        {
                                            countySelectList.map((v, index) => {
                                                return <Option value={v.id} key={v.id}>{v.value}</Option>
                                            })
                                        }
                                    </Select> : null}
                                    <Input placeholder="例：东宁路553号东溪德必易园C366" key={`BUILDING_${count}`}
                                           style={hasSave && companyPosition.building === '' ? {width: '500px', marginTop: '20px', borderColor: 'red'} : {width: '500px', marginTop: '20px'}}
                                           size='large' onChange={(val) => this.handleSelectChange(val, 'building')} onBlur={this.handleBlur}/>
                                </div>}
                            </div>
                            {!isLookThrough ? <div className='upLoad'>
                                <div className='lable'>上传营业执照 <span>（支持jpg/jpeg/png格式，文件不超过2M ）</span></div>
                                <span className='upLoadChild'>
                                    <Upload
                                        action="member/platformMember/upload"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={this.handlePreview}
                                        onChange={this.handleChange}
                                        headers={this.getHeaders()}
                                        beforeUpload={beforeUpload}

                                    >
                                      {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                      <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                    </Modal>
                                </span>
                            </div> : <span className='showLogo' style={{background: `url(${imgsURL}${picName}) no-repeat`}}></span>}
                            <div className='takeCare'>
                                <label className='lable'>注意：</label>
                                <span className='val'>
                                    <div>确保公司全称与提交认证/审核公司一致</div>
                                    <div>如为复印件/黑白扫描件，需要加盖公司公章</div>
                                    <div>不支持屏幕截图或翻拍图片</div>
                                    <div>不能有与鲸城无关的标注或水印</div>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                </span>
                            </div>
                            {isLookThrough ? <div className='comfirm'><span>审核中...</span></div> : <div className='comfirm' onClick={this.onSave}><span>提交审核</span></div>}
                        </div>
                        <div className='rightBox'>
                            <div className='pic'>
                                <span></span>
                            </div>
                            <div className='val'>完成企业认证，享受更多权益</div>
                            <div className='val'>发布职位进行招聘</div>
                            <div className='val'>轻松管理招聘流程</div>
                            <div className='val'>专业经纪人推送精准面试</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default Certification
