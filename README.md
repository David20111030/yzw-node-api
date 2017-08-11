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




