---
layout: post
title: 前端开发框架 - seajs+handlebars模块化开发
category: web前端
tags: web
keywords: handlerbars
description:
---

本文介绍seajs和hanlebars，并实现前端控件组件化.

我想实现的是把组件单独一个文件夹，js和css，html都放在文件夹中，要使用组件的页面利用seajs引入组件，并直接调用组件的方法或者事件。这个方案是自己的思考，欢迎大家拍砖。

##  主要演员 seajs 和 handlebars

**seajs** 是一个前端模块化js库，作用类似于requirejs，都用来前端js的模块化和按需依赖加载的工作。功能都差不多，seajs是淘宝玉伯开发的，国产，所以国内使用者比较多，requirejs国外的，存在时间比seajs要久许多，国外用的比较多。
两者最大的区别在于定义模块的语法不同，一个是AMD规范，一个是CMD规范。seajs是CMD规范，所以他的语法更像nodejs，写起来会比requirejs优雅一些。不过缺点也很多，比如很多第三方库都是按照AMD规范写的，会有兼容性问题，就需要自己改写模块或者使用spm工具处理。

*[handlebars](http://liuyanwei.jumppo.com/2015/12/03/fe-js-handlebars.html)* 是一个前端js模板引擎 我在之前的文章介绍过handlebars及简单的用法，大家可以去看下 [点我](http://liuyanwei.jumppo.com/2015/12/03/fe-js-handlebars.html)



##  任务1，页面框架配置，seajs初始化

新建html页面，引入需要的类库

seajs用于做js模块管理，seajs-text可以用于加载handlebars的模板内容

````html
	<script type="text/javascript"  src="bower_components/seajs/dist/sea.js"></script>
	<script type="text/javascript" src="bower_components/seajs-text/seajs-text-1.1.1/dist/seajs-text.js"></script>
````



配置seajs


````js
 <script type="text/javascript">

	//basePath由服务端配置域名
	var basePath = "http://localhost:8080/app/";

 	// seajs 的简单配置
 	seajs.config({
 	  base: basePath,
 	  alias: {
 	    "jquery": "../bower_components/jquery/jquery.seejs.min.js",
 	    "handlebars":"../bower_components/handlebars/handlebars.seajs.min.js"
 	  }
 	});

 	// 加载入口模块
 	seajs.use("./scripts/seajs+handlebars.js");
 </script>
 ````


注意，jquery默认是不支持AMD标准，也不支持seajs，所以这里用的````jquery.seejs.min.js 和 handlebars.seajs.min.js ```` 都是自己手动改过的，jquery修改的方法就是在源码中级加上几行代码，如下：

````js
define(function(){
    //jquery源代码写在中间

    return $.noConflict();
});

````

handlebars修改比jquery少了那句````  return $.noConflict(); ```` 就可以了。

basePath可以根据实际环境设置。使用alias设置别名后，就可以在sea中使用 ````require()````的方法获取到源码

````    seajs.use("./scripts/seajs+handlebars.js"); ````   设置了页面的js入口


##  入口seajs+handlebars.js

````
// 所有模块都通过 define 来定义
define(function(require, exports, module) {

	$(function(){
		var Handlebars = require('handlebars');
		var tpl = require("./data.tpl");
    	var demoTplc = Handlebars.compile(tpl);
    	$("body").html( demoTplc("hello world"));
	});
});
````

data.tpl

````
 <h1>{ {this} }</h1>
````


加载Handlebars和tpl模板，然后直接调用Handlebars.compile进行模板编译后渲染dom。执行后bady的内容就变成了hello world。大家可以下载demo，打开seajs+handlebars.html看下效果


##  组件化方案

之前的代码可以完成用seajs动态加载handlebars模板并渲染的功能，但并没有实现组件化。现在我们来实现组件的封装。首先建立一个文件夹，包括

````
components
    - Boxes
        -index.js  //js代码处理数据和事件
        -index.css //boxes样式
        -boxes.tpl //boxes html模板
````

里面的内容作为demo，我写的简单一些。

boxes.tpl

````html
<div class="c-boxes">
	<h1>this is a boxes!</h1>
	<p>{ {this} }</p>
</div>
````

index.css

````css
.c-boxes{ background-color: red;}
.c-boxes h1{color:blue;}
````

index.js

````js
define(function(require, exports, module) {
	var Handlebars = require('handlebars');
	var box  = {
		init:function(){
			return box;
		},
		clicked:function(){},
		render:function($dom,data){
			var tpl = require('./boxes.tpl');
	    	var tplc = Handlebars.compile(tpl);
	    	// var _clicked = clicked;
	    	$dom.html(tplc(data));
	    	box.$dom = $dom;
	    	$dom.click(function() {
	    	  box.clicked && box.clicked();
	    	});
		}
	};
	module.exports = box;
});
````

index.js稍微复杂一些，封装了一个对象，并定义了对象的点击事件的外部接口。 ```` rander ```` 方法使用了前面相似的方式，渲染了bandlerbars模板，并注入点击事件

这样一个组件就已经封装好了。

##  组件的使用

前面定义了一个boxes组件，现在我们来使用他.html页面和之前的页面是一样的，唯一的区别是入口js换成了 ```` componentization.js ````

componentization.js

````js
define(function(require, exports, module) {

	// 通过 require 引入依赖
	var $ = require('jquery');
	var Boxes = require('boxes');

	$(function(){
        //实例化组件
		var box = Boxes.init();
		box.render($("body"),"hello world!");
		box.clicked = function(){
			console.log("clicked");
		};
	});

});

````

box定义好后，使用起来非常简单，直接调用 ```` box.render() ```` 方法就可以了，也顺带个box绑定了点击事件，效果可以看demo中的 componentization.html 页面

##  组件化其他的思考

组件的模板和js都通过seajs加载和封装了，唯一遗憾的是css需要单独引入。 seajs也有css引入的插件sea-css，但是试了一下没成功。 所以我的解决方案是使用gulp完成，遍历component下的所有css文件，组合成并压缩成一个css，然后再使用的页面中统一引用这个合并的css

具体gulp脚本

````
//css components 组合 构建任务
gulp.task('css-concat', function () {

    gulp.src(css_components_Src)
        .pipe(concat('allComponent.css'))//合并后的文件名
        .pipe(gulp.dest(cssDst));
});

````



##  demo

本文示例demo见 [demo-web](https://github.com/coolnameismy/demo-web)

文本的demo在文件夹Handlebars中

**使用方式**

*	Handlebars目录下执行````http-server -p 8080````
*	usage.html =》 handlerbars的使用及模板预编译
*	componentization.html =》 前端开发框架 - seajs+handlebars模块化开发

**错误处理**

如果本地没有http-server命令，请安装nodejs环境，并通过npm安装 http-server 命令：```` npm install -g http-server ````

##  参考和其他资料

-   [handlerbars的使用及模板预编译](http://liuyanwei.jumppo.com/2015/12/03/fe-js-handlebars.html)
-   [Hello Sea.js](http://island205.com/HelloSea.js/)
-   [handlebars实用教程](http://www.cnblogs.com/iyangyuan/archive/2013/12/12/3471227.html)
-   [极客标签视频教程](http://www.gbtags.com/gb/gbliblist/7.htm)
-   [Handlebars.js 模板引擎](http://caibaojian.com/handlebars-js.html)


## 最后


刘彦玮原创，转载请注明出处

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处







