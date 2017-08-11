# yzw-node-master

> A node.js project

# About
一直考虑写一个功能齐全的完整Nodejs项目，但苦于没有找到合适的类型，而且后台系统无法直观的感受到，需要有一个前台项目配合，因此迟迟没有动笔。恰好前一段时间开源了一个yzw-vue前端项目，便以此为契机构筑了后台系统，并提供配套的后台管理系统。

因为前端项目是根据yzw-vue接口写的，所以后台系统也保持了和官网一致的API接口。

整个项目分为两部分：前台项目接口、后台管理接口，共40多个。涉及登陆、注册、添加商品、商品展示、筛选排序、购物车、下单、用户中心等，构成一个完整的流程。

注：此项目纯属个人瞎搞，不用于任何商业用途。

# 技术栈
nodejs + express + mongodb + mongoose + es6/7 + element-ui

## 项目运行

``` bash
git clone git@github.com:zanxiaopeng/yzw-node-master.git 

cd 项目目录

npm install

node run (需先开启mongodb)

访问: http://localhost:3000
```
#项目布局
``` bash
.
├── InitData                        初始化数据
│   ├── bannerData.js               Banner
│   ├── expressSNSData.js           物流
│   ├── proAttrData.js              产品属性
│   ├── proAttrValData.js           产品属性值
│   ├── productData.js              产品
│   └── systemAddressDta.js         地址
├── config                          运行配置
│   └── default.js                  默认配置
├── controller                      处理中心，负责路由及数据库的具体操作
│   ├── accountController
│   │   ├── addressController.js    地址
│   │   └── customerController.js   用户
│   ├── commonController
│   │   └── commonController.js     公用
│   ├── indexController
│   │   └── index.js                首页
│   ├── orderController
│   │   ├── cartController.js       购物车
│   │   └── orderController.js      订单
│   └── productController
│       └── productController.js    产品
│   
├── models                          模型(数据库)
│   ├── accountModel
│   │   ├── addressModel.js         地址
│   │   └── customerModel.js        用户
│   ├── commModel
│   │   ├── banner.js               Banner
│   │   ├── expressSNSModel.js      物流
│   │   ├── smsCodeModel.js         短信
│   │   └── systemAddressDataModel.js   系统地址 省 市 区 
│   ├── integralModel
│   │   ├── integralConsumeModel.js     积分使用
│   │   └── integralGetModel.js     积分获得 
│   ├── orderModel
│   │   ├── cartModel.js            购物车
│   │   ├── orderDeailModel.js      订单详情  
│   │   └── orderModel.js           订单
│   └──productModel
│      └── product.js               产品
│
├── mongodb                         连接数据库
│   └── dbConnection.js
├── routes                          路由配置
│   ├── account.js                  用户
│   ├── common.js                   共用
│   ├── index.js                    首页
│   ├── integral.js                 积分
│   ├── order.js                    订单
│   ├── product.js                  产品
│   └── use.js                      路由入口
│
├── utils                           组件
│   ├── common.js                   公用
│   └── locals.js                   全局
│
├── views   
├── .babelrc 
├── .gitignore
├── app.js                          基础配置
├── run.js                          入口文件
├── package.json
├── README.md                  
.
``` 



