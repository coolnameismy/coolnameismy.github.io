---
layout: post
title: iOS networking（五）网络请求中的cookie
category: iOS
tags:
keywords:
description:
---

>   本篇主要介绍客户端和服务端对cookie的操作

##  服务端代码
---

````JavaScript

    //设置cookie
	function cookie(req,res){
		//打印客户端的cookie
		console.log("client cookie:"+req.headers.cookie);

		var today = new Date();
		var time = today.getTime() + 60*1000;
		var time2 = new Date(time);
		var timeObj = time2.toGMTString();

        //给f的值添加了一个过期时间的参数
	    res.setHeader("Set-Cookie", ['d=001;maxAge=10*1000', 'e=1112', 'f=2222;Expires='+timeObj]);

		var msg = { "status":1,"msg":"succeed"}
		res.write(JSON.stringify(msg));
		res.end();
	}

````

这段代码主要有2个地方需要注意，一是服务端设置cookie并返回到客户端，一个是服务端获取客户端上传的cookie

### 服务端设置cookie
>   服务端设置主要是通过在相应头中设置Set-Cookie，可以使用 ```` response.writeHead ```` 或是 ````response.setHeader ````方法设置

cookie的设置的一般格式：

单个

````
    Set-Cookie:
            cookieName=cookieValue;
            [expires=]
            [;domain=]
            [;path=]
            [;secure=]
            [;httpOnly=]
````

多个

````
    Set-Cookie:'[cookie1,cookie2];
````

参数说明：

````
1、expires：指定过期时间，以GMT格式表示的时间字符串，如方法一个的“timeObj”。
2、maxAge：指定过期时间，同expires（expires和maxAge选两者其一设值即可）。和expires不同之处在于，maxAge值的单位为毫秒（见方法二中的maxAge:10*1000，即为10秒）。maxAge值可以是正数和负数。正数表示当前COOKIE存活的时间。负数表示当前COOKIE只是随着浏览器存储在客户端的内存里，只要关闭浏览器，此COOKIE就马上消失。默认值为-1。
3、domain：指定可访问COOKIE的主机名。主机名是指同一个域名下的不同主机。如：www.google.com和gmail.google.com是在两个不同的主机上，即两个不同的主机名。默认情况下，一个主机中创建的COOKIE在另一个主机下是不能被访问，但可以通过domain参数来实现对其的控制，即所谓的跨子域。以google为例，要实现跨主机（跨子域）访问，写法如下：domain=.google.com，这样就实现了所有google.com下的主机都可以访问此COOKIE。（本机环境上设置此值时，COOKIE无法查看。）
4、path：指定可访问此COOKIE的目录。如：path=/default  表示当前COOKIE仅能在 default 目录下使用。默认值为“/”，即根目录下的所有目录皆可以访问。
5、secure：当设为true时，表示创建的COOKIE会以安全的形式向服务器传输，即只能在HTTPS连接中被浏览器传递到服务器端进行会话验证；若是HTTP连接则不会传递该信息，所以不会被窃取到COOKIE里的具体内容。同理，在客户端，我们也无法使用document.cookie找到被设置了secure=true的cookie健值对。secure属性是防止信息在传递的过程中被监听捕获后信息泄漏，httpOnly属性的目的是防止程序获取COOKIE后进行攻击（XSS）。我们可以把secure=true看成比httpOnly=true是更严格的访问控制。
6、httpOnly：是微软对COOKIE做的扩展。如果在COOKIE中设置了“httpOnly”属性，则通过程序（JS脚本、applet等）将无法读取到COOKIE信息，防止XSS攻击产生。
````

### 服务端设置cookie的例子：

````javascript
//例子1
res.setHeader("Set-Cookie", ['a=001', 'b=1112', 'c=2222']);

//例子2 设置过期时间
var today = new Date();
var time = today.getTime() + 60*1000;
var time2 = new Date(time);
var timeObj = time2.toGMTString();
 res.setHeader("Set-Cookie", ['d=001', 'e=1112', 'f=2222;Expires='+timeObj,]);

//例子3：
res.writeHead(200,{
    'Content-type':'text/json',
    "Set-Cookie":['a=001', 'b=1112', 'c=2222']
});
````

### 服务端获取客户端cookie

````JavaScript
//打印客户端的cookie
console.log("client cookie:"+req.headers.cookie);
````

### 服务端删除或修改cookie

删除和修改cookie本质都是一样的，把原来存在的cookie设为空值，就是删除，设为其他的值就是修改，服务端也有封装好的cookie库，
我们这里的方法都是最底层的htpp模块的方法。


## 客户端iOS 操作cookie
---

### 获取服务端返回的cookie

````objc

    //获取cookie
    NSDictionary *headers = [((NSHTTPURLResponse *)resp) allHeaderFields];
    NSLog(@"headers:%@",headers);
    NSDictionary *cookies = [NSHTTPCookie cookiesWithResponseHeaderFields:headers forURL:[NSURL URLWithString:@"http://localhost/"]];

    for (NSHTTPCookie *cookie in cookies) {
        NSLog(@"cookie:%@",cookie);
    }

