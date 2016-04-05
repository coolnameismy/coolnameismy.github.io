---
layout: post
title: iOS networking（三） http异步请求和https认证
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



##  普通http请求
> 普通http请求，使用NSURLConnection示例对象，发送request，通过NSURLConnectionDataDelegate获取数据和请求状态

### 发送数据
````objc
#pragma mark -网络请求

- (void)nornalHttpRequest{
    NSString *urlString = @"http://localhost:8001/";
    //stringByAddingPercentEncodingWithAllowedCharacters URLQueryAllowedCharacterSet主要用于url查询字符串编码
    NSURL *url = [NSURL URLWithString:[urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]]];
    NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
    //发出request
    [connection start];
}

````


### 数据和请求状态的主要委托

````objc
//请求失败
- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    NSLog(@"=================didFailWithError=================");
    NSLog(@"error:%@",error);
}

//重定向
- (nullable NSURLRequest *)connection:(NSURLConnection *)connection willSendRequest:(NSURLRequest *)request redirectResponse:(nullable NSURLResponse *)response{
    NSLog(@"=================request redirectResponse=================");
    NSLog(@"request:%@",request);
    return request;
}

//接收响应
- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response{
    NSLog(@"=================didReceiveResponse=================");
    NSHTTPURLResponse *resp = (NSHTTPURLResponse *)response;
    NSLog(@"response:%@",resp);
}

//接收响应
- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    NSLog(@"=================didReceiveData=================");
    NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
    NSLog(@"data:%@",dic);
}


//完成请求
- (void)connectionDidFinishLoading:(NSURLConnection *)connection{
    NSLog(@"=================connectionDidFinishLoading=================");
}


````

调用nornalHttpRequest方法后可以在控制台看到接收到的数据

````
2016-02-05 16:16:20.695 network-demo[31610:4130315] =================request redirectResponse=================
2016-02-05 16:16:20.695 network-demo[31610:4130315] request:<NSURLRequest: 0x7f9d115b0850> { URL: http://localhost:8001/ }
2016-02-05 16:16:20.877 network-demo[31610:4130315] =================didReceiveResponse=================
2016-02-05 16:16:20.877 network-demo[31610:4130315] response:<NSHTTPURLResponse: 0x7f9d1171c7e0> { URL: http://localhost:8001/ } { status code: 200, headers {
    Connection = "keep-alive";
    "Content-Type" = "text/json";
    Date = "Fri, 05 Feb 2016 08:16:20 GMT";
    "Transfer-Encoding" = Identity;
} }
2016-02-05 16:16:20.877 network-demo[31610:4130315] =================didReceiveData=================
2016-02-05 16:16:20.877 network-demo[31610:4130315] data:{
    age = 20;
    name = xxx;
}
2016-02-05 16:16:20.878 network-demo[31610:4130315] =================connectionDidFinishLoading=================
````

值得注意的是 ````=================request redirectResponse=================```` 为什么会出现重定向? 这是因为在我测试中，并不是第一次发起请求，而请求内容并没有发生变化，所以走了缓存，就会进入redirect重定向的委托。重定向和request设置的缓存策略有很大的关系。

```` NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10]; ````


##  https请求

https协议和http协议的区别就在于https在建立tcp连接之后，有一段相互认证的过程，

HTTPS：当客户端第一次发送请求的时候，服务器会返回一个包含公钥的受保护空间（也成为证书），当我们发送请求的时候，公钥会将请求加密再发送给服务器，服务器接到请求之后，用自带的私钥进行解密，如果正确再返回数据。这就是 HTTPS 的安全性所在

![](http://upload-images.jianshu.io/upload_images/266345-9caefa5798c3660e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

https的认证过程，在NSURLConnection中使用NSURLConnectionDelegate中的委托完成，简单的说我们获取到保护控件的证书后，验证证书，并授信证书，就可以请求https资源了，更详细的过程我也还在探索，以后再补充。


在之前实现异步http请求的基础上，我们测试请求github获取用户信息https的api，需要现实线委托，然后请求，代码如下：

````objc
//https请求-github获取用户信息
- (void)githubUserInfo{
    //string 转 url编码
    NSString *urlString = @"https://api.github.com/users/coolnameismy";
    NSURL *url = [NSURL URLWithString:[urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]]];
    NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
    [connection start];
}

#pragma mark -https认证
-(BOOL)connectionShouldUseCredentialStorage:(NSURLConnection *)connection{
    NSLog(@"=================connectionShouldUseCredentialStorage=================");
    return true;
}
- (void)connection:(NSURLConnection *)connection willSendRequestForAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge{
    NSLog(@"=================willSendRequestForAuthenticationChallenge=================");
    NSLog(@"didReceiveAuthenticationChallenge %@ %zd", [[challenge protectionSpace] authenticationMethod], (ssize_t) [challenge previousFailureCount]);

    if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]){
        NSLog(@"是服务器信任的证书:%@",challenge.protectionSpace.authenticationMethod);
        //通过认证
        [[challenge sender]  useCredential:[NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust] forAuthenticationChallenge:challenge];
        [[challenge sender]  continueWithoutCredentialForAuthenticationChallenge: challenge];
    }
}
````

请求成功打印出的日志

````
2016-02-09 21:01:42.102 network-demo[10032:403483] =================request redirectResponse=================
2016-02-09 21:01:42.103 network-demo[10032:403483] request:<NSURLRequest: 0x7fa47b002ef0> { URL: https://api.github.com/users/coolnameismy }
2016-02-09 21:01:42.103 network-demo[10032:403483] =================connectionShouldUseCredentialStorage=================
2016-02-09 21:01:42.766 network-demo[10032:403483] =================willSendRequestForAuthenticationChallenge=================
2016-02-09 21:01:42.766 network-demo[10032:403483] didReceiveAuthenticationChallenge NSURLAuthenticationMethodServerTrust 0
2016-02-09 21:01:42.767 network-demo[10032:403483] 是服务器信任的证书:NSURLAuthenticationMethodServerTrust
2016-02-09 21:01:43.459 network-demo[10032:403483] =================didReceiveResponse=================
2016-02-09 21:01:43.460 network-demo[10032:403483] response:<NSHTTPURLResponse: 0x7fa478ee29a0> { URL: https://api.github.com/users/coolnameismy } { status code: 200, headers {
    "Access-Control-Allow-Credentials" = true;
    "Access-Control-Allow-Origin" = "*";
    "Access-Control-Expose-Headers" = "ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval";
    "Cache-Control" = "public, max-age=60, s-maxage=60";
    "Content-Encoding" = gzip;
    "Content-Security-Policy" = "default-src 'none'";
    "Content-Type" = "application/json; charset=utf-8";
    Date = "Tue, 09 Feb 2016 12:55:57 GMT";
    Etag = "W/\"f1434609a610832d68fb4fef98e43f48\"";
    "Last-Modified" = "Tue, 26 Jan 2016 16:02:40 GMT";
    Server = "GitHub.com";
    Status = "200 OK";
    "Strict-Transport-Security" = "max-age=31536000; includeSubdomains; preload";
    "Transfer-Encoding" = Identity;
    Vary = "Accept, Accept-Encoding";
    "X-Content-Type-Options" = nosniff;
    "X-Frame-Options" = deny;
    "X-GitHub-Media-Type" = "github.v3";
    "X-GitHub-Request-Id" = "7751919E:C8D5:8399087:56B9E1DC";
    "X-RateLimit-Limit" = 60;
    "X-RateLimit-Remaining" = 59;
    "X-RateLimit-Reset" = 1455026157;
    "X-Served-By" = 139317cebd6caf9cd03889139437f00b;
    "X-XSS-Protection" = "1; mode=block";
} }
2016-02-09 21:01:43.461 network-demo[10032:403483] =================didReceiveData=================
2016-02-09 21:01:43.463 network-demo[10032:403483] data:{
    "avatar_url" = "https://avatars.githubusercontent.com/u/5010799?v=3";
    bio = "<null>";
    blog = "http://liuyanwei.jumppo.com";
    company = ZTE;
    "created_at" = "2013-07-15T06:29:49Z";
    email = "coolnameismy@hotmail.com";
    "events_url" = "https://api.github.com/users/coolnameismy/events{/privacy}";
    followers = 207;
    "followers_url" = "https://api.github.com/users/coolnameismy/followers";
    following = 41;
    "following_url" = "https://api.github.com/users/coolnameismy/following{/other_user}";
    "gists_url" = "https://api.github.com/users/coolnameismy/gists{/gist_id}";
    "gravatar_id" = "";
    hireable = 1;
    "html_url" = "https://github.com/coolnameismy";
    id = 5010799;
    location = "nanjing china";
    login = coolnameismy;
    name = "\U5218\U5f66\U73ae";
    "organizations_url" = "https://api.github.com/users/coolnameismy/orgs";
    "public_gists" = 0;
    "public_repos" = 23;
    "received_events_url" = "https://api.github.com/users/coolnameismy/received_events";
    "repos_url" = "https://api.github.com/users/coolnameismy/repos";
    "site_admin" = 0;
    "starred_url" = "https://api.github.com/users/coolnameismy/starred{/owner}{/repo}";
    "subscriptions_url" = "https://api.github.com/users/coolnameismy/subscriptions";
    type = User;
    "updated_at" = "2016-01-26T16:02:40Z";
    url = "https://api.github.com/users/coolnameismy";
}
2016-02-09 21:01:43.463 network-demo[10032:403483] =================connectionDidFinishLoading=================

````


## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/network-demo)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处


## 参考阅读

-   [iOS - HTTPS](http://www.jianshu.com/p/4b5d2d47833d)
-   [iOS 网络通信](http://iyiming.me/blog/2015/01/10/ios-wang-luo-tong-xin/)
