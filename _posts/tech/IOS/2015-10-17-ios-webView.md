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

苹果将 UIWebViewDelegate 与 UIWebView 重构成了 14 个类和 3 个协议，引入了不少新的功能和接口，这可以在一定程度上看做苹果对其封锁 Web View 内核的行为作出的补偿：既然你们都说 UIWebView 太渣，那我就造一个不渣的给你们用呗~~ 众所周知，连 Chrome 的 iOS 版用的也是 UIWebView 的内核。


