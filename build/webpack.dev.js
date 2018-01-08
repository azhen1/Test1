var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js');

let hot = true;
//publicPath设置虚拟内存中资源访问的路径，不同于path属性，path是设置webpack打包以后的路径
config.output.publicPath = 'http://127.0.0.1:8081/';
//设置in-line模式
config.entry.main.unshift("webpack-dev-server/client?http://127.0.0.1:8081/");
//方便调试
config.devtool = 'source-map';
//in-line模式热加载开关
if (hot) {
    config.entry.main.unshift("webpack/hot/only-dev-server");
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    hot: hot,
    inline: true,
    compress: true,
    stats: {
        chunks: false,
        children: false,
        colors: true
    },
    historyApiFallback: true,
    proxy: {
        '/job': {
            target: 'http://192.168.0.102',
            changeOrigin: true
        },
        '/member': {
            target: 'http://192.168.0.102',
            changeOrigin: true
        },
        '/images': {
            target: 'http://dingyi.oss-cn-hangzhou.aliyuncs.com',
            changeOrigin: true,
            pathRewrite: {
                '^/images': '/images'
            }
        },
        '/company': {
            target: 'http://192.168.0.103:8012',
            changeOrigin: true
        }
    }
});
server.listen(8081, '127.0.0.1', function () {
    console.log('server start on 127.0.0.1:8081');
});