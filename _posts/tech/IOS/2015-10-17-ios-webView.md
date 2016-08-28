---
layout: post
title: UIWebView和WKWebView的使用及js交互
category: iOS
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

````xml

    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>

````

dome截图

![]({{site.url}}/assets/uploads/webview0.png)

![]({{site.url}}/assets/uploads/webview1.png)

##  大纲

-   UIWebView使用
    -   加载网页或本地页面
    -   app调js方法
    -   js调app方法

-   WKWebView的使用
    -   加载页面，前进，后退，刷新，进度条
    -   前进，后退，刷新，进度条
    -   js中alert的拦截
    -   app调js方法
    -   js调app方法
    -   webView生命周期和跳转代理

-   web页面
-   文章demo
-   参考文章


##  UIWebView使用
---
>   UIVebView现在已经弃用，ios8以上都应该用新的WKWebview，所以UIWebView我就随意说说，大家随意看看。

### 加载网页或本地页面

````swift

    //从本地加载html
    let path:String! = NSBundle.mainBundle().pathForResource("index", ofType: "html")
    webView.loadRequest(NSURLRequest(URL: NSURL.fileURLWithPath(path)))

    //从网络加载
    webView.loadRequest(NSURLRequest(URL: NSURL(string: "https://www.bing.com")!))

````

注意点:
1.  ios9默认不能加载http请求，需要声明
2.  uiwebView网络请求会进入````ternal  func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool ```` 委托，委托中若return false，也不会继续加载


### app调js方法

app调用js方法使用的是 ````webView.stringByEvaluatingJavaScriptFromString()```` 这个方法。它可以直接执行一段js代码

````swift
    //调用js无参数的方法
     webView.stringByEvaluatingJavaScriptFromString("hi()")

    //调用js有参数的方法hello(msg)
    let js = String(format: "hello('%@')", "liuyanwei")
    webView.stringByEvaluatingJavaScriptFromString(js)

    //调用js的参数为json对象
    let js = String(format: "hello(%@)", "{'obj':'liuyanwei'}")
    webView.stringByEvaluatingJavaScriptFromString(js)

     //从文件中加载一段js代码然后执行
     do{
         let jsString = try String(contentsOfFile: NSBundle.mainBundle().pathForResource("test", ofType: "js")!, encoding: NSUTF8StringEncoding)
         self.webView.stringByEvaluatingJavaScriptFromString(jsString)
     }
     catch{}

    //直接执行alert
    webView.stringByEvaluatingJavaScriptFromString("alert('hi')")

    //执行有返回值的js函数
    NSLog("%@", webView.stringByEvaluatingJavaScriptFromString("getName()")!)

````

相关的js代码

````javascript

var hi = function(){
	alert("hello")
	$(".info").html("hi");
}

var hello = function(msg){
	alert("hello " + msg)
	if(msg.obj != undefined)
		alert(msg.obj)
}

var getName = function(){
	return "liuyanwei"
}


````


### js调app方法

很多人觉得，为什么UIWebView中，js调用app的方式怎么那么奇怪，其实应该这样说，UIWebView没有办法直接使用js调用app，但是可以通过拦截request的方式间接实现js调用app方法。

既然是拦截url，那你就可以任意方式去规定想要调用的url的路径和app中方法转换的方式。我这里使用协议和路径的方式，例如我拦截到的url是 "hello://hello_liuyanwei" ，我就把hello当做想调用的方法，路径当做参数。这种方式不一定好，但是使用起来还是挺方便的。

js中调用app的方法如下：

````javascript

//这段代码是原生js代码，在js中的作用是做页面跳转
//webView通过拦截url请求方式拦截到request，通过解析从而调用 ios hello方法，参数是hello_liuyanwei
document.location = "hello://hello_liuyanwei";

````

