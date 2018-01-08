import React from 'react'
import {Select, Input, Icon, message, DatePicker} from 'antd'
import './businessInfo.less'
import {getRequest, postRequest} from '../../common/ajax'
import moment from 'moment'
import util from '../../common/util'
import addressData from '../../common/area'

const Option = Select.Option
let lightPointList = ['D轮融资', '即将上市', '免费零食', '老板人帅', '美女如云', '免费零食']
let fuLiList = ['周末双休', '带薪年假', '餐补', '房补']

let BasicInfo = React.createClass({
    getInitialState () {
        return {
            formList: {
                hangYe: undefined,
                people: '',
                province: undefined,
                city: undefined,
                date: undefined
            },
            lightPointList: lightPointList,
            fuLiList: fuLiList,
            hasSave: false,
            hangYeMeiJuListL: [],
            provinceList: [],
            cityList: [],
            isZhiXiaShi: false,
            savaSuccess: false,
            baseInfoAllInfo: {},
            hasClickEdit: false,
            businssGuiMo: []
        }
    },
    onFormChange (val, type) {
        let {formList} = this.state
        if (type === 'province') {
            if (val === '110100' || val === '120100' || val === '310100' || val === '500000') {
                this.setState({
                    isZhiXiaShi: true
                })
            } else {
                this.filterCity(val)
                this.setState({
                    isZhiXiaShi: false
                })
            }
        }
        formList[type] = val
        this.setState({
            formList: formList
        })
    },
    componentDidMount () {
        let {businssInfoAllInfo} = this.props
        this.reqMeiJUListFn()
        this.filterProince()
        this.setState({
            businssInfoAllInfo: {...businssInfoAllInfo}
        })
    },
    // 筛选省级列表
    filterProince () {
        let result = []
        addressData.map((v, index) => {
            result.push({id: v.id, value: v.value})
        })
        this.setState({
            provinceList: [...result]
        })
    },
    // 城市列表筛选
    filterCity (val) {
        let result = []
        addressData.map((v, index) => {
            if (v.id === val) {
                v.children.map((vC, indexC) => {
                    result.push({id: vC.id, value: vC.value})
                })
            }
        })
        this.setState({
            cityList: [...result]
        })
    },
    reqMeiJUListFn () {
        let URL = 'member/platformDict/selectDictionariesGroupByType'
        let _th = this
        let formData = {}
        formData.types = '4;12'
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {
                let data = res.data
                _th.setState({
                    hangYeMeiJuListL: [...data['12']],
                    businssGuiMo: [...data['4']]
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    delLightPointList (index, type) {
        let {lightPointList, fuLiList} = this.state
        if (type === 'lightPointList') {
            lightPointList.splice(index, 1)
            this.setState({
                lightPointList: lightPointList
            })
        } else {
            fuLiList.splice(index, 1)
            this.setState({
                fuLiList: fuLiList
            })
        }
    },
    addLightPointList (type) {
        let {lightPointList, fuLiList} = this.state
        if (type === 'lightPointList') {
            lightPointList.push('init')
            this.setState({
                lightPointList: lightPointList
            }, () => {
                this.textInput.focus()
            })
        } else {
            fuLiList.push('init')
            this.setState({
                fuLiList: fuLiList
            }, () => {
                this.textInput.focus()
            })
        }
    },
    addLableFn (e, index, type) {
        let {lightPointList, fuLiList} = this.state
        let val = e.target.value
        if (type === 'lightPointList') {
            lightPointList[index] = val
            this.setState({
                lightPointList: lightPointList
            })
        } else {
            fuLiList[index] = val
            this.setState({
                fuLiList: fuLiList
            })
        }
    },
    reqSaveFn (formData) {
        let URL = 'member/company/update'
        let _th = this
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('保存成功!')
                _th.props.reqBusinssInfoAllInfo()
                _th.setState({
                    hasClickEdit: false
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    onSave () {
        this.setState({
            hasSave: true
        }, () => {
            let {formList, isZhiXiaShi} = this.state
            let hasNull = false
            if (isZhiXiaShi) {
                delete formList.city
            }
            let values = Object.values(formList)
            values.forEach((v, index) => {
                if (v === '' || v === undefined) {
                    hasNull = true
                }
            })
            if (hasNull) {
                message.warning('您有信息尚未填写！')
                return false
            } else {
                let {formList, provinceList, cityList, lightPointList, fuLiList} = this.state
                let formData = {}
                formData.memberId = 5
                formData.trade = formList.hangYe
                formData.scale = formList.people
                formData.companyCreatetime = `${formList.date} 00:00:00`
                if (formList.province === '110100' || formList.province === '120100' || formList.province === '310100' || formList.province === '500000') {
                    formData.city = formList.province
                    provinceList.map((v, index) => {
                        if (v.id === formList.province) {
                            formData.location = v.value
                        }
                    })
                } else {
                    formData.city = formList.city
                    cityList.map((v, index) => {
                        if (v.id === formList.city) {
                            formData.location = v.value
                        }
                    })
                }
                formData.brightSpot = lightPointList.join(';')
                formData.welfare = fuLiList.join(';')
                this.reqSaveFn(formData)
            }
        })
    },
    onFormDateChange (date, dateStrings) {
        let {formList} = this.state
        formList.date = dateStrings
        this.setState({
            formList: formList
        })
    },
    componentWillReceiveProps (nextProps) {
        let {businssInfoAllInfo, hasNew} = nextProps
        let {formList} = this.state
        if (!hasNew) {
            formList.hangYe = businssInfoAllInfo.trade
            formList.people = businssInfoAllInfo.scale
            formList.province = businssInfoAllInfo.province
            formList.city = businssInfoAllInfo.location
            formList.date = util.getDateStrH(new Date(businssInfoAllInfo.companyCreatetime))
            this.setState({
                formList: formList,
                lightPointList: businssInfoAllInfo.companyBrightPoint || lightPointList,
                fuLiList: businssInfoAllInfo.companyWelfares || fuLiList
            })
        }
    },
    onEditClick () {
        let {formList} = this.state
        formList.city = undefined
        this.setState({
            hasClickEdit: true,
            formList: formList
        })
    },
    canEditFn () {
        let {hasNew} = this.props
        let {hasClickEdit} = this.state
        return hasNew || hasClickEdit ? true : false
    },
    render () {
        let {lightPointList, fuLiList, formList, hasSave, hangYeMeiJuListL, provinceList, cityList, isZhiXiaShi, businssGuiMo} = this.state
        let selectStyle = {width: '128px'}
        let inputStyle = {backgroundColor: '#E6F5FF', width: '128px'}
        return (
            <div className='BasicInfo'>
                <div className='title'>
                    基本信息
                </div>
                <div className='form'>
                    <div className='hangYe'>
                        <lable className="lableL">所在行业</lable>
                        {this.canEditFn() ? <Select placeholder="请选择所在行业" value={formList.hangYe} className={hasSave && formList.hangYe === undefined ? 'BasicInfoSelNullClass' : ''}
                                           style={selectStyle} onChange={(val) => this.onFormChange(val, 'hangYe')} size='large'>
                            {hangYeMeiJuListL.map((v, index) => {
                                return (
                                    <Option value={v.content} key={index}>
                                        {v.content}
                                    </Option>
                                )
                            })}
                        </Select> : <span className='showText'>{formList.hangYe}</span>}
                    </div>
                    <div className='people'>
                        <lable className="lableL">公司人员</lable>
                        {this.canEditFn() ? <Select placeholder="请选择公司规模" value={formList.people} className={hasSave && formList.people === undefined ? 'BasicInfoSelNullClass' : ''}
                                                    style={selectStyle} onChange={(val) => this.onFormChange(val, 'people')} size='large'>
                            {businssGuiMo.map((v, index) => {
                                return (
                                    <Option value={v.code} key={index}>
                                        {v.content}
                                    </Option>
                                )
                            })}
                        </Select> : <span className='showText'>{businssGuiMo.map((v, index) => {
                            if (formList.people === v.code) {
                                return v.content
                            }
                        })}</span>}
                    </div>
                    <div className='city'>
                        <lable className="lableL">所在城市</lable>
                        {this.canEditFn() ? <span>
                            <Select placeholder="请选择省份" style={selectStyle} value={formList.province} className={hasSave && formList.province === undefined ? 'BasicInfoSelNullClass' : ''}
                                    onChange={(val) => this.onFormChange(val, 'province')} size='large'>
                            {provinceList.map((v, index) => {
                                return <Option value={v.id} key={index}>{v.value}</Option>
                            })}
                        </Select>
                        <br/>
                            {isZhiXiaShi ? null : <Select placeholder="请选择城市" style={{...selectStyle, margin: '20px 0 0 76px'}} value={formList.city} className={hasSave && formList.city === undefined ? 'BasicInfoSelNullClass' : ''}
                                                          notFoundContent='请选择省份'
                                                          onChange={(val) => this.onFormChange(val, 'city')} size='large'>
                                {cityList.map((v, index) => {
                                    return <Option value={v.id} key={index}>{v.value}</Option>
                                })}
                            </Select>}
                        </span> : <span className='showText'>{formList.city}</span>}
                    </div>
                    <div className='date'>
                        <lable className="lableL">成立日期</lable>
                        {this.canEditFn() ? <DatePicker size='large' className={hasSave && formList.date === undefined ? 'dateNull' : ''}
                                              placeholder="请选择成立日期"
                                              onChange={this.onFormDateChange}
                                              format={'YYYY-MM-DD'}
                                              value={moment(formList.date, 'YYYY-MM-DD')}
                                              style={{width: '128px'}}/> : <span className='showText'>{formList.date}</span>}
                    </div>
                </div>
                <div className='lightPoint'>
                    <div className='til'>公司亮点</div>
                    <div className='lightPointList'>
                        {lightPointList.map((v, index) => {
                            if (v !== 'init' && v !== '') {
                                return (
                                    <span key={index} className='item'>
                                        {v}
                                        {this.canEditFn() ? <span className='close' onClick={() => this.delLightPointList(index, 'lightPointList')}>x</span> : null}
                                    </span>
                                )
                            } else if (v === 'init' && v !== '') {
                                return (
                                    <span key={index} className='item'>
                                        <Input onBlur={(e) => this.addLableFn(e, index, 'lightPointList')}
                                               ref={(input) => { this.textInput = input }}
                                               style={{width: '60px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                        {this.canEditFn() ? <span className='close' onClick={() => this.delLightPointList(index, 'lightPointList')}>x</span> : null}
                                    </span>
                                )
                            }
                        })}
                        {this.canEditFn() ? <span className='item add' onClick={() => this.addLightPointList('lightPointList')}>
                            <Icon type="plus" style={{fontSize: '18px', verticalAlign: 'text-top'}}/>
                            自定义
                        </span> : null}
                    </div>
                </div>
                <div className='lightFuli'>
                    <div className='til'>公司福利</div>
                    <div className='fuLiList'>
                        {fuLiList.map((v, index) => {
                            if (v !== 'init' && v !== '') {
                                return (
                                    <span key={index} className='item'>
                                        {v}
                                        {this.canEditFn() ? <span className='close' onClick={() => this.delLightPointList(index, 'fuLiList')}>x</span> : null}
                                    </span>
                                )
                            } else if (v === 'init' && v !== '') {
                                return (
                                    <span key={index} className='item'>
                                        <Input onBlur={(e) => this.addLableFn(e, index, 'fuLiList')}
                                               ref={(input) => { this.textInput = input }}
                                               style={{width: '60px', border: '0', height: '20px', boxShadow: 'none'}}/>
                                        {this.canEditFn() ? <span className='close' onClick={() => this.delLightPointList(index, 'fuLiList')}>x</span> : null}
                                    </span>
                                )
                            }
                        })}
                        {this.canEditFn() ? <span className='item add' onClick={() => this.addLightPointList('fuLiList')}>
                            <Icon type="plus" style={{fontSize: '18px', verticalAlign: 'text-top'}}/>
                            自定义
                        </span> : null}
                    </div>
                </div>
                {this.canEditFn() ? <div className='save' onClick={this.onSave}>
                    <span>保存</span>
                </div> : <div className='save' onClick={this.onEditClick}>
                    <span>编辑</span>
                </div>}
            </div>
        )
    }
})

export default BasicInfo
