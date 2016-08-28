---
layout: post
title: 那些好玩的nodejs插件 - 把图片转为ascii
category: web前端
tags: web
keywords:
description:
---

无意中发现了一个好玩的库 [image-to-ascii](https://github.com/IonicaBizau/image-to-ascii) 他的作用能把图片转为ascii，我们先看一下完成后的效果是不是很有趣，有趣就可以接着往下看了~~


![](https://camo.githubusercontent.com/9550c7af22c784d5ec26fcc5e07312f159bd3c1f/687474703a2f2f692e696d6775722e636f6d2f736a6f776b704c2e706e67)


![]({{site.url}}/assets/uploads/2015-12-31-playwith-imageToAscii-1.png)

![]({{site.url}}/assets/uploads/2015-12-31-playwith-imageToAscii-2.png)

![]({{site.url}}/assets/uploads/2015-12-31-playwith-imageToAscii-3.png)

![]({{site.url}}/assets/uploads/2015-12-31-playwith-imageToAscii-4.png)


很有意思吧？ 下面我们来看看怎么实现的，主要分为这几个步骤去说明：

##  配置环境，安装必要的插件

image-to-ascii 依赖于 [Graphics Magick](http://www.graphicsmagick.org/)，所以我们先安装[Graphics Magick](http://www.graphicsmagick.org/)

````
#  Ubuntu
$ sudo apt-get install graphicsmagick

#  Fedora
$ sudo dnf install GraphicsMagick

#  OS X
$ brew install graphicsmagick

#  Chocolatey (package manager for Windows)
#  (Restart of cmd/PowerShell is required)
$ choco install graphicsmagick

````

我的安装环境是mac，但是在[Graphics Magick](http://www.graphicsmagick.org/)的安装过程中出现了一些错误，后来我使用的是port才把这个graphicsmagick安装成功


````
port install graphicsmagick
````


安装graphicsmagick成功后，我们新建一个项目文件夹，名叫“imageToAscii”，再文件夹下终端使用npn创建一个项目

````
npm init
````

依次按提示输入项目的名称，版本，开源协议等等信息。


接着我们安装ImageToAscii

````
npm install image-to-ascii --save-dev
````

安装完成之后项目文件夹会多一个node_modules，里面存放相关依赖的node包


## 编写nodejs代码

项目根目录下创建一个文件，index.js，代码如下：

````js

//导入image-to-ascii 包
var ImageToAscii = require("image-to-ascii");
//配置一个图片的根路径
var __dirname = "./images/";

//调用image-to-ascii的方法，2个参数，第一个为图片的路径，第二个为完成后的输出。

ImageToAscii(__dirname + '2.jpg',function(err,converted){
	console.log(err || converted)
});

````

代码很简单，注意看我的注释。

## 调用nodejs，把图片打印成ascii

代码写完之后，我们打开终端，进入到项目的根目录，执行我们写的index.js代码

````
node index.js
````

![]({{site.url}}/assets/uploads/2015-12-31-playwith-imageToAscii-3.png)


是不是很简单？我们在吧对应的图片地址换成 3.jpg 或者4.jpg试试看其他图片的生成效果吧。当然，你也可以放入自己的图片玩一玩~

have fun ~


##  demo

本文示例demo见 [demo-web](https://github.com/coolnameismy/images-to-ascii)


##  最后


感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处