````swift

    //webView 需要实现UIWebViewDelegate委托方法
    // class ViewController: UIViewController,UIWebViewDelegate ....
    // webView.delegate = self

    func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool{

        //如果请求协议是hello 这里的hello来自js的调用，在js中设为 document.location = "hello://liuyanwei 你好";
        //scheme：hello ，msg：liuyanwei 你好
        //通过url拦截的方式，作为对ios原生方法的呼叫
        if request.URL?.scheme == "hello"{
            let method:String = request.URL?.scheme as String!
            let sel =  Selector(method+":")
            self.performSelector(sel, withObject:request.URL?.host)
            request.URL?.path
            //如果return true ，页面加载request，我们只是当做协议使用所以不能页面跳转
            return false
        }

        return true
    }


````

最后说一下关于js调用app的返回值。app调js可以有返回值，但是js调app是通过间接的拦截request方式实现，它根本就不算方法调用，所以应该是不存在可以直接产生返回值的（如果不对欢迎指正）。当然如果需要app对js的调用有所响应，可以通过回叫函数的方式回应js。可以在调用app的时候增加一个js回叫函数名
app在处理完之后可以呼叫回叫函数并把需要的参数通过回叫函数的方式进行传递。


##  WKWebView的使用
---

WKWebVIew是UIWebView的代替品，新的WebKit框架把原来的功能拆分成许多小类。本例中主要用到了WKNavigationDelegate,WKUIDelegate,WKScriptMessageHandler三个委托和配置类WKWebViewConfiguration去实现webView的request控制，界面控制，js交互，alert重写等功能。
使用WKWebView需要引入````#import <WebKit/WebKit.h>````

### 加载页面，配置委托和手势等


````swift

    //加载页面
    config = WKWebViewConfiguration()
    //设置位置和委托
    webView = WKWebView(frame: self.webWrap.frame, configuration: config)
    webView.navigationDelegate = self
    webView.UIDelegate = self
    self.webWrap.addSubview(webView)

    //加载网页
    //webView.loadRequest(NSURLRequest(URL: NSURL(string: "https://www.bing.com")!))

    //加载本地页面
    webView.loadRequest(NSURLRequest(URL: NSURL.fileURLWithPath(NSBundle.mainBundle().pathForResource("index", ofType: "html")!)))
    //允许手势，后退前进等操作
     webView.allowsBackForwardNavigationGestures = true

````

### 前进，后退，刷新，进度条

````swift
//前进
webView.goBack()
//后退
webView.goForward()
//刷新
let request = NSURLRequest(URL:webView.URL!)
webView.loadRequest(request)

//监听是否可以前进后退，修改btn.enable属性
webView.addObserver(self, forKeyPath: "loading", options: .New, context: nil)
//监听加载进度
webView.addObserver(self, forKeyPath: "estimatedProgress", options: .New, context: nil)

//重写self的kvo方法
override func observeValueForKeyPath(keyPath: String?, ofObject object: AnyObject?, change: [String : AnyObject]?, context: UnsafeMutablePointer<Void>) {
    if (keyPath == "loading") {
        gobackBtn.enabled = webView.canGoBack
        forwardBtn.enabled = webView.canGoForward
    }
    if (keyPath == "estimatedProgress") {
        //progress是UIProgressView
        progress.hidden = webView.estimatedProgress==1
        progress.setProgress(Float(webView.estimatedProgress), animated: true)
    }
}


````

### js中alert的拦截

在WKWebview中，js的alert是不会出现任何内容的，你必须重写````WKUIDelegate````委托的```` runJavaScriptAlertPanelWithMessage message````方法，自己处理alert。类似的还有Confirm和prompt也和alert类似，这里我只以alert为例。

