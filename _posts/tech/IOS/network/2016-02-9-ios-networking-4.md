---
layout: post
title: iOS networking（四） http异步文件上传和下载以及进度指示
category: iOS
tags:
keywords:
description:
---

>   本篇主要关注如何处理文件上传和下载，如何获取文件上传和下载的进度。

## 文件下载和进度

###  nodejs服务端下载图片

先改造一下我们的服务端程序，来下载一张图片，代码如下

````js

    //下载返回文件流
	function download(req,res){
		//写入头
	    var downloadFilePath = "./1.jpg";
	    var filename = path.basename(downloadFilePath);
	    var filesize = fs.readFileSync(downloadFilePath).length;
	    res.setHeader('Content-Disposition','attachment;filename=' + filename);//此处是关键
	    res.setHeader('Content-Length',filesize);
	    res.setHeader('Content-Type','application/octet-stream');
	    var fileStream = fs.createReadStream(downloadFilePath,{bufferSize:1024 * 1024});
		 fileStream.pipe(res,{end:true});
		// res.writeHead(200, {'content-type': 'text/html'});
	}

	//改造一下handler方法，让url访问/download的时候进入文件下载的方法，返回文件流
	handler:function(req,res){
        console.log('handler');
        console.log(req.url);
        switch(req.url){
            case '/' : get(req,res); break;
            case "/download" : download(req,res); break;
        }

    }
````

### iOS请求下载文件流

````objc
//http下载文件流
- (void)download{
    //string 转 url编码
    NSString *urlString = @"http://localhost:8001/download";
    NSURL *url = [NSURL URLWithString:[urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]]];
    NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
    [connection start];
}


````

修改下请求委托，打印出请求头和收到的data，从而看一下收到的数据大小和数据请求进度相关内容。

````objc
//接收响应
- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response{
    NSLog(@"=================didReceiveResponse=================");
    NSHTTPURLResponse *resp = (NSHTTPURLResponse *)response;
    NSLog(@"response:%@",resp);

}

//接收响应
- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    NSLog(@"=================didReceiveData=================");
    NSLog(@"data.length:%lu",(unsigned long)data.length);

}
````

完成请求后打印出的结果如下：

````
2016-02-11 21:48:50.694 network-demo[14461:1033375] =================request redirectResponse=================
2016-02-11 21:48:50.696 network-demo[14461:1033375] request:<NSURLRequest: 0x7f91ea7948d0> { URL: http://localhost:8001/download }
2016-02-11 21:48:50.706 network-demo[14461:1033375] =================didReceiveResponse=================
2016-02-11 21:48:50.706 network-demo[14461:1033375] response:<NSHTTPURLResponse: 0x7f91ea5596f0> { URL: http://localhost:8001/download } { status code: 200, headers {
    Connection = "keep-alive";
    "Content-Disposition" = "attachment;filename=1.jpg";
    "Content-Length" = 19557;
    "Content-Type" = "application/octet-stream";
    Date = "Thu, 11 Feb 2016 13:48:50 GMT";
} }
2016-02-11 21:48:50.706 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 21:48:56.148 network-demo[14461:1033375] data.length:19557
2016-02-11 21:48:56.148 network-demo[14461:1033375] =================connectionDidFinishLoading=================
````

可以看出：服务端在resqonse头中加入了content-length信息，告知整个流的大小，不过因为图片文件本身
较小，所以并没有分包，因此````didReceiveData````方法只调用了一次就完成了文件传递。大家可以试着修改下服务端返回的文件，
改为一个较大点的文件来试一次，这里我改成一个稍微大一些的图片，一张我自己hhkb键盘的美图~

```` var downloadFilePath = "./IMG_0222.jpg"; ```` 再试着发一次请求：

