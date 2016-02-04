---
layout: post
title: ios networking（三） http异步请求和https认证
category: iOS
tags:
keywords:
description:
---

异步请求和异步队列请求不太相似，同步请求和异步队列请求都是调用的NSURLConnection的静态方法，而异步请求需要实例化一个````NSURLConnection````对象，并通过````NSURLConnectionDelegate，NSURLConnectionDataDelegate，NSURLConnectionDownloadDelegate````三个委托实现
对请求声明周期中的各个事件进行回调。

-   NSURLConnectionDelegate：主要处理https等加密认证
-   NSURLConnectionDataDelegate： 请求成功，失败，获取数据，上传进度，缓存等委托
-   NSURLConnectionDownloadDelegate： 下载相关的委托，成功，失败，数据等等。

异步请求和同步请求与异步队列请求相比，可以实现耕地的功能，如上传下载的进度，安全认证，取消和暂停，数据流等等









## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/network-demo)

如果大家支持，请[github上follow和star](https://github.com/coolnameismy)