````swift
    //alert捕获
    func webView(webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: () -> Void) {
        //
        completionHandler()
        let alert = UIAlertController(title: "ios-alert", message: "\(message)", preferredStyle: .Alert)
        alert.addAction(UIAlertAction(title: "ok", style: .Default, handler:nil))
        alert.addAction(UIAlertAction(title: "cancel", style: .Cancel, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)

    }

````


### app调js方法

WKWebView调用js方法和UIWebView类似，一个是evaluateJavaScript，一个是stringByEvaluatingJavaScriptFromString。获取返回值的方式不同，WKWebView用的是回叫函数获取返回值

````swift

    //直接调用js
    webView.evaluateJavaScript("hi()", completionHandler: nil)
    //调用js带参数
    webView.evaluateJavaScript("hello('liuyanwei')", completionHandler: nil)
    //调用js获取返回值
    webView.evaluateJavaScript("getName()") { (any,error) -> Void in
        NSLog("%@", any as! String)
    }

````


### js调app方法

UIwebView没有js调app的方法主要有2种实现，一种是通过拦截request的方式间接实现，另一种是使用JavaScriptCore的jsContext注册objc对象或使用JSExport协议导出Native对象的方式。本文主要介绍第一种实现，第二种实现方式参考后续文章 JavaScriptCore的使用教程


1：注册handler需要在webView初始化之前，如示例，注册了一个webViewApp的handler

````swift
        config = WKWebViewConfiguration()
         //注册js方法
        config.userContentController.addScriptMessageHandler(self, name: "webViewApp")
        webView = WKWebView(frame: self.webWrap.frame, configuration: config)
````

2：处理handler委托。ViewController实现WKScriptMessageHandler委托的````func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage)````方法

````swift

    //实现WKScriptMessageHandler委托
     class ViewController：WKScriptMessageHandler

     //实现js调用ios的handle委托
     func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
         //接受传过来的消息从而决定app调用的方法
         let dict = message.body as! Dictionary<String,String>
         let method:String = dict["method"]!
         let param1:String = dict["param1"]!
         if method=="hello"{
             hello(param1)
         }
     }

````

3：js调用

通过 window.webkit.messageHandlers.webViewApp找到之前注册的handler对象，然后调用postMessage方法把数据传到app，app通过上一步的方法解析方法名和参数


````javascript

        var message = {
                        'method' : 'hello',
                        'param1' : 'liuyanwei',
                        };
        window.webkit.messageHandlers.webViewApp.postMessage(message);

````

如果需要app对js的调用有所响应，可以通过回叫函数的方式回应js。可以在调用app的时候增加一个js回叫函数名 app在处理完之后可以呼叫回叫函数并把需要的参数通过回叫函数的方式进行传递



### webView生命周期和跳转代理
>   该代理提供的方法，可以用来追踪加载过程（页面开始加载、加载完成、加载失败）、决定是否执行跳转

````swift

// 页面开始加载时调用
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation;
// 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation;
// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation;
// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation;

// 接收到服务器跳转请求之后调用
- (void)webView:(WKWebView *)webView didReceiveServerRedirectForProvisionalNavigation:(WKNavigation *)navigation;
// 在收到响应后，决定是否跳转
- (void)webView:(WKWebView *)webView decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler;
// 在发送请求之前，决定是否跳转
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;


```

##  web页面
---

随便说两句web页面，demo中的web前段用了jquery去操作dom，btn是在js中添加的，btn的点击事件也在js中。另外随便写了几个css让页面稍微美观一些。web页面都在项目文件夹下的web文件夹中。大家其实也不必看，因为调用的app的js代码在文中都有单独贴出。


##  参考文章
---
>   本文也只是用了一些基本的用法，大家想了解更多，可以看看下面的三篇文章做补充阅读。但是现在也没发现有把webView这块写的很全很详细的文章，今后要是看见我会继续补充在这里。


-   [WKWeb​View](http://nshipster.cn/wkwebkit/)
-   [iOS 8 WebKit框架概览（上）译文](http://www.cocoachina.com/ios/20150203/11089.html)
-   [iOS 8 WebKit框架概览（下）译文](http://www.cocoachina.com/ios/20150205/11108.html)


## demo
---
我博客中大部分示例代码都上传到了github，地址是：https://github.com/coolnameismy/demo，[点击跳转代码下载地址](https://github.com/coolnameismy/tree/master/demo)

本文代码存放目录是ios-WebView,本demo没做界面自适应，为了保证效果请用iPhone6及以上模拟器打开

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处

dome截图

![]({{site.url}}/assets/uploads/webview0.png)

![]({{site.url}}/assets/uploads/webview1.png)