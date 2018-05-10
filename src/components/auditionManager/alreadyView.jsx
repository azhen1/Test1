import React from 'react'
import {Pagination, message, Modal, DatePicker, Button} from 'antd'
import CommonTpl from './common/commonTpl'
import {postRequest} from '../../common/ajax'
import moment from 'moment/moment'

let AlreadyView = React.createClass({
    getInitialState () {
        return {
            id: '',
            entryTime: '',
            showDate: false
        }
    },
    // 发送入职邀请
    finishInterview (id) {
        let {showDate} = this.state
        this.setState({
            id: id,
            showDate: !showDate
        })
    },
    // 不合适
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
    render () {
        let {showDate, entryTime} = this.state
        let {dataSource, pageSizeTotal, curPagination, pageSizePer} = this.props
        return (
            <div className={dataSource.length === 0 ? 'AlreadyView nullContent' : 'AlreadyView'}>
                {dataSource.length === 0 ? <div className='zanWU'>暂无数据</div> : null}
                {dataSource.map((v, index) => {
                    return (
                        <div className='item' key={index}>
                            <CommonTpl itemData={v}/>
                            <div className='operate'>
                                <div className='onLine' onClick={() => this.finishInterview(v.id)}>发送入职邀请</div>
                                <div className='noGood' onClick={() => this.improper(v.id)}>不合适</div>
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

export default AlreadyView