````
2016-02-11 22:09:14.088 network-demo[14461:1033375] =================request redirectResponse=================
2016-02-11 22:09:14.089 network-demo[14461:1033375] request:<NSURLRequest: 0x7f91ea54c5f0> { URL: http://localhost:8001/download }
2016-02-11 22:09:14.118 network-demo[14461:1033375] =================didReceiveResponse=================
2016-02-11 22:09:14.119 network-demo[14461:1033375] response:<NSHTTPURLResponse: 0x7f91ea591810> { URL: http://localhost:8001/download } { status code: 200, headers {
    Connection = "keep-alive";
    "Content-Disposition" = "attachment;filename=IMG_0222.jpg";
    "Content-Length" = 1265302;
    "Content-Type" = "application/octet-stream";
    Date = "Thu, 11 Feb 2016 14:09:14 GMT";
} }
2016-02-11 22:09:14.119 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.119 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.120 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.120 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.121 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.121 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.122 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.122 network-demo[14461:1033375] data.length:131072
2016-02-11 22:09:14.123 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.123 network-demo[14461:1033375] data.length:132000
2016-02-11 22:09:14.123 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.124 network-demo[14461:1033375] data.length:392288
2016-02-11 22:09:14.124 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.124 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.124 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.125 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.125 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.125 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.125 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.125 network-demo[14461:1033375] data.length:65536
2016-02-11 22:09:14.126 network-demo[14461:1033375] =================didReceiveData=================
2016-02-11 22:09:14.126 network-demo[14461:1033375] data.length:151190
2016-02-11 22:09:14.126 network-demo[14461:1033375] =================connectionDidFinishLoading=================

````

可以看到````didReceiveData````委托被反复调用了很多次，我们可以通过 ````data.length:151190 ```` 和 ```` "Content-Length" = 1265302;  ````
就可以计算出流的下载进度。

````objc
  //获取Content-Length
  //[[((NSHTTPURLResponse *)response) allHeaderFields]objectForKey:@"Content-length"]
````

获取到完成的data后，可以直接把二进制的data转换成图片，代码如下：

````objc
   UIImage *img = [UIImage imageWithData:data];
   UIImageView *imageView = [[UIImageView alloc]initWithImage:img];
   [imageView setFrame:CGRectMake(30, 30, 200, 200)];
   [self.view addSubview:imageView];
````


## 上传文件和进度

### 服务端代码
服务端使用nodejs写的接受图片上传，重命名并保存文件，使用了````formidable````这个库完成图片获取，作为demo写的比较简单大家随意感受下。

````JavaScript

//文件上传
	function upload(req,res){
		//创建上传表单
		var form = new formidable.IncomingForm();
		//设置编辑
		form.encoding = 'utf-8';
		//设置上传目录
		form.uploadDir = './upload/';
		form.keepExtensions = true;
		//文件大小
		form.maxFieldsSize = 10 * 1024 * 1024;
		form.parse(req, function (err, fields, files) {
			if(err) {
				res.send(err);
				return;
			}
			// console.log(fields);
			console.log("=====");
			// console.log(files);
			// console.log(files.file.name);
			var extName = /\.[^\.]+/.exec(files.file.name);
			var ext = Array.isArray(extName)
				? extName[0]
				: '';
			//重命名，以防文件重复
			var avatarName = uuid() + ext;
			//移动的文件目录
			var newPath = form.uploadDir + avatarName;
			fs.renameSync(files.file.path, newPath);
			// res.send('success');
			var msg = { "status":1,"msg":"succeed"}
			res.write(JSON.stringify(msg));
			res.end();
		});
	}

````

### http文件传输协议

来说点文件上传http协议的基础，前面的demo中，我们都没有设置请求头，因为我们都使用了默认的请求头
 ````  Content-Type:application/x-www-form-urlencoded  ```` ，这个请求头就是和html中的表单上传，如果get请求则
 数据在url中，如果post请求，数据默认放在请求体中。然后默认的````x-www-form-urlencoded````头并不能上传文件，上传文件需要
 设置头为：```` Content-Type:multipart/form-data; boundary=YY ```` ，boundary用于标识边界，可以自定义，使用时前面需要加上两个--，例如："--YY"

我们在iOS上传文件时需要这样设置请求头