````

服务端返回的cookie在响应头中，请求上节服务端代码设置cookie的那个路径：http://localhost:8001/cookie 后打印的结果如下：

````
2016-02-13 18:04:08.611 network-demo[20302:1737476] ====请求开始====
2016-02-13 18:04:08.611 network-demo[20302:1737476] {
    msg = succeed;
    status = 1;
}
2016-02-13 18:04:08.611 network-demo[20302:1737476] ====请求结束====
2016-02-13 18:04:08.611 network-demo[20302:1737476] headers:{
    Connection = "keep-alive";
    Date = "Sat, 13 Feb 2016 10:04:08 GMT";
    "Set-Cookie" = "d=001;maxAge=10*1000, e=1112, f=2222;Expires=Sat, 13 Feb 2016 10:05:08 GMT";
    "Transfer-Encoding" = Identity;
}
2016-02-13 18:04:08.617 network-demo[20302:1737476] cookie:<NSHTTPCookie version:0 name:"d" value:"001" expiresDate:(null) created:2016-02-13 10:04:08 +0000 sessionOnly:TRUE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-13 18:04:08.617 network-demo[20302:1737476] cookie:<NSHTTPCookie version:0 name:"e" value:"1112" expiresDate:(null) created:2016-02-13 10:04:08 +0000 sessionOnly:TRUE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-13 18:04:08.617 network-demo[20302:1737476] cookie:<NSHTTPCookie version:0 name:"f" value:"2222" expiresDate:2016-02-13 10:05:08 +0000 created:2016-02-13 10:04:08 +0000 sessionOnly:FALSE domain:"localhost" path:"/" isSecure:FALSE>

````

可以看到服务端获取了3个cookie，key分别是d,e,f，其中f设置了cookie的过期时间。

客户端cookie会在每次请求中把cookie自动加载到请求头中发送给服务端，
我们已经收到相应的cookie后，再次请求服务端另一个没有设置cookie的url，看看服务端打印出客户端请求头中的cookie

````
{ host: 'localhost:8001',
  accept: '*/*',
  cookie: 'd=001; e=1112',
  'user-agent': 'network-demo/1 CFNetwork/758.0.2 Darwin/14.5.0',
  'accept-language': 'en-us',
  'accept-encoding': 'gzip, deflate',
  connection: 'keep-alive' }
/
client cookie:d=001; e=1112
````

可以看到请求头中获取到了cookie： ````client cookie:d=001; e=1112 ```` 。
但是这里有个问题，我少了一个key为f的cookie，那是因为f的cookie已经过期了。再看之前iOS模拟器打印的过期时间和服务返回的时间有8小时时差，这个应该是
服务端的时间制式和客户端的制式不同导致的吧，已经搞mongodb的时候也遇到过，这里不用纠结这些小问题了，反正就是过期了。


### 获取客户端存储的cookie

通过````NSHTTPCookieStorage````的单例类就可以获取到之前服务端的cookie

````objc
//获取本地cookie
NSHTTPCookieStorage *httpCookiesStorage =  [NSHTTPCookieStorage sharedHTTPCookieStorage];
NSDictionary *cookies = [httpCookiesStorage cookiesForURL:[NSURL URLWithString:@"http://localhost/"]];
for (NSHTTPCookie *cookie in cookies) {
    NSLog(@"cookie:%@",cookie);
}
````


### 客户端设置本地cookie

````objc

//客户端设置cookie
-(void)clientSetCookie{

    NSDictionary *prop1 = [NSDictionary dictionaryWithObjectsAndKeys:
                           @"a",NSHTTPCookieName,
                           @"aaa",NSHTTPCookieValue,
                           @"/",NSHTTPCookiePath,
                           [NSURL URLWithString:@"http://localhost/"],NSHTTPCookieOriginURL,
                           [NSDate dateWithTimeIntervalSinceNow:60],NSHTTPCookieExpires,
                           nil];

    NSDictionary *prop2 = [NSDictionary dictionaryWithObjectsAndKeys:
                           @"b",NSHTTPCookieName,
                           @"bbb",NSHTTPCookieValue,
                           @"/",NSHTTPCookiePath,
                           [NSURL URLWithString:@"http://localhost/"],NSHTTPCookieOriginURL,
                           [NSDate dateWithTimeIntervalSinceNow:60],NSHTTPCookieExpires,
                           nil];

    NSHTTPCookie *cookie1 = [NSHTTPCookie cookieWithProperties:prop1];
    NSHTTPCookie *cookie2 = [NSHTTPCookie cookieWithProperties:prop2];

    //单个设置
//    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie1];
//    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie2];

    //批量设置
    NSArray *cookies = @[cookie1,cookie2];
    [[NSHTTPCookieStorage sharedHTTPCookieStorage]setCookies:cookies forURL:[NSURL URLWithString:@"http://localhost/"] mainDocumentURL:nil];

    NSLog(@"设置完成");
}

````

