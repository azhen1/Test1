<b>xxx企业管理系统</b>
    - [效果线上地址](http://www.jingpipei.com)
    - [效果测试地址](http://116.62.136.23/)

// git 地址
    git@github.com:azhen1/my-company.git

// 克隆项目到本地
    git clone git@github.com:azhen1/my-company.git

// 安装依赖
    npm install

// 启动项目 项目启动完成后在浏览器输入http://localhost:8081/即可打开项目
    npm run dev/npm run start

// 项目打包
    npm run build


## About
该项目是我最近在做的一个比较中型的管理系统。它是招聘租房项目中企业端这一块功能，企业端配合手机端APP求职者角色和HR角色 进行交互操作。
主要涉及企业端职位管理、面试管理、HR管理、求职者管理、在线聊天等功能。

```bash
  如果对您对此项目有兴趣，可以点 "Star" 支持一下或者 "follow" 一下 谢谢！ ^_^
```

## 技术栈

**前端技术栈：** react + react-router + webpack + ES6 + less + antd

## 功能
 - 首页 -- 完成
 - 登录/注册/忘记密码 -- 完成
 - 职位管理 -- 完成
    -  发布职位 -- 完成
    -  修改职位 -- 完成
    -  查看职位详情 -- 完成
 - 面试管理 -- 完成
    -  面试请求待处理 -- 完成
    -  待面试 -- 完成
    -  待处理（已面试） -- 完成
    -  带入职 -- 完成
    -  已入职 -- 完成
    -  全部推荐 -- 完成
 - 企业资料管理
   -  修改账号 -- 完成
   -  修改密码 -- 完成
   -  修改用户名 -- 完成
 - 候选人管理
   -  候选人公海 -- 完成
   -  已下载简历 -- 完成
 - 经纪人管理
   -  寻找经纪人 -- 完成
   -  我的经纪人 -- 完成
 - 企业信息
   -   修改企业信息 -- 完成
 - 余额管理
   -  余额／流水详情 -- 完成
   -  充值功能 -- 完成
   -  申请退款 -- 完成
 - 在线聊天   -- 完成
 - 系统消息   -- 完成


## 目录结构
```shell
├── build                           // webpack构建相关
├── portal                          // 项目打包后的文件
├── src                             // 源代码
│   ├── common                      // 一些相关的js通用文件
│   │    ├── ajax                   // ajax请求封装模块
│   │    ├── area                   // 省市区代码资源
│   │    ├── base64Decode           // base64转码模块
│   │    ├── mapCommonFn            // 百度地图相关操作
│   │    ├── multilevelPosition     // 各种行业职位代码资源
│   │    ├── util                   // 一些常用的js函数通用模块
│   │    ├── yiHuoFn                // 图片等静态资源
│   ├── components                  // 全局公用组件
│   │    ├── agentPage              // 经纪人模块
│   │    ├── app                    // 主页
│   │    ├── auditionManager        // 面试相关模块
│   │    ├── businessInfo           // 公司信息模块
│   │    ├── candidate              // 候选人简历模块
│   │    ├── chatWindow             // 在线聊天模块
│   │    ├── information            // 系统消息模块
│   │    ├── JCWebsite              // 首页
│   │    ├── layout                 // 组件结构划分
│   │    ├── modified               // 修改企业资料模块
│   │    ├── positionManager        // 职位管理模块
│   │    ├── user                   // 登录注册修改密码等模块
│   ├── entry                       // 入口文件
│   ├── fonts                       // font字体库文件
│   ├── images                      // 图片资源
├── .gitignore                      // git 忽略项
├── eslintrc.js                     // eslint 配置项
├── package.json                    // 包依赖配置
└── README.md                       // 说明文件