````objc
  /** 设置请求头 */
    // 请求体的长度
    [request setValue:[NSString stringWithFormat:@"%zd", body.length] forHTTPHeaderField:@"Content-Length"];
    // 声明这个POST请求是个文件上传
    [request setValue:@"multipart/form-data; boundary=YY" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPMethod:@"POST"];
````


### iOS文件上传代码

我们上传一张稍微大点的图片，直接使用````NSBundle````对象读取项目中的文件，然后设置请求相关的委托方法，代码如下

````objc


//http上传文件流
- (void)upload{

    #define Encode(str) [str dataUsingEncoding:NSUTF8StringEncoding]

    NSURL *dataurl = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"IMG_0222" ofType:@"jpg"]];
    NSData *data = [NSData dataWithContentsOfURL:dataurl];

    //string 转 url编码
    NSString *urlString = @"http://localhost:8001/upload";
    NSURL *url = [NSURL URLWithString:[urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]]];

    NSMutableURLRequest *request = [[NSMutableURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];

    /** 设置请求头 */
    NSMutableData *body = [NSMutableData data];

    //文件参数
    // 参数开始的标志
    [body appendData:Encode(@"--YY\r\n")];
    // name : 指定参数名(必须跟服务器端保持一致)
    // filename : 文件名
    NSString *disposition = [NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", @"file", @"1.jpg"];
    [body appendData:Encode(disposition)];
    NSString *type = [NSString stringWithFormat:@"Content-Type: %@\r\n", @"multipart/form-data"];
    [body appendData:Encode(type)];
    [body appendData:Encode(@"\r\n")];

    //添加图片数据
    [body appendData:data];
    [body appendData:Encode(@"\r\n")];
    //结束符
    [body appendData:Encode(@"--YY--\r\n")];
    //把body添加到request中
    [request setHTTPBody:body];

    /** 设置请求头 */
    // 请求体的长度
    [request setValue:[NSString stringWithFormat:@"%zd", body.length] forHTTPHeaderField:@"Content-Length"];
    // 声明这个POST请求是个文件上传
    [request setValue:@"multipart/form-data; boundary=YY" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPMethod:@"POST"];


    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
    [connection start];
}


#pragma mark -网络请求委托

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
    //    UIImage *img = [UIImage imageWithData:data];
    //    UIImageView *imageView = [[UIImageView alloc]initWithImage:img];
    //    [imageView setFrame:CGRectMake(30, 30, 200, 200)];
    //    [self.view addSubview:imageView];

    NSLog(@"data.length:%lu",(unsigned long)data.length);
    if (data) {
        NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
        NSLog(@"data:%@",dic);
    }
}

//上传数据委托，用于显示上传进度
- (void)connection:(NSURLConnection *)connection   didSendBodyData:(NSInteger)bytesWritten
 totalBytesWritten:(NSInteger)totalBytesWritten
totalBytesExpectedToWrite:(NSInteger)totalBytesExpectedToWrite{
    NSLog(@"=================totalBytesWritten=================");
    NSLog(@"didSendBodyData:%ld,totalBytesWritten:%ld,totalBytesExpectedToWrite:%ld",(long)bytesWritten,(long)totalBytesWritten,(long)totalBytesExpectedToWrite);
    NSLog(@"上传进度%ld%%",(long)(totalBytesWritten*100 / totalBytesExpectedToWrite));
}

//完成请求
- (void)connectionDidFinishLoading:(NSURLConnection *)connection{
    NSLog(@"=================connectionDidFinishLoading=================");
}

````

大家可以看下代码，重点可以看下 ````upload````方法，和
 ````- (void)connection:(NSURLConnection *)connection   didSendBodyData:(NSInteger)bytesWritten
                                        totalBytesWritten:(NSInteger)totalBytesWritten````
这个委托，观察如何设置文件上传的请求头和请求体，如果获取上传文件的进度。

### 程序运行后打印的结果

服务端日志，打印请求头

````
{ host: 'localhost:8001',
  'content-type': 'multipart/form-data; boundary=YY',
  connection: 'keep-alive',
  accept: '*/*',
  'user-agent': 'network-demo/1 CFNetwork/758.0.2 Darwin/14.5.0',
  'content-length': '1265418',
  'accept-language': 'en-us',
  'accept-encoding': 'gzip, deflate' }
