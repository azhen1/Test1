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
let nowDate = new Date()
let BasicInfo = React.createClass({
    getInitialState () {
        return {
            formList: {
                hangYe: undefined,
                people: '',
                date: null
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
        formList[type] = val
        this.setState({
            formList: formList
        })
    },
    componentDidMount () {
        let {businssInfoAllInfo} = this.props
        this.reqMeiJUListFn()
        // this.filterProince()
        this.setState({
            businssInfoAllInfo: {...businssInfoAllInfo}
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
            } else if (code !== 401) {
                message.error(res.message)
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
                _th.props.reqBusinssInfoAllInfo(formData.memberId)
                _th.setState({
                    hasClickEdit: false
                })
            } else {
                message.error(res.message)
            }
        })
    },
    onSave () {
        this.setState({
            hasSave: true
        }, () => {
            let {formList, isZhiXiaShi} = this.state
            let hasNull = false
            for (var v in formList) {
                if (formList[v] === '') {
                    hasNull = true
                }
            }
            if (hasNull) {
                message.warning('您有信息尚未填写！')
                return false
            } else {
                let {formList, lightPointList, fuLiList} = this.state
                let formData = {}
                formData.memberId = this.props.memberId
                formData.trade = formList.hangYe
                formData.scale = formList.people
                formData.companyCreatetime = `${formList.date} 00:00:00`
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
        let {formList, isZhiXiaShi} = this.state
        if (!hasNew) {
            formList.hangYe = businssInfoAllInfo.trade
            formList.people = businssInfoAllInfo.scale
            let date = businssInfoAllInfo.companyCreatetime ? businssInfoAllInfo.companyCreatetime.replace(/-/g, '/') : ''
            formList.date = util.getDateStrH(new Date(date))
            this.setState({
                formList: formList,
                lightPointList: businssInfoAllInfo.companyBrightPoint || lightPointList,
                fuLiList: businssInfoAllInfo.companyWelfares || fuLiList
            })
        }
    },
    onEditClick () {
        let {formList} = this.state
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
    // 判断属性是否为空
    hasNull (val) {
        if (val === undefined || val === null || val === '') {
            return true
        } else {
            return false
        }
    },
    render () {
        let {lightPointList, fuLiList, formList, hasSave, hangYeMeiJuListL, businssGuiMo} = this.state
        let selectStyle = {width: '128px'}
        return (
            <div className='BasicInfo'>
                <div className='title'>
                    基本信息
                </div>
                <div className='form'>
                    <div className='hangYe'>
                        <lable className="lableL">所在行业</lable>
                        <span className='showText'>{this.hasNull(formList.hangYe) ? '未填写' : formList.hangYe}</span>
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
                        </Select> : <span className='showText'>{this.hasNull(formList.people) ? '未填写' : businssGuiMo.map((v, index) => {
                            if (formList.people === v.code) {
                                return v.content
                            }
                        })}</span>}
                    </div>
                    <div className='date'>
                        <lable className="lableL">成立日期</lable>
                        {this.canEditFn() ? <DatePicker size='large' className={hasSave && formList.date === undefined ? 'dateNull' : ''}
                                              placeholder="请选择成立日期"
                                              onChange={this.onFormDateChange}
                                              format={'YYYY-MM-DD'}
                                              defaultValue={formList.date !== 'NaN-NaN-NaN' ? moment(formList.date, 'YYYY-MM-DD') : null}
                                              style={{width: '128px'}}/> : <span className='showText'>{formList.date === 'NaN-NaN-NaN' ? '未填写' : formList.date}</span>}
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
                {this.canEditFn() ? <div className='save'>
                    <span onClick={this.onSave}>保存</span>
                </div> : <div className='save'>
                    <span onClick={this.onEditClick}>编辑</span>
                </div>}
            </div>
        )
    }
})

export default BasicInfo
