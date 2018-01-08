/* eslint-disable */
let yiHuoFn = {
    unpack (str) {
        let bytes = new Array()
        let len
        let c
        len = str.length
        for (let i = 0; i < len; i++) {
            c = str.charCodeAt(i)
            if (c >= 0x010000 && c <= 0x10FFFF) {
                bytes.push(((c >> 18) & 0x07) | 0xF0)
                bytes.push(((c >> 12) & 0x3F) | 0x80)
                bytes.push(((c >> 6) & 0x3F) | 0x80)
                bytes.push((c & 0x3F) | 0x80)
            } else if (c >= 0x000800 && c <= 0x00FFFF) {
                bytes.push(((c >> 12) & 0x0F) | 0xE0)
                bytes.push(((c >> 6) & 0x3F) | 0x80)
                bytes.push((c & 0x3F) | 0x80)
            } else if (c >= 0x000080 && c <= 0x0007FF) {
                bytes.push(((c >> 6) & 0x1F) | 0xC0)
                bytes.push((c & 0x3F) | 0x80)
            } else {
                bytes.push(c & 0xFF)
            }
        }
        return bytes
    },
    pack (arr) {
        if (typeof arr === 'string') {
            return arr
        }
        let str = ''
        let _arr = arr
        for (let i = 0; i < _arr.length; i++) {
            let one = _arr[i].toString(2)
            let v = one.match(/^1+?(?=0)/)
            if (v && one.length === 8) {
                let bytesLength = v[0].length
                let store = _arr[i].toString(2).slice(7 - bytesLength)
                for (let st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2)
                }
                str += String.fromCharCode(parseInt(store, 2))
                i += bytesLength - 1
            } else {
                str += String.fromCharCode(_arr[i])
            }
        }
        return str
    }
}

export default yiHuoFn