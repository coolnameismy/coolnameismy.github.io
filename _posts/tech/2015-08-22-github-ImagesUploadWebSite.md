---
layout: post
title: 自己markdown博客的图床程序
category: 技术
tags: tomcat
keywords: tomcat 
description:
---

> 自己的博客是使用jekyll搭在github上的，但是图片却必须找图床，很麻烦。所以自己在网站找了一个图床，改了一改，增加了上传成功后的markdown图片引用代码段，并整理后放到了github上
---

##  ImagesUploadWebSite
jumppo图床网站，基于html5和php。

地址：[https://github.com/coolnameismy/ImagesUploadWebSite](https://github.com/coolnameismy/ImagesUploadWebSite)



##  介绍
---
这个一个基于html5和php的一个图床网站，根据Martin Angelov写的HTML5 File Uploads with jQuery项目修改而成。

[HTML5 File Uploads with jQuery](http://tutorialzine.com/2011/09/html5-file-upload-jquery-php/) 发布于2011年9月26日，
本项目在它的基础上修改了界面，修改了上传成功的返回值类型（图片名、地址、html标签和markdowm标签）等等，后续还会继续增加功能


##  ImagesUploadWebSite功能
---
1. 拖拽图片上传
2. 图片上传后返回值多种类型

        图片名称：a.jpeg
        图片地址：images.jumppo.com/uploads/a.jpeg
        html：<img src=images.jumppo.com/uploads/a.jpeg/>
        markdown：![](images.jumppo.com/uploads/a.jpeg)

##  demo地址 [http://imagesdemo.jumppo.com/](http://imagesdemo.jumppo.com/)
---
> 说明：demo程序仅供演示，请不要作为图床使用，上传的图片会定期自动清理。

![]({{site.url}}/assets/uploads/imagesUploadWebsite0.png)
![]({{site.url}}/assets/uploads/imagesUploadWebsite.png)


#   如何使用
---
1. 搭建一个php宿主网站，代码下载后放入宿主网站
2. 打开根目录下的config.js文件，修改配置

#   常见问题
---
-	图片上传后打开401错误：请提高文件夹权限后应用程序的权限，比如我用iis搭的php，我通过给web设置连接用户为administor解决的。


##  后续准备增加的功能
---

-   用户权限设置
-   批量上传后点击图片，可以显示每个图片的上传信息
-   用户登录后查看自己的图片列表
-   用户上传图片可以指定文件夹



