import {message} from 'antd'

function padding2 (v) {
    let ret = v
    if ((v + '').length < 2) {
        ret = '0' + v
    }
    return ret
}

const util = {
    redirectToLogin () {
        message.error('长时间不操作，将重新刷新页面')
        setTimeout(
            () => {
                location.reload()
            }, 1500
        )
    },
    getMonthStr (date) {
        const year = date.getFullYear()
        const month = padding2(date.getMonth() + 1)
        return `${year}-${month}`
    },
    getDateStr (date) {
        const year = date.getFullYear()
        const month = padding2(date.getMonth() + 1)
        const day = padding2(date.getDate())
        return `${year}年${month}月${day}日`
    },
    getDateStrH (date) {
        const year = date.getFullYear()
        const month = padding2(date.getMonth() + 1)
        const day = padding2(date.getDate())
        return `${year}-${month}-${day}`
    },
    getTimeStr (date) {
        const year = date.getFullYear()
        const month = padding2(date.getMonth() + 1)
        const day = padding2(date.getDate())
        const hour = padding2(date.getHours())
        const min = padding2(date.getMinutes())
        const sec = padding2(date.getSeconds())

        return `${year}${month}${day}${hour}${min}${sec}`
    },
    getDateTimeStr (date) {
        const year = date.getFullYear()
        const month = padding2(date.getMonth() + 1)
        const day = padding2(date.getDate())
        const hour = padding2(date.getHours())
        const min = padding2(date.getMinutes())
        const sec = padding2(date.getSeconds())

        return `${year}-${month}-${day} ${hour}:${min}:${sec}`
    },
    ifJudjeFn (list, key) {
        let err = list.constructor === Object && list !== undefined && key !== undefined ? `ifJudjeFn() 参数无效!` : `${key}属性不存在`
        return list.hasOwnProperty(key) ? list[key] : err
    },
    timeDifference (start) {
        start = new Date(start)
        let end = new Date()
        let result = end.getTime() - start.getTime()
        return Math.floor(result / (24 * 3600 * 1000))
    }
}

export default util
