---
layout: post
title: UIWebView和WKWebView的使用及js交互
category: 技术
tags: IOS,uiwebview,wkwebview,hybird
description:
---

> web页面和app直接的交互是很常见的东西，之前尝试过flex和js的相互调用以及android和js的相互调用，却只有ios没试过，据说比较复杂。周末花了点时间研究了一下，确实和其他的不太一样，但是
也不见复杂。

##  要知道的事情

ios的webview有2个类，一个叫UIWebView，另一个是WKWebView。两者的基础方法都差不多，本文重点是后者，他是取代UIWebView出现的，在app开发者若不需要兼容ios8之前版本，都应该使用WKWebVIew。

WKWebView 是苹果在 iOS 8 中引入的新组件，目的是给出一个新的高性能的 Web View 解决方案，摆脱过去 UIWebView 的老旧笨重特别是内存占用量巨大的问题，它使用Nitro JavaScript引擎，这意味着所有第三方浏览器运行JavaScript将会跟safari一样快.

ios9默认是不允许加载http请求的，对于webview，加载http网页也是不允许的。可以通过修改info.plist取消http限制

在项目中找到info.plist，源文件形式打开，添加下面内容
````
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
````



##  大纲

-   UIWebView使用
    -   加载网页或本地页面
    -   js和app之间的交互
-   WKWebView的使用
    -   加载页面，前进，后退，刷新，进度条
    -   app调js方法
    -   js掉app方法
-   文章demo
-   参考文章

##  UIWebView使用
---
>   UIVebView现在已经弃用，ios8以上都应该用新的WKWebview，所以UIWebView我就随便讲讲，他也相对简单一些。


### 加载网页或本地页面

````swift
 //从本地加载html
 let path:String! = NSBundle.mainBundle().pathForResource("index", ofType: "html")

 
````



##  WKWebView的使用
---


##  参考文章
-   (WKWeb​View)[http://nshipster.cn/wkwebkit/]
-   (iOS 8 WebKit框架概览（上）译文)[http://www.cocoachina.com/ios/20150203/11089.html]
-   (iOS 8 WebKit框架概览（下）译文)[http://www.cocoachina.com/ios/20150205/11108.html]


## demo
