var os = require('os'),
    iptable = {},
    ifaces = os.networkInterfaces();
for (var dev in ifaces) {
    ifaces[dev].forEach(function (details, alias) {
        console.log(details, '......')
        if (details.family=='IPv4') {
            iptable[dev] = details.address;
        }
    });
}
var serviceList = {
    port: 8080,
    host: '47.96.31.91'
}

module.exports = serviceList