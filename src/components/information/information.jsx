import React from 'react'
import {getRequest, postRequest} from '../../common/ajax'
import {message, Pagination} from 'antd'
import './information.less'
import util from '../../common/util'

let Information = React.createClass({
    getInitialState () {
        return {
            mingxiBalanceList: [],
            memberId: '',
            contPagination: 1,
            current: 1
        }
    },
    componentDidMount () {
        let memberId = window.localStorage.getItem('memberId')
        let weiDuList = JSON.parse(window.sessionStorage.getItem('WEIHINT_LIST'))
        let contPagination = JSON.parse(window.sessionStorage.getItem('WEIHINT_PAGIN_COUNT'))
        let hash = window.location.hash
        let weiDuHint = document.getElementsByClassName('weiDu_hint')[0]
        if (hash.indexOf('information') !== -1) {
            weiDuHint.style.display = 'none'
        }
        this.setState({
            memberId: memberId,
            mingxiBalanceList: [...weiDuList],
            contPagination: contPagination
        })
    },
    reqDataFn () {
        let URL = 'member/resume/get'
        let _th = this
        let {memberId} = _th.state
        let formData = {}
        getRequest(true, URL, formData).then(function (res) {
            let code = res.code
            if (code === 0) {

            } else {
                message.error('系统错误!')
            }
        })
    },
    onPaginChange (val) {
        let {memberId} = this.state
        let data = {to: memberId, pageNo: parseInt(val), pageSize: 10}
        window.Socket.send(JSON.stringify(data))
        this.setState({
            current: val
        })
    },
    componentWillReceiveProps (nextProps) {
        let weiDuList = JSON.parse(window.sessionStorage.getItem('WEIHINT_LIST'))
        let contPagination = JSON.parse(window.sessionStorage.getItem('WEIHINT_PAGIN_COUNT'))
        this.setState({
            mingxiBalanceList: [...weiDuList],
            contPagination: contPagination
        })
    },
    render () {
        let {mingxiBalanceList, contPagination, current} = this.state
        return (
            <div className='Information'>
                <div className='content'>
                    {mingxiBalanceList !== null && mingxiBalanceList.map((v, index) => {
                        return (
                            <div className='itemBox' key={index}>
                                <span className='type'>{v.type}</span>
                                <span className='shuoMing'>
                                    <span>{v.msg}</span>
                                    <span style={{float: 'right'}}>{util.getDateTimeStr(new Date(parseInt(v.timestamp)))}</span>
                                </span>
                                <span className='count'>{v.count}</span>
                            </div>
                        )
                    })}
                    {
                        mingxiBalanceList === null
                            ? null
                            : <div className='nameClsPagination'>
                                <Pagination total={parseInt(contPagination)} current={current} pageSize={10} onChange={this.onPaginChange}/>
                            </div>
                    }
                </div>
            </div>
        )
    }
})

export default Information
