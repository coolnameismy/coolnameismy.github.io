---
layout: post
title: iOS networking（二） http异步队列请求
category: iOS
tags:
keywords:
description:
---


## 同步队列请求

````objc
#pragma mark -异步队列请求
-(void)requestByAsyncQueue{

  NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:8001"]];
    NSURLResponse *resp;
    NSOperationQueue *queue = [[NSOperationQueue alloc]init];
    // NSOperationQueue *queue = [NSOperationQueue mainQueue];

    //发送异步请求
    [NSURLConnection sendAsynchronousRequest:req queue:queue completionHandler:^(NSURLResponse * _Nullable response, NSData * _Nullable data, NSError * _Nullable connectionError) {

        //检查错误
        if (connectionError) {
            NSLog(@"%@",connectionError);
            NSLog(@"==resq====%@",resp);
            return;
        }

        //检验状态码
        if ([resp isKindOfClass:[NSHTTPURLResponse class]]) {
            if (((NSHTTPURLResponse *)resp).statusCode != 200) {
                return;
            }
        }
        //解析json
        NSLog(@"%@",[NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil ]);

        NSLog(@"====请求结束====");
    }];

    NSLog(@"====请求开始1====");
}

````

打印出的日志

````
2016-02-04 09:21:38.858 network-demo[27091:3621428] 2016-02-04 01:21:38 +0000
2016-02-04 09:21:39.858 network-demo[27091:3621428] 2016-02-04 01:21:39 +0000
2016-02-04 09:21:40.462 network-demo[27091:3621950] ====请求开始1====
2016-02-04 09:21:40.858 network-demo[27091:3621428] 2016-02-04 01:21:40 +0000
2016-02-04 09:21:41.858 network-demo[27091:3621428] 2016-02-04 01:21:41 +0000
2016-02-04 09:21:42.859 network-demo[27091:3621428] 2016-02-04 01:21:42 +0000
2016-02-04 09:21:43.417 network-demo[27091:3621966] {
    age = 20;
    name = xxx;
}
2016-02-04 09:21:43.417 network-demo[27091:3621966] ====请求结束1====
2016-02-04 09:21:43.859 network-demo[27091:3621428] 2016-02-04 01:21:43 +0000
2016-02-04 09:21:44.859 network-demo[27091:3621428] 2016-02-04 01:21:44 +0000
````


从这里可以看出，请求是异步的，并且可以NSOperationQueue可以和NSInvocationOperation或是NSBlocknOperation混合使用。我们再来测试下在使用主队列 ```` NSOperationQueue *queue = [NSOperationQueue mainQueue]; ```` 执行请求，会不会阻塞主进程

````
2016-02-04 16:10:59.532 network-demo[29228:3818310] 2016-02-04 08:10:59 +0000
2016-02-04 16:10:59.793 network-demo[29228:3818310] ====请求开始1====
2016-02-04 16:11:00.532 network-demo[29228:3818310] 2016-02-04 08:11:00 +0000
2016-02-04 16:11:01.532 network-demo[29228:3818310] 2016-02-04 08:11:01 +0000
2016-02-04 16:11:02.531 network-demo[29228:3818310] 2016-02-04 08:11:02 +0000
2016-02-04 16:11:03.532 network-demo[29228:3818310] 2016-02-04 08:11:03 +0000
2016-02-04 16:11:04.532 network-demo[29228:3818310] 2016-02-04 08:11:04 +0000
2016-02-04 16:11:05.531 network-demo[29228:3818310] 2016-02-04 08:11:05 +0000
2016-02-04 16:11:06.532 network-demo[29228:3818310] 2016-02-04 08:11:06 +0000
2016-02-04 16:11:07.532 network-demo[29228:3818310] 2016-02-04 08:11:07 +0000
2016-02-04 16:11:08.532 network-demo[29228:3818310] 2016-02-04 08:11:08 +0000
2016-02-04 16:11:09.532 network-demo[29228:3818310] 2016-02-04 08:11:09 +0000
2016-02-04 16:11:09.942 network-demo[29228:3818310] {
    age = 20;
    name = xxx;
}
2016-02-04 16:11:09.942 network-demo[29228:3818310] ====请求结束1====
2016-02-04 16:11:10.532 network-demo[29228:3818310] 2016-02-04 08:11:10 +0000
2016-02-04 16:11:11.532 network-demo[29228:3818310] 2016-02-04 08:11:11 +0000
````

可以从打印结果看出，并不会造成主线程的阻塞。 我们再来试下在completionHandler中加入sleep(5),看看会不会阻塞线程

````
    //发送异步请求
    [NSURLConnection sendAsynchronousRequest:req queue:queue completionHandler:^(NSURLResponse * _Nullable response, NSData * _Nullable data, NSError * _Nullable connectionError) {

         NSLog(@"====deno star====");
         sleep(5);
         NSLog(@"====sleep deno ====");

        //检查错误
        if (connectionError) {
            NSLog(@"%@",connectionError);
            NSLog(@"==resq====%@",resp);
            return;
        }

        //检验状态码
        if ([resp isKindOfClass:[NSHTTPURLResponse class]]) {
            if (((NSHTTPURLResponse *)resp).statusCode != 200) {
                return;
            }
        }
        //解析json
        NSLog(@"%@",[NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil ]);

        NSLog(@"====请求结束1====");
    }];

````

可以发现，线程被阻塞了。这就说明一个问题，在发送sendAsynchronousRequest异步请求后，都是异步调用，queue参数只是说明在哪个队列上执行completionHandler这个block而已。

关于NSOperationQueue的部分，就不多说了，之前的文章写过，[见这里](http://liuyanwei.jumppo.com/2015/08/19/ios-ThreadAndAsynchronization.html)

### 异步队列请求的最佳实践

-   返回响应的数据都会保存在内存中，如果响应的内容非常大，请考虑内存溢出的问题。
-   在处理返回数据前，请验证error和http响应状态码
-   不能使用网络请求的高级功能，如验证，进度，流传输,取消


## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/network-demo)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处


