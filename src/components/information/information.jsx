import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import {message, Pagination} from 'antd'
import './information.less'
import util from '../../common/util'

let Information = React.createClass({
    getInitialState () {
        return {
            historyMessage: [],
            messageTotal: 0,
            memberId: '',
            contPagination: 1,
            pageSize: 20,
            current: 1
        }
    },
    componentWillMount () {
        let {pageSize} = this.state
        let data = {to: this.props.memberId, pageNo: 1, pageSize: pageSize}
        if (window.Socket.readyState === 1) {
            window.Socket.send(JSON.stringify(data))
        }
    },
    componentDidMount () {
        let memberId = this.props.memberId
        let hash = window.location.hash
        let weiDuHint = document.getElementsByClassName('weiDu_hint')[0]
        if (hash.indexOf('information') !== -1) {
            weiDuHint.innerHTML = 0
            weiDuHint.style.display = 'none'
        }
        this.setState({
            memberId: memberId
        })
    },
    onPaginChange (val) {
        let {memberId, pageSize} = this.state
        let data = {to: memberId, pageNo: parseInt(val), pageSize: pageSize}
        window.Socket.send(JSON.stringify(data))
        this.setState({
            current: val
        })
    },
    setReaded (id) {
        let {historyMessage} = this.state
        let data = {sysMsgId: id}
        window.Socket.send(JSON.stringify(data))
        historyMessage.forEach((e, index) => {
            if (e.id === id) {
                e.readed = '1'
            }
        })
        this.setState({
            historyMessage: historyMessage
        })
    },
    componentWillReceiveProps (nextProps) {
        this.setState({
            historyMessage: nextProps.historyMessage,
            messageTotal: nextProps.messageTotal,
            memberId: nextProps.memberId
        })
    },
    render () {
        let {contPagination, current, historyMessage, pageSize, messageTotal} = this.state
        return (
            <div className='Information'>
                <div className='content'>
                    {historyMessage.length !== 0 && historyMessage.map((v, index) => {
                        return (
                            <div className='itemBox' key={index} onClick={() => this.setReaded(v.id)}>
                                {v.readed === '1' ? null : <span className='weidu'></span>}
                                <span className='type'>{v.title}</span>
                                <span className='shuoMing'>
                                    <span>{v.msg}</span>
                                     <span style={{float: 'right'}}>{util.getDateTimeStr(new Date(parseInt(v.timestamp)))}</span>
                                </span>
                                {/* <span className='count'>{v.count}</span> */}
                            </div>
                        )
                    })}
                    {
                        historyMessage === null
                            ? null
                            : <div className='nameClsPagination'>
                                <Pagination total={messageTotal} current={current} pageSize={pageSize} onChange={this.onPaginChange}/>
                            </div>
                    }
                </div>
            </div>
        )
    }
})

export default Information