````

客户端日志：

````
2016-02-12 13:05:07.330 network-demo[16708:1254465] =================request redirectResponse=================
2016-02-12 13:05:07.331 network-demo[16708:1254465] request:<NSURLRequest: 0x7f9fa1691240> { URL: http://localhost:8001/upload }
2016-02-12 13:05:07.339 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.339 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:32768,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.339 network-demo[16708:1254465] 上传进度2%
2016-02-12 13:05:07.339 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.339 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:65536,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.339 network-demo[16708:1254465] 上传进度5%
2016-02-12 13:05:07.340 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.340 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:98304,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.340 network-demo[16708:1254465] 上传进度7%
2016-02-12 13:05:07.340 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.340 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:131072,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.340 network-demo[16708:1254465] 上传进度10%
2016-02-12 13:05:07.340 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.341 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:163840,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.341 network-demo[16708:1254465] 上传进度12%
2016-02-12 13:05:07.341 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.341 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:196608,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.341 network-demo[16708:1254465] 上传进度15%
2016-02-12 13:05:07.341 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.341 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:229376,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.342 network-demo[16708:1254465] 上传进度18%
2016-02-12 13:05:07.342 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.342 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:262144,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.342 network-demo[16708:1254465] 上传进度20%
2016-02-12 13:05:07.342 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.342 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:294912,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.342 network-demo[16708:1254465] 上传进度23%
2016-02-12 13:05:07.343 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.343 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:327680,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.343 network-demo[16708:1254465] 上传进度25%
2016-02-12 13:05:07.343 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.343 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:360448,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.343 network-demo[16708:1254465] 上传进度28%
2016-02-12 13:05:07.343 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.343 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:393216,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.344 network-demo[16708:1254465] 上传进度31%
2016-02-12 13:05:07.344 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.344 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:425984,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.344 network-demo[16708:1254465] 上传进度33%
2016-02-12 13:05:07.354 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.354 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:458752,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.354 network-demo[16708:1254465] 上传进度36%
2016-02-12 13:05:07.354 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.354 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:491520,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.354 network-demo[16708:1254465] 上传进度38%
2016-02-12 13:05:07.354 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.354 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:524288,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.355 network-demo[16708:1254465] 上传进度41%
2016-02-12 13:05:07.355 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.355 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:557056,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.355 network-demo[16708:1254465] 上传进度44%
2016-02-12 13:05:07.355 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.355 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:589824,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.355 network-demo[16708:1254465] 上传进度46%
2016-02-12 13:05:07.356 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.356 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:622592,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.356 network-demo[16708:1254465] 上传进度49%
2016-02-12 13:05:07.356 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.356 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:655360,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.356 network-demo[16708:1254465] 上传进度51%
2016-02-12 13:05:07.356 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.357 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:688128,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.357 network-demo[16708:1254465] 上传进度54%
2016-02-12 13:05:07.357 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.357 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:720896,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.357 network-demo[16708:1254465] 上传进度56%
2016-02-12 13:05:07.357 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.357 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:753664,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.357 network-demo[16708:1254465] 上传进度59%
2016-02-12 13:05:07.358 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.358 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:786432,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.358 network-demo[16708:1254465] 上传进度62%
2016-02-12 13:05:07.358 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.358 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:819200,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.359 network-demo[16708:1254465] 上传进度64%
2016-02-12 13:05:07.359 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.359 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:851968,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.359 network-demo[16708:1254465] 上传进度67%
2016-02-12 13:05:07.359 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.359 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:884736,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.359 network-demo[16708:1254465] 上传进度69%
2016-02-12 13:05:07.359 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.360 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:917504,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.360 network-demo[16708:1254465] 上传进度72%
2016-02-12 13:05:07.360 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.360 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:950272,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.360 network-demo[16708:1254465] 上传进度75%
2016-02-12 13:05:07.360 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.360 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:983040,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.361 network-demo[16708:1254465] 上传进度77%
2016-02-12 13:05:07.374 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.375 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1015808,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.375 network-demo[16708:1254465] 上传进度80%
2016-02-12 13:05:07.375 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.375 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1048576,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.375 network-demo[16708:1254465] 上传进度82%
2016-02-12 13:05:07.375 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.375 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1081344,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.375 network-demo[16708:1254465] 上传进度85%
2016-02-12 13:05:07.375 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.376 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1114112,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.376 network-demo[16708:1254465] 上传进度88%
2016-02-12 13:05:07.376 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.376 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1146880,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.376 network-demo[16708:1254465] 上传进度90%
2016-02-12 13:05:07.376 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.376 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1179648,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.376 network-demo[16708:1254465] 上传进度93%
2016-02-12 13:05:07.377 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.377 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1212416,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.377 network-demo[16708:1254465] 上传进度95%
2016-02-12 13:05:07.377 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.377 network-demo[16708:1254465] didSendBodyData:32768,totalBytesWritten:1245184,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.377 network-demo[16708:1254465] 上传进度98%
2016-02-12 13:05:07.377 network-demo[16708:1254465] =================totalBytesWritten=================
2016-02-12 13:05:07.377 network-demo[16708:1254465] didSendBodyData:20234,totalBytesWritten:1265418,totalBytesExpectedToWrite:1265418
2016-02-12 13:05:07.378 network-demo[16708:1254465] 上传进度100%
2016-02-12 13:05:07.404 network-demo[16708:1254465] =================didReceiveResponse=================
2016-02-12 13:05:07.405 network-demo[16708:1254465] response:<NSHTTPURLResponse: 0x7f9fa16af610> { URL: http://localhost:8001/upload } { status code: 200, headers {
    Connection = "keep-alive";
    Date = "Fri, 12 Feb 2016 05:05:07 GMT";
    "Transfer-Encoding" = Identity;
} }
2016-02-12 13:05:07.405 network-demo[16708:1254465] =================didReceiveData=================
2016-02-12 13:05:07.405 network-demo[16708:1254465] data.length:28
2016-02-12 13:05:07.405 network-demo[16708:1254465] data:{
    msg = succeed;
    status = 1;
}
2016-02-12 13:05:07.405 network-demo[16708:1254465] =================connectionDidFinishLoading=================

