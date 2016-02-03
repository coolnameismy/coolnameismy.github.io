---
layout: post
title: ios networking（二） http异步请求
category: 技术
tags: react-native
keywords: react-native
description:
---


## 同步队列请求

````objc
#pragma mark -异步队列请求
-(void)requestByAsyncQueue{

  NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:8001"]];
    NSURLResponse *resp;
    NSOperationQueue *queue = [[NSOperationQueue alloc]init];

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





## 同步请求


