import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import {message, Pagination, Select, Icon, Input} from 'antd'
import util from '../../common/util'
import './candidate.less'
const Search = Input.Search

let ageList = ['16', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '99']
let eduList = ['初中及以下', '中专/技校', '高中', '大专', '本科', '硕士', '博士']
let yearList = [{val: '无经验', txt: '无经验'}, {val: '在读学生', txt: '在读学生'}, {val: '应届毕业生', txt: '应届毕业生'}, {val: '1以内', txt: '1年以内'}, {val: '1-2', txt: '1-2年'}, {val: '2-3', txt: '2-3年'}, {val: '3-5', txt: '3-5年'}, {val: '5-8', txt: '5-8年'}, {val: '8-10', txt: '8-10年'}, {val: '10以上', txt: '10年以上'}]
let genderList = [{val: 0, txt: '男'}, {val: 1, txt: '女'}]
let salaryList = [{val: '1000-2000', txt: '1000-2000元'}, {val: '2000-3000', txt: '2000-3000元'}, {val: '3000-5000', txt: '3000-5000元'}, {val: '5000-8000', txt: '5000-8000元'}, {val: '8000-12000', txt: '8000-12000元'}, {val: '12000-20000', txt: '12000-20000元'}, {val: '20000以上', txt: '20000元以上'}, {val: '面议', txt: '面议'}]
let AllCandidate = React.createClass({
    getInitialState () {
        return {
            resumeSource: [],
            searchList: {
                keyword: undefined,
                workYears: undefined,
                education: undefined,
                salary: undefined,
                gender: undefined,
                ageStr: undefined,
                ageForm: undefined,
                ageTo: undefined
            },
            ageList: ageList,             // 年龄列表
            educationList: eduList,       // 学历列表
            workYearsList: yearList,      // 工作年限列表
            genderList: genderList,
            salaryList: salaryList,
            curPage: 1,
            pageTotal: 0,
            pageSize: 20
        }
    },
    componentDidMount () {
        this.getResume()
    },
    getResume () {
        let {resumeSource, curPage, pageSize, searchList} = this.state
        let URL = 'member/companyResume/searchCompanyResume'
        let formData = {
            page: curPage,
            pageSize: pageSize,
            workYears: searchList.workYears,
            education: searchList.education,
            ageStr: searchList.ageStr,
            keyword: searchList.keyword,
            sex: searchList.gender,
            salary: searchList.salary,
            deleted: 0
        }
        let _th = this
        getRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                resumeSource = res.data.rows
                _th.setState({
                    resumeSource: resumeSource,
                    pageTotal: res.data.total
                })
            } else {
                message.error(res.message)
            }
        })
    },
    dowmloadResum (id) {
        let URL = 'member/companyResume/get'
        let companyId = localStorage.getItem('memberId')
        let _th = this
        let formData = {
            memberId: companyId,
            companyResumeId: id
        }
        getRequest(true, URL, formData).then(function (res) {
            if (res.code === 0) {
                message.success('简历下载成功！')
                setTimeout(function () {
                    _th.getResume()
                    window.localStorage.setItem('hasChangeResume', 'true')
                }, 1000)
                // _th.getResume()
            } else {
                message.error(res.message)
            }
        })
    },
    searchResum (val, type) {
        let {searchList} = this.state
        let _th = this
        searchList[type] = val
        if (type === 'ageForm') {
            if (val === undefined) {
                searchList.ageTo = val
                searchList.ageStr = val
            } else {
                if (val >= searchList.ageTo || searchList.ageTo === undefined) {
                    searchList.ageStr = searchList.ageForm + ';' + '99'
                    searchList.ageTo = undefined
                } else {
                    searchList.ageStr = searchList.ageForm + ';' + searchList.ageTo
                }
            }
        } else if (type === 'ageTo') {
            if (val === undefined) {
                searchList.ageStr = searchList.ageForm + ';' + '99'
            } else {
                searchList.ageStr = searchList.ageForm + ';' + searchList.ageTo
            }
        }
        this.setState({
            searchList: searchList
        }, () => {
            _th.getResume()
        })
    },
    searchBtnChange (val, type) {
        let value = val.target.value
        let {searchList} = this.state
        searchList[type] = value
        this.setState({
            searchList: searchList
        })
    },
    searchBtnResum () {
        this.getResume()
    },
    // 自我描述超出部分隐藏
    hideSelfAssessment (val) {
        if (this.isNull(val)) {
            return true
        } else {
            if (val.length > 160) {
                return false
            } else {
                return true
            }
        }
    },
    // 获取自我描述
    getSelfAssessment (val) {
        if (this.isNull(val)) {
            return ''
        } else {
            if (val.length > 160) {
                return val.slice(0, 160) + '...'
            } else {
                return val
            }
        }
    },
    // 自我描述点击隐藏显示
    toggleTxt (e, id) {
        let itemDesc = document.getElementById('itemDesc_' + id)
        let itemDescAll = document.getElementById('itemDescAll_' + id)
        if (e.target.innerHTML === '展开查看') {
            itemDesc.style.display = 'none'
            itemDescAll.style.display = 'block'
            e.target.innerHTML = '收起'
        } else {
            itemDesc.style.display = 'block'
            itemDescAll.style.display = 'none'
            e.target.innerHTML = '展开查看'
        }
    },
    // 隐藏手机号
    hiddenTel (tel) {
        tel = tel.replace(/\s*/g, '')
        let phoneStr = tel.substr(3, 4)
        let newPhone = tel.replace(phoneStr, '****')
        return newPhone
    },
    // 隐藏邮箱
    hiddenMail (mail) {
        let idx = mail.indexOf('@')
        let mailStr = ''
        let newMail = ''
        if (idx > 2) {
            mailStr = mail.substr(2, (idx - 2))
            newMail = mail.replace(mailStr, this.signNum(idx - 2))
        } else {
            mailStr = mail.substr(0, idx)
            newMail = mail.replace(mailStr, this.signNum(idx))
        }
        return newMail
    },
    signNum (num) {
        let str = ''
        for (var i = 0; i < num; i++) {
            str += '*'
        }
        return str
    },
    // 职位名
    getPosition (val) {
        if (this.isNull(val)) {
            return ''
        } else {
            return val
        }
    },
    // 经验
    getWorkYears (val) {
        if (this.isNull(val)) {
            return ''
        } else {
            if (val === '应届毕业生' || val === '无经验' || val === '在读学生') {
                return val
            } else if (val.indexOf('以') > 0) {
                return val.replace('以', '年以')
            } else {
                return val + '年'
            }
        }
    },
    getGender (val) {
        if (val === 0) {
            return '男'
        } else {
            return '女'
        }
    },
    getSalary (val) {
        if (val === '面议') {
            return val
        } else if (val.indexOf('以') > 0) {
            return val.replace('以', '元以')
        } else {
            return val + '元'
        }
    },
    getDate (val) {
        let date = new Date(val)
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    },
    ChangePagination (val) {
        let _th = this
        _th.setState({
            curPage: val
        }, () => {
            _th.getResume()
        })
    },
    isNull (val) {
        if (val === undefined || val === null || val === '') {
            return true
        } else {
            return false
        }
    },
    hasResume (companyIds) {
        let companyId = localStorage.getItem('memberId')
        let companyIdStr = '&' + companyId + '&'
        if (!this.isNull(companyIds) && companyIds.indexOf(companyIdStr) > -1) {
            return true
        } else {
            return false
        }
    },
    render () {
        let {resumeSource, curPage, pageTotal, pageSize, ageList, educationList, workYearsList, genderList, salaryList, searchList} = this.state
        let selectStyle = {width: '120px', marginRight: '10px', marginTop: '10px'}
        return (
            <div className='candidateMain' style={resumeSource.length === 0 ? {height: '100%'} : {minHeight: 'calc(~"100% + 10px")'}}>
                <div className={resumeSource.length === 0 ? 'content nullContent' : 'content'} style={resumeSource.length === 0 ? {height: '100%', backgroundColor: '#fff'} : {minHeight: 'calc(~"100% + 10px")'}}>
                    <div className="til">
                        <Select allowClear placeholder="工作年限" style={selectStyle} value={searchList.workYears} onChange={(val) => this.searchResum(val, 'workYears')}>
                            {workYearsList.map((v, index) => {
                                return (<Option value={v.val} key={index}>{v.txt}</Option>)
                            })}
                        </Select>
                        <Select allowClear placeholder="学历" style={selectStyle} value={searchList.education} onChange={(val) => this.searchResum(val, 'education')}>
                            {educationList.map((v, index) => {
                                return (<Option value={v} key={index}>{v}</Option>)
                            })}
                        </Select>
                        <Select allowClear placeholder="期望月薪" style={selectStyle} value={searchList.salary} onChange={(val) => this.searchResum(val, 'salary')}>
                            {salaryList.map((v, index) => {
                                return (<Option value={v.val} key={index}>{v.txt}</Option>)
                            })}
                        </Select>
                        <Select allowClear placeholder="性别" style={selectStyle} value={searchList.gender} onChange={(val) => this.searchResum(val, 'gender')}>
                            {genderList.map((v, index) => {
                                return (<Option value={v.val} key={index}>{v.txt}</Option>)
                            })}
                        </Select>
                        <Select allowClear placeholder="年龄" style={selectStyle} value={searchList.ageForm}
                                size='large' onChange={(val) => this.searchResum(val, 'ageForm')}>
                            {ageList.map((v, index) => {
                                return (
                                    <Option value={v} key={index}>{v}</Option>
                                )
                            })}
                        </Select>
                        <Select allowClear placeholder="到" style={selectStyle} value={searchList.ageTo}
                                size='large' onChange={(val) => this.searchResum(val, 'ageTo')}>
                            {ageList.filter(v => v > searchList.ageForm).map((v, index) => {
                                return (
                                    <Option value={v} key={index}>{v}</Option>
                                )
                            })}
                        </Select>
                        <Search className='searchIcon'
                            placeholder="输入关键词，如 销售"
                            onChange={(val) => this.searchBtnChange(val, 'keyword')}
                            value={searchList.keyword}
                            onSearch={this.searchBtnResum}
                            style={{ width: 300 }}
                        />
                    </div>
                    {resumeSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                    {resumeSource.map((v, index) => {
                        return (
                            <div className='item'>
                                <div className="itemTop">
                                    {this.hasResume(v.companyIds) ? <div className="resumeBtn unClick">已下载</div> : <div className="resumeBtn" onClick={() => this.dowmloadResum(v.id)}>下载简历</div>}
                                    <div className="itemBox">
                                        <span className='name'>{v.name}</span>
                                        <div className="itemListPosition">
                                            {this.getPosition(v.positionTitle)}
                                        </div>
                                        {this.isNull(v.phone) ? null : <span>{this.hasResume(v.companyIds) ? <span className="phoneNumber looked">手机号码：{v.phone}</span> : <span className="phoneNumber">手机号码：{this.hiddenTel(v.phone)}</span>}</span>}
                                        {this.isNull(v.mail) ? null : <span>{this.hasResume(v.companyIds) ? <span className="mailNumber looked">邮箱：{v.mail}</span> : <span className="mailNumber">邮箱：{this.hiddenMail(v.mail)}</span>}</span>}
                                    </div>
                                    <div className="itemBox">
                                        <div className="itemList">
                                            <span>{v.workAddress}</span>
                                            <span>|</span>
                                            {this.getWorkYears(v.workYears) === '' ? null : <span>{this.getWorkYears(v.workYears)}</span>}
                                            {this.getWorkYears(v.workYears) === '' ? null : <span>|</span>}
                                            <span>{v.education}</span>
                                            <span>|</span>
                                            {this.isNull(v.gender) ? null : <span>{this.getGender(v.gender)}</span>}
                                            {this.isNull(v.gender) ? null : <span>|</span>}
                                            {this.isNull(v.age) ? <span>0岁</span> : <span>{v.age}岁</span>}
                                            {this.isNull(v.age) ? <span>|</span> : <span>|</span>}
                                            {this.isNull(v.expectSalary) ? null : <span>{this.getSalary(v.expectSalary)}</span>}
                                            {this.isNull(v.expectSalary) ? null : <span>|</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="itemBtm">
                                    <div className='itemDesc' id={'itemDesc_' + v.id}>
                                        自我描述：{this.getSelfAssessment(v.selfAssessment)}
                                    </div>
                                    {this.hideSelfAssessment(v.selfAssessment) ? null : <div className='itemDescAll' id={'itemDescAll_' + v.id}>
                                        自我描述：{v.selfAssessment}
                                    </div>}
                                    {this.hideSelfAssessment(v.selfAssessment) ? null : <span className='btn' onClick={(e) => this.toggleTxt(e, v.id)}>展开查看</span>}
                                    <div className="time">{this.getDate(v.createTime)}分享</div>
                                </div>
                            </div>
                        )
                    })}
                    {
                        resumeSource.length === 0
                            ? null
                            : <div className='my_pagination'>
                                <Pagination showQuickJumper current={curPage} total={pageTotal} pageSize={pageSize} size='large' onChange={this.ChangePagination}/>
                            </div>
                    }
                </div>
            </div>
        )
    }
})

export default AllCandidate