````

大家可以看出如何读取文件上传的进度了。


##  总结异步http请求
>   使用异步http请求代码量复杂，但是有许多其他方式达不到的优点

-   使用文件流上传和下载，节省内存
-   文件上传和下载有进度提示
-   可以处理url验证
-   可以取消在请求过程中取消请求（ 使用 ```` [connection cancel] ```` 方法）

例如在demo中注释的一段代码：

````objc
- (void)connection:(NSURLConnection *)connection   didSendBodyData:(NSInteger)bytesWritten
 totalBytesWritten:(NSInteger)totalBytesWritten
totalBytesExpectedToWrite:(NSInteger)totalBytesExpectedToWrite{
    ...
    ...

    //测试取消上传
    //if((totalBytesWritten*100 / totalBytesExpectedToWrite) > 50){[connection cancel];}
 }
````

测试当上传进度到50%的时候，取消文件上传。

请用大一点的图片进行测试，因为这段代码是有bug的，当文件太小不会进入这个委托方法。


## demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/network-demo)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处


## 参考阅读

-   [iOS原生文件上传](http://www.jianshu.com/p/4e768bc9503a)
-   [iOS开发网络篇—文件的上传](http://www.cnblogs.com/wendingding/p/3949966.html)
-   [自己动手写一个 iOS 网络请求库（四）——快速文件上传](https://lvwenhan.com/ios/457.html)
-   [Multipart/form-data POST文件上传详解](http://blog.csdn.net/xiaojianpitt/article/details/6856536)
-   [nodejs 文件上传/下载功能实现](http://hzxiaosheng.bitbucket.org/work/2014/03/09/download-and-upload-file-with-nodejs/)
-   [Node.js：文件上传简单demo](http://kirochen.com/2015/07/21/upload-demo-formidable/)