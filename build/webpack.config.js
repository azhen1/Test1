var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var utils = require('./utils');

var _DEV_ = process.env.NODE_ENV === 'development';

var ROOT = utils.fullPath('../');
var config = {
    entry: {
        main: ["./src/entry/main.js"],
        vendor: ["react-dom", "react", "react-router"]
    },
    output: {
        path: ROOT + '/dist',
        filename: _DEV_ ? 'js/[name].js' : 'js/[name].[chunkhash:8].js',
        //按需加载时，对应生成的文件名
        chunkFilename:  _DEV_ ? 'js/[name].js' : 'js/[name].[chunkHash:8].js'
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test:  /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                //注意：在配置in-line模式下热加载的时候（具体配置查看webpack-dev-js文件），发现只有css样式更改的时候可以实现热加载，
                //更改js文件的时候却不能实现热加载，上网查资料，发现用react进行开发的时候，需要再配置一个react-hot-loader，具体配置
                //写法如下，这样就可以实现js文件的热更新了。。
                loaders: [
                    'react-hot-loader',
                    'babel-loader?presets[]=react,presets[]=stage-0,presets[]=es2015'
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        {
                            loader: 'css-loader',
                            //minimize属性配置css代码压缩
                            options: {minimize: true}
                        },
                        {
                            loader: 'postcss-loader'
                        }
                    ]
                })

            },
            {
                test: /\.less$/,
                //注意，使用less-loader要额外安装less，不然会报错
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: true, importLoaders: 1, minimize: true}
                        },
                        {
                            loader: 'postcss-loader'
                        },
                        {
                            loader: 'less-loader',
                            options: {sourceMap: true}
                        }
                    ]
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                //注意，使用url-loader要额外安装file-loader，不然会报错
                loaders: [
                    'url-loader?limit=8192&name=imgs/[name].[hash:8].[ext]'
                    // 'image-webpack-loader'  //压缩图片
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    plugins: [
        //生成html模板
        new HtmlWebpackPlugin({
            template: './src/entry/index.html',
            filename: 'index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
        //    //注意：上述写法是为浏览器缓存设置，我们在项目中提取出来的第三方类库，由于文件很大，且基本不会改动，所以要利用浏览器
        //    //      缓存机制增加访问速度，但是存在一个问题，如果我们用webpack打包的时候都带一个hash值，那么每次打包的文件名都会
        //    //      改变，这样浏览器就不会缓存，所以上述设置可以让webpack打包的时候对第三方提取的公共文件hash值不变，这样，浏览器
        //    //      就可以缓存了，增加网页浏览速度。要实现这个效果，output中filename属性设置hash值要用chunkHash
        //    // filename: "vendor.js"
        //    // (给 chunk 一个不同的名字)
        //    //minChunks: Infinity
        //    // 随着 入口chunk 越来越多，这个配置保证没其它的模块会打包进 公共chunk
        }),
        //css文件打包
        new ExtractTextPlugin("css/[name].[contenthash:8].css"),
        new webpack.LoaderOptionsPlugin({
            options: {
                //加css3前缀
                postcss: [precss, autoprefixer]
            }
        }),
        //配置全局常量，在业务代码中可以直接使用（比如在homePage.jsx中可以直接访问NODE_ENV这个变量）
        new webpack.DefinePlugin({
            "NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
};

//代码压缩
if (!_DEV_) {
    config.plugins.push(new UglifyJSPlugin())
}

module.exports = config;