---
layout: post
title: iOS networking（一） http同步请求
category: iOS
tags: iOS
keywords:
description:
---


## 同步请求

### 最简单的同步请求

````objc
  //请求数据
  NSData *data = [NSData dataWithContentURL:[NSURL URLWithString:@"http://domain.com/a.png"]];
````

### 基于NSURLConnection的同步请求
先用nodejs写一个简单的中间件处理请求，代码如下：

````javascript
	/*
		返回值：{"name":"xxx","age":20}
	*/
	function get(req,res){
		//写入头
		res.writeHead(200,{
			'Content-type':'text/json'
		});

		var data = {
			'name':'liuyanwei',
			'age':30
		}
		res.write(JSON.stringify(data));

		res.end();
	}

````

接着用NSURLSession发送一个同步请求

````objc

-(void)requestBySync{
    NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:8001"]];
    NSURLResponse *resp; NSError *err;

    NSData *data = [NSURLConnection sendSynchronousRequest:req returningResponse:&resp error:&err];
    NSLog(@"====请求开始====");

    //检查错误
    if (err) {
        NSLog(@"%@",err);
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
    NSLog(@"%@",[NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:&err ]);

    NSLog(@"====请求结束====");
}


````

可以看到结果如下：

````
2016-02-03 11:24:55.642 network-demo[23973:3183834] ====请求开始====
2016-02-03 11:24:55.643 network-demo[23973:3183834] {
    age = 20;
    name = xxx;
}
2016-02-03 11:24:55.643 network-demo[23973:3183834] ====请求结束====
````

我们来修改一下服务端代码，设置一个等待2秒后返回，因为nodejs是单线程应用，所以模拟一下等待2秒，代码如下

````javascript

//模拟阻塞
function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
 };


````

然后我们修改一下iOS程序，加一个定时器，没秒钟输出一个log，判断主线程是否阻塞

````objc
[NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(tick) userInfo:nil repeats:YES];
-(void)tick{
    NSLog(@"%@",[NSDate date]);
}
````

再次发送同步请求，可以看出，线程阻塞了2秒

````
2016-02-03 14:14:44.314 network-demo[24786:3266302] 2016-02-03 06:14:44 +0000
2016-02-03 14:14:45.312 network-demo[24786:3266302] 2016-02-03 06:14:45 +0000
2016-02-03 14:14:46.312 network-demo[24786:3266302] 2016-02-03 06:14:46 +0000
2016-02-03 14:14:49.276 network-demo[24786:3266302] ====请求开始====
2016-02-03 14:14:49.277 network-demo[24786:3266302] {
    age = 20;
    name = xxx;
}
2016-02-03 14:14:49.277 network-demo[24786:3266302] ====请求结束====
2016-02-03 14:14:49.281 network-demo[24786:3266302] 2016-02-03 06:14:49 +0000
2016-02-03 14:14:49.319 network-demo[24786:3266302] 2016-02-03 06:14:49 +0000
2016-02-03 14:14:50.312 network-demo[24786:3266302] 2016-02-03 06:14:50 +0000
2016-02-03 14:14:51.312 network-demo[24786:3266302] 2016-02-03 06:14:51 +0000
````

### 同步请求的最佳实践

    -   不要在主线程使用同步请求，除非你明确知道这个请求加载速度会非常的快，比如加载本地资源
    -   返回响应的数据都会保存在内存中，如果响应的内容非常大，请考虑内存溢出的问题。
    -   在处理返回数据前，请验证error和http响应状态码
    -   不能使用网络请求的高级功能，如验证，进度，流传输,取消





## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/network-demo)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处
