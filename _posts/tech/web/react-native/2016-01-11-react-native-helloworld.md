---
layout: post
title: react-native（一） hello world
category: 技术
tags: react-native
keywords: react-native
description:
---

## react-native简单介绍

React-Native就是在开发效率和用户体验间做的一种权衡。React-native是使用JS开发，开发效率高、发布能力强，不仅拥有hybrid的开发效率，同时拥有native app相媲美的用户体验。

学习react-native需要掌握不少基础知识，学习成本还是比较高的。

-   js，html，css，nodejs，JSX语法基础，Flexbox布局
-   ios基本开发知识和android基本开发知识（最低要求也需要知道ios和android的一些基础）

## 配置react-native环境
>   网上有一大堆的react-native环境配置和入门教程，写的都很简单，几句话搞定环境，但是往往用起来总是会遇到各种各样的问题，所以我这里会写
的稍微详细一些，都包括我在安装过程中遇到的问题。

-   安装nodejs
-   安装watchman和flow
-   安装react-native 运行时

本文安装环境是mac，windows就不介绍安装了，window也玩不起来react-native，window安装环境也是在折腾浪费生命。


安装nodejs，建议使用nvm安装，nvm是一个nodejs版本管理插件

````

//1：先安装一个 nvm（ https://github.com/creationix/nvm ） 当然也可以不装，不过装了的好处是便于nodejs版本切换
//安装完重启一下终端试试输入nvm -v是不是有作用
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.2/install.sh | bash

//2：安装 nodejs //新版react-native要求nodejs版本不得低于4
//v4.2.4 是一个lts版本 ,你也可以执行 nvm ls-remote 查看远程最新版本
$ nvm install v4.2.4

//查看nvm里面nodejs版本
$ nvm ls

//切换nodejs版本
//设置默认版本为nvm设置的stable版本，否则若之前安装过node又安装了nvm，会导致每次终端打开都会回到系统的nodejs版本，导致react-native失败
$ nvm use v4.2.4
nvm alias default stable

````

安装watchman和flow

````
brew install watchman
brew install flow

````

安装react-native 运行时

````    sudo npm install -g react-native-cli    ````


这样整个react-native就开发安装好了，重要的事情说三遍！

````    nodejs版本一定要>4 ，重新设置nodejs版本一定要重新打开终端    ````
````    nodejs版本一定要>4 ，重新设置nodejs版本一定要重新打开终端    ````
````    nodejs版本一定要>4 ，重新设置nodejs版本一定要重新打开终端    ````


## hello world

创建项目：   ````    react-native init helloworld    ````

找到创建的HelloWorld项目,双击helloworld.xcodeproj打开

**我遇到的错误**

````
You are currently running Node v0.12.0 but React Native requires >=4. Please use a supported version of Node.
See https://facebook.github.io/react-native/docs/getting-started.html
````

解决方法：安装一个nvm，通过nvm安装一个nodejs4.0以上的版本

````
启动xcode的helloworld项目报错：SyntaxError: Use of const in strict mode
````

解决方法：nvm没有设置默认版本，导致每次终端打开都会都会使用之前的nodejsv0.12版本运行，自然报错，通过设置````nvm alias default stable````解决

xcode怎么用我就不介绍了，虽然react-native是使用前端html，css，js开发ios和android程序，但是如果你不会ios和android开发任然是玩不转的，应该说
react-native只是帮你节省了一些开发时间，减少了你对ios或者android深入了解的成本。


历经千辛万苦，终于启动成功鸟~~

![](http://images.jumppo.com/uploads/2016-01-11-react-native-helloworld-1.png)

##  项目的文件结构

-   index.ios.js: 项目的入口，示例程序中，页面样式和控件都写在这个里面
-   node_module，package.json：nodejs依赖包和nodejs配置文件，熟悉nodejs的都懂，不熟悉的去学下nodejs，不然没法继续下去
-   ios文件夹：生成的ios项目
-   android文件夹：生成的android项目


##  学习资源

[React Native的常见问题](http://bbs.reactnative.cn/topic/130/%E6%96%B0%E6%89%8B%E6%8F%90%E9%97%AE%E5%89%8D%E5%85%88%E6%9D%A5%E8%BF%99%E9%87%8C%E7%9C%8B%E7%9C%8B-react-native%E7%9A%84%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)


##  demo

本文示例demo见 [demo](https://github.com/coolnameismy/demo/react-native/helloworld)


## 最后

刘彦玮原创，转载请注明出处

感谢大家支持，请[github上follow和star](https://github.com/coolnameismy)


<div style="display:none">
组件化
路由
布局
控件
网络请求
动画

//优点
组件化非常容易
css的布局模式比ios和android原生的都要优雅
引入css样式，比原生代码写样式要方便的多的多
mvvm模型，数据绑定和渲染都很轻松
代码量明显减少
可以使用路由
调试方便，可见即可得

</div>
