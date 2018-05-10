
// 电话号码加密处理，先异或，再base64转码
function encryptPhone (phoneStr) {
    var base = new Base64()
    var result = []
    var tpl = '00000dingyi'
    var strRes = ''
    var phoneArr = yiHuoFn.unpack(phoneStr)
    var tplArr = yiHuoFn.unpack(tpl)
    phoneArr.map((v, index) => {
        result.push(v ^ tplArr[index])
    })
    result = yiHuoFn.pack(result)
    strRes = base.encode(result)
    return strRes
}
// 倒计时
function countDown (e) {
    e.setAttribute('class', 'noClick')
    var _th = this
    var defCount = 60
    e.innerHTML = '已发送'+defCount+'秒'
    var count = setInterval(function () {
        if (defCount === 0) {
            e.innerHTML = '重新发送'
            e.setAttribute('class', '')
            clearInterval(count)
        } else {
            --defCount
            e.innerHTML = '已发送 '+defCount+' 秒'
        }
    }, 1000)
}

/* eslint-disable */
var Base64 = function () {

    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    this.encode = function (input, fn) {
        var output = ''
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4
        var i = 0
        input = this._utf8_encode(input)
        while (i < input.length) {
            chr1 = input.charCodeAt(i++)
            chr2 = input.charCodeAt(i++)
            chr3 = input.charCodeAt(i++)
            enc1 = chr1 >> 2
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
            enc4 = chr3 & 63
            if (isNaN(chr2)) {
                enc3 = enc4 = 64
            } else if (isNaN(chr3)) {
                enc4 = 64
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4)
        }
        return output
    }

    this.decode = function (input, fn) {
        var output = ''
        var chr1, chr2, chr3
        var enc1, enc2, enc3, enc4
        var i = 0
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++))
            enc2 = _keyStr.indexOf(input.charAt(i++))
            enc3 = _keyStr.indexOf(input.charAt(i++))
            enc4 = _keyStr.indexOf(input.charAt(i++))
            chr1 = (enc1 << 2) | (enc2 >> 4)
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
            chr3 = ((enc3 & 3) << 6) | enc4
            output = output + String.fromCharCode(chr1)
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2)
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3)
            }
        }
        output = this._utf8_decode(output)
        return output
    }

    this._utf8_encode = function (string) {
        string = string.replace(/\r\n/g, '\n')
        var utftext = ''
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n)
            if (c < 128) {
                utftext += String.fromCharCode(c)
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192)
                utftext += String.fromCharCode((c & 63) | 128)
            } else {
                utftext += String.fromCharCode((c >> 12) | 224)
                utftext += String.fromCharCode(((c >> 6) & 63) | 128)
                utftext += String.fromCharCode((c & 63) | 128)
            }
        }
        return utftext
    }

    this._utf8_decode = function (utftext) {
        var string = ''
        var i = 0
        var c = 0
        var c1 = 0
        var c2 = 0
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i)
            if (c < 128) {
                string += String.fromCharCode(c)
                i++
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
                i += 2
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
                i += 3
            }
        }
        return string
    }
}

var yiHuoFn = {
    unpack (str) {
        var bytes = new Array()
        var len
        var c
        len = str.length
        for (var i = 0; i < len; i++) {
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
        var str = ''
        var _arr = arr
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2)
            var v = one.match(/^1+?(?=0)/)
            if (v && one.length === 8) {
                var bytesLength = v[0].length
                var store = _arr[i].toString(2).slice(7 - bytesLength)
                for (var st = 1; st < bytesLength; st++) {
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

var uuid = window.localStorage.getItem('sessionUuid')
var getRequest = (async, url, data) => {
    uuid = window.localStorage.getItem('sessionUuid')
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            async: async,
            url: url,
            data: data,
            headers: {
                Authorization: uuid === null ? '' : `DingYi ${uuid}`
            },
            success: function (response) {
                resolve(response)
            },
            error: function (err) {
                reject(err)
            }
        })
    })
}
var postRequest = (async, url, data, contentType) => {
    uuid = window.localStorage.getItem('sessionUuid')
    return new Promise(function (resolve, reject) {
        if (contentType === true) {
            $.ajax({
                type: 'POST',
                async: async,
                url: url,
                data: data,
                headers: {
                    Authorization: uuid === null ? '' : `DingYi ${uuid}`
                },
                contentType: 'application/json; charset=utf-8',
                success: function (response) {
                    resolve(response)
                },
                error: function (err) {
                    reject(err)
                }
            })
        } else {
            $.ajax({
                type: 'POST',
                async: async,
                url: url,
                data: data,
                headers: {
                    Authorization: uuid === null ? '' : `DingYi ${uuid}`
                },
                success: function (response) {
                    resolve(response)
                },
                error: function (err) {
                    reject(err)
                }
            })
        }
    })
}
