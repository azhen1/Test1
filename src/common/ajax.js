import $ from 'jquery'

let getRequest = (async, url, data) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            async: async,
            url: url,
            data: data,
            success: function (response) {
                resolve(response)
            },
            error: function (err) {
                reject(err)
            }
        })
    })
}
let deleteRequest = (async, url, data) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            async: async,
            url: url,
            data: data,
            success: function (response) {
                resolve(response)
            },
            error: function (err) {
                reject(err)
            }
        })
    })
}
let postRequest = (async, url, data, contentType) => {
    return new Promise(function (resolve, reject) {
        if (contentType === true) {
            $.ajax({
                type: 'POST',
                async: async,
                url: url,
                data: data,
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

export {
    getRequest,
    postRequest,
    deleteRequest
}