说明：
-   设置好了之后，下次请求url时会自动带入cookie中的数据
-   ````[NSDate dateWithTimeIntervalSinceNow:60]````是设置1分钟后超时
-   可以一个个设置也可以使用setCookies批量设置
-  mainDocumentURL： The URL of the main HTML document for the top-level frame, if known. Can be nil. This URL is used to determine if the cookie should be accepted if the cookie accept policy is NSHTTPCookieAcceptPolicyOnlyFromMainDocumentDomain

###  删除cookie

````objc
- (void)deleteCookie:(NSHTTPCookie *)cookie;
- (void)removeCookiesSinceDate:(NSDate *)date NS_AVAILABLE(10_10, 8_0);
````

我们来示范如何删除cookie

````objc
    #pragma mark -客户端删除cookie
    //根据url和name删除cookie
    -(void)deleteCookie:(NSString *)cookieName url:(NSURL *)url{
        //根据url找到所属的cookie集合
        NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage]cookiesForURL:url];
        for (NSHTTPCookie *cookie in cookies) {
            if([cookie.name isEqualToString:cookieName]){
                [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
                NSLog(@"删除cookie:%@",cookieName);
            }
        }
    }
    //删除全部cookies
    -(void)deleteCookies{
        for (NSHTTPCookie *cookie in [[NSHTTPCookieStorage sharedHTTPCookieStorage]cookies]) {
            [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
        }
        NSLog(@"删除完成");
    }
````


### cookie的本地缓存策略

````objc
//设置cookie本地缓存策略
//NSHTTPCookieAcceptPolicyAlways:保存所有cookie，这个是默认值
//NSHTTPCookieAcceptPolicyNever:不保存任何响应头中的cookie
//NSHTTPCookieAcceptPolicyOnlyFromMainDocumentDomain:只保存域请求匹配的cookie
````

我们测试一下效果：
````[[NSHTTPCookieStorage sharedHTTPCookieStorage]setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyNever];````

![]({{site.url}}/assets/uploads/2016-02-13-ios-networking-5_1.png)

这样设置之后，调用demo中的 ````客户端设置cookie```` ，在调用````从服务端获取cookie````，最后调用````打印客户端cookie````，查看日志：

````

````

我们可以看到，客户端没有打印任何cookie，因为设置的策略为：````NSHTTPCookieAcceptPolicyNever````

我们在修改为````NSHTTPCookieAcceptPolicyAlways 或是 NSHTTPCookieAcceptPolicyOnlyFromMainDocumentDomain````，再次测试一次，可以看到，服务端和客户端设置的cookie都会打印出来。这两个选项会针对不同域名返回的cookie做选择性保存。

````
2016-02-14 00:59:47.030 network-demo[21191:1810897] cookie:<NSHTTPCookie version:0 name:"a" value:"aaa" expiresDate:2016-02-13 17:00:32 +0000 created:2016-02-13 16:59:32 +0000 sessionOnly:FALSE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-14 00:59:47.030 network-demo[21191:1810897] cookie:<NSHTTPCookie version:0 name:"b" value:"bbb" expiresDate:2016-02-13 17:00:32 +0000 created:2016-02-13 16:59:32 +0000 sessionOnly:FALSE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-14 00:59:47.030 network-demo[21191:1810897] cookie:<NSHTTPCookie version:0 name:"d" value:"001" expiresDate:(null) created:2016-02-13 16:59:38 +0000 sessionOnly:TRUE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-14 00:59:47.031 network-demo[21191:1810897] cookie:<NSHTTPCookie version:0 name:"e" value:"1112" expiresDate:(null) created:2016-02-13 16:59:38 +0000 sessionOnly:TRUE domain:"localhost" path:"/" isSecure:FALSE>
2016-02-14 00:59:47.031 network-demo[21191:1810897] cookie:<NSHTTPCookie version:0 name:"f" value:"2222" expiresDate:2016-02-13 17:00:38 +0000 created:2016-02-13 16:59:38 +0000 sessionOnly:FALSE domain:"localhost" path:"/" isSecure:FALSE>
````



## 使用cookie的注意点
---

### Cookie的性能影响
由于Cookie的实现机制，除非Cookie过期，否则浏览器每次请求都会向服务器发送Cookie，一旦Cookie设置过多，会导致请求报头过大，造成带宽的浪费。因此，对Cookie的性能优化也是值得关注的一个问题。如何进行性能优化？

-   减小Cookie的大小
-   为不需要Cookie的组件换个域名，以减少无效Cookie的传输
-   减少DNS查询



## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/network-demo)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处


## 参考阅读
---

-   [node.js操作Cookie](http://www.tuicool.com/articles/F3UF7n)
-   [【深入浅出NodeJS】Cookie&Session机制详解#1](http://www.jianshu.com/p/51d85be2e0e8)
-   [nodejs api](https://nodejs.org/docs/latest/api/http.html)
-   jack Cox[M] iOS网络高级编程-iphone和ipad企业应用开发 张龙 译．-北京 清华大学出版社，2014(2015.8重印)