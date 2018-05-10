import React from 'react'
import {Pagination, message, Modal, DatePicker, Button} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'
import util from '../../common/util'

let RecommendAll = React.createClass({
    getInitialState () {
        return {
            isChecked: false,
            id: '',
            entryTime: '',
            showDate: false
        }
    },
    itemClickFn (router) {
        window.location.hash = router
    },
    // 待处理---点击同意面试
    sendInvite (id) {
        let _th = this
        let URL = '/job/platformInterview/transformToWaitingInterview'
        let formData = {}
        formData.id = id
        formData.companyId = window.localStorage.getItem('memberId')
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('同意面试成功!')
                _th.props.reqDataSouce()
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 待处理---点击拒绝面试
    rejectSendInvite (id) {
        let _th = this
        let URL = '/job/platformInterview/personRefuseInvitation'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('拒绝面试成功!')
                _th.props.reqDataSouce()
            } else {
                message.error('系统错误!')
            }
        })
    },
    // 待面试---点击完成面试
    finishInterview (id) {
        let _th = this
        let URL = '/job/platformInterview/finishInterview'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('面试已完成!')
                _th.props.reqDataSouce()
            } else {
                message.error(res.message)
            }
        })
    },
    // 已面试---点击发送入职邀请
    finishInterviewS (id) {
        let {showDate} = this.state
        this.setState({
            id: id,
            showDate: !showDate
        })
    },
    hideDateFn () {
        let {showDate} = this.state
        this.setState({
            showDate: !showDate
        })
    },
    onFormDateChange (date, dateStrings) {
        this.setState({
            entryTime: dateStrings
        })
    },
    handleOk () {
        let {id, entryTime, showDate} = this.state
        let _th = this
        if (entryTime === '') {
            message.warning('请选择入职日期')
        } else {
            let URL = '/job/platformInterview/entryInvitation'
            let formData = {}
            formData.id = id
            formData.entryTime = entryTime
            postRequest(true, URL, formData).then((res) => {
                let code = res.code
                if (code === 0) {
                    message.success('发送邀请成功!')
                    _th.props.reqDataSouce()
                } else {
                    message.error(res.message)
                }
            })
            this.setState({
                id: '',
                showDate: !showDate
            })
        }
    },
    // 已面试---点击不合适
    improper (id) {
        let _th = this
        let URL = '/job/platformInterview/improper'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('面试不合适!')
                _th.props.reqDataSouce()
            } else {
                message.error(res.message)
            }
        })
    },
    // 待入职---点击已办理入职
    finishEntry (id) {
        let _th = this
        let URL = '/job/platformInterview/finishEntry'
        let formData = {}
        formData.id = id
        postRequest(true, URL, formData).then((res) => {
            let code = res.code
            if (code === 0) {
                message.success('状态修改成功 !')
                _th.props.reqDataSouce()
            } else {
                message.error(res.message)
            }
        })
    },
    // 已入职---点击已离职
    entryImproper (v) {
        let _th = this
        let URL = '/job/platformInterview/entryImproper'
        let formData = {}
        formData.id = v.id
        if (util.timeDifference(v.entryTime) + 1 >= 4) {
            message.error('处理时间已过，已通过考核期')
            _th.setState({
                isChecked: true
            })
        } else {
            postRequest(true, URL, formData).then((res) => {
                console.log(res)
                let code = res.code
                if (code === 0) {
                    message.success('状态更新成功!')
                    _th.props.reqDataSouce()
                } else {
                    message.error(res.message)
                }
            })
        }
    },
    render () {
        let {showDate} = this.state
        let {dataSource, pageSizeTotal, curPagination, pageSizePer} = this.props
        // dataSource = [{state: 1}, {state: 2}, {state: 3}, {state: 4}, {state: 5}, {state: 6}, {state: 7}, {state: 8}, {state: 9}, {state: 10}, {state: 11}, {state: 12}, {state: 13}, {state: 14}, {state: 15}]
        let {isChecked} = this.state
        return (
            <div className={dataSource.length === 0 ? 'RecommendAll nullContent' : 'RecommendAll'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                {v.state === 1 ? <div>
                                    <div className='onLine' onClick={() => this.sendInvite(v.id)}>同意面试</div>
                                    <div className='noGood' onClick={() => this.rejectSendInvite(v.id)}>拒绝面试</div>
                                </div> : null}
                                {v.state === 2 || v.state === 3 ? <div>
                                    <div className='onLine' onClick={() => this.finishInterview(v.id)}>完成面试</div>
                                    <div className='noGood' onClick={() => this.itemClickFn(`chatWindow?id=${v.fromMemberId}&name=${v.hrName}&headUrl=${v.personHeadUrl}&positionId=${v.positionId}`)}>联系推荐人</div>
                                </div> : null}
                                {v.state === 4 ? <div>
                                    <div className='onLine' onClick={() => this.finishInterviewS(v.id)}>发送入职邀请</div>
                                    <div className='noGood' onClick={() => this.improper(v.id)}>不合适</div>
                                </div> : null}
                                {v.state === 6 || v.state === 5 ? <div>
                                    <div className='onLine' style={v.state === 5 ? {border: '0', color: '#25CCF6'} : {border: '0', color: '#999999'}}>
                                        {v.state === 5 ? '候选人已接受' : '待候选人接受'}
                                    </div>
                                    <div className='noGood' onClick={() => this.finishEntry(v.id)}>已办理入职</div>
                                </div> : null}
                                {v.state === 7 ? <div>
                                    {util.timeDifference(v.entryTime) + 1 >= 4 ? null : <div className='onLine'>考核{util.timeDifference(v.entryTime) + 1}天</div>}
                                    {util.timeDifference(v.entryTime) + 1 >= 4 || isChecked ? <div className='noGood unGood'>考核期已过</div> : <div className='noGood' onClick={() => this.entryImproper(v)}>已离职</div>}
                                </div> : null}
                                {v.state === 11 ? <div>
                                    <div className='outline'>已拒绝面试</div>
                                </div> : null}
                                {v.state === 12 ? <div>
                                    <div className='outline'>取消面试</div>
                                </div> : null}
                                {v.state === 9 ? <div>
                                    <div className='outline'>未面试</div>
                                </div> : null}
                                {v.state === 8 ? <div>
                                    <div className='outline'>面试不合适</div>
                                </div> : null}
                                {v.state === 15 ? <div>
                                    <div className='outline'>放弃等待面试结果</div>
                                </div> : null}
                                {v.state === 10 ? <div>
                                    <div className='outline'>未入职</div>
                                </div> : null}
                                {v.state === 13 ? <div>
                                    <div className='outline'>拒绝入职邀请</div>
                                </div> : null}
                                {v.state === 14 ? <div>
                                    <div className='outline'>已离职</div>
                                </div> : null}
                            </div>
                        </div>
                    )
                })}
                {
                    pageSizeTotal === 0
                    ? null
                    : <div className='my_pagination'>
                            <Pagination current={curPagination} total={pageSizeTotal} pageSize={pageSizePer} size='large' onChange={this.props.paginationChange}/>
                      </div>
                }
                <Modal className='auditionModal'
                       title='选择入职日期'
                       visible={showDate}
                       onCancel={this.hideDateFn}
                       onOk={this.handleOk}
                       footer={[
                           <Button key="back" type="ghost" size="large" onClick={this.hideDateFn}>取 消</Button>,
                           <Button key="submit" type="primary" size="large" onClick={this.handleOk} style={{background: '#25ccf6', border: '1px solid #25ccf6'}}>
                               发送入职邀请
                           </Button>
                       ]}>
                    <div className='dateMain'>
                        <DatePicker size='large'
                                    placeholder="请选择入职日期"
                                    onChange={this.onFormDateChange}
                                    format={'YYYY-MM-DD'}
                                    style={{width: '200px'}}/>
                    </div>
                </Modal>
            </div>
        )
    }
})

export default RecommendAll
