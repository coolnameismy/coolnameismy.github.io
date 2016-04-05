---
layout: post
title: handlerbars的使用及模板预编译
category: web前端
tags: web
keywords: handlerbars
description:
---

-   handlebars介绍
-   handlebars的用法
-   handlebars预编译


##  [handlebars](http://handlebarsjs.com) 介绍
---

handlebars是一款前端模板引擎，使用模板引擎的作用是，可以解决通过js拼接html的方式渲染页面的缺点。

主页：[handlebars](http://handlebarsjs.com)

##   quick example

````js

//导入库
<script src="../bower_components/jquery/jquery.min.js" type="text/javascript"></script>
<script src="../bower_components/handlebars/handlebars.js" type="text/javascript" charset="utf-8" ></script>

````

````html

<script id="demoTpl" type="text-x-handlebars-template">
	  { {#each this}}
        <div>
         <h1>  { {title} } </h1>
         <p> { {content} } </p>
        </div>
      { {/each}}
</script>

````

````js

   //示例数据
	var data = [
		{ "title":"aaa","content":"contentaaa"},
		{ "title":"aaa","content":"contentaaa"},
		{ "title":"aaa","content":"<h1>h1</h1>"},
		{ "title":"aaa","content":"contentaaa"}
	];

    //jquery初始化完成
	$(function(){
         //编译模板
		 var demoTpl = Handlebars.compile($("#demoTpl").html());
		 //获取渲染后的html内容
		 var html = demoTpl(data);
		 //渲染dom，目标为#content
		 $("#content").html(html)
	});

````


##  handlebars的用法
---

###  显示模板中的html

若数据中有html，如： ```` { "title":"aaa","content":"<h1>h1</h1>"} ```` 则模板绑定{{}}时会显示 ```` "<h1>h1</h1>" ```` 内容
使用三对大括号{{{ }}} 可以显示 html效果

### 	Block表达式

有时候当你需要对某条表达式进行更深入的操作时，Blocks就派上用场了，在Handlebars中，你可以在表达式后面跟随一个#号来表示Blocks，然后通过{{/表达式}}来结束Blocks。
如果当前的表达式是一个数组，则Handlebars会“自动展开数组”，并将Blocks的上下文设为数组中的元素。

````
<ul>  
{ {#programme}}
    <li>{ {language}}</li>
{ {/programme}}
</ul>  

````


````
//使用数据
{
  programme: [
    {language: "JavaScript"},
    {language: "HTML"},
    {language: "CSS"}
  ]
}

//结果
<ul>  
  <li>JavaScript</li>
  <li>HTML</li>
  <li>CSS</li>
</ul>  


````

###	 遍历

````
	  { {#each this}}
        <div>
         <h1>{ {title}}</h1>
         <p> { {content}}</p>
        </div>
      { {/each}}
````


考虑到这样一种情况，data中的数据直接就是数组，没有key。如：

````js

	var data1 = [
		 "a","b","c","d","e"
	];

````

那么模板怎么写？

答案是，用this关键字

````

	  { {#each this}}
        <div>
         <h1>{ {this}}</h1>
        </div>
      { {/each}}


````


###  if else,unless，with

````
{ {#if list}}
<ul id="list">  
    { {#each list}}
        <li>{ {this}}</li>
    { {/each}}
</ul>  
{ {else}}
    <p>{ {error}}</p>
{ {/if}}
````

unless和if意思正好相反，语法使用是相同的

with是判断属性是否存在，存在则绑定数据，不存在则不绑定

###   注释

````    { {! handlebars comments } }    ````

###   Path

````
. :子属性
../ :父属性
````


###  自定义helper

这个方法用来注册一些handlebars静态工具方法。


````js

//定义
Handlebars.registerHelper('methodName', function(para1,para2){
		//做的你工作
});

//调用
{ {methodName para1 para2} }

````

一次性也可以注入多个help

````
andlebars.registerHelper({
    fun1: function() {},
    fun2: function() {}
});
````

看例子吧：

````

    //数据
	var data2 = [
		{ "name":"liu1","age":30 },
		{ "name":"liu2","age":20 }
	];

	//模板
    <script id="demoTpl2" type="text-x-handlebars-template">

      { {#each this}}
        { {! 如果age大于25显示红色字体，否则显示绿色字体 }}
        <div>
            { {#if (lg age 25 class="green") }}
                <h1 style="background-color:red">{ {name}}</h1>
            { {else}}
                <h1 style="background-color:green">{ {name}}</h1>
            { {/if}}
        </div>
      { {/each}}

    </script>


````

下面写一个名叫lg的handlebars的helper方法

````js
        //比较数字大小
        Handlebars.registerHelper("lg",function(i,stand){
            if(i>stand) return true
            return false
		})
````

生成的demo

````html
<div id="content2">
    <div>
            <h1 style="background-color:red">liu1</h1>
    </div>
    <div>
            <h1 style="background-color:green">liu2</h1>
    </div>

</div>
````


###  hash参数

在helper方法内部，可以通过hash获取到方法的上下文参数，举个例子:

我们把上一节中的lg方法的参数，换成用hash获取


````
    //重写lg方法
    //比较数字大小1
    Handlebars.registerHelper("lg1",function(opts){
         console.log(opts.hash.source)
         console.log(opts.hash.target)
        //source是要比较的数据，target是对比的数据
        if(opts.hash.source>opts.hash.target) return true
        return false
    })

    //调用方法的模板
   { {#each this}}
    { {! 如果age大于25显示红色字体，否则显示绿色字体 }}
    <div>
        { {#if (lg1 source=age target=25) }}
            <h1 style="background-color:red">{ {name}}</h1>
        { {else}}
            <h1 style="background-color:green">{ {name}}</h1>
        { {/if}}
    </div>
  { {/each}}

````

可以看见，效果和上面的一模一样。本文demo中可以查看效果。



##  handlebars预编译
---

handlebars预编译依赖于handlebars插件，安装方式：

```` sudo npm install handlebars -g  ````

我们有的时候希望能把handlebars的模板文件单独抽取出来管理，可以写一个后缀为handlebars的文件，然后把模板写到文件中，例如：

````

  { {#each this}}
    <div>
     <h1>{ {title}}</h1>
     <p> { {content}}</p>
    </div>
  { {/each}}


````

之后我们通过命令，模板文件编译为handlebars js文件

```` handlebars demoList.handlebars -f  demoTpl.js ````

**这里顺便说一句，handlebars后缀名很长，我试过换一个简单的后缀，结果发现编译后就找不到模板了。所以后缀还是不能随便换**

执行后会在本文件夹生成一个js文件，接着我们在页面引入这个js

````js
//引入生成的js
<script src="../component/Tpl/demoList.js"></script>
````

最后将模板渲染到页面

````js

	var data = [
		{ "title":"aaa","content":"contentaaa"},
		{ "title":"aaa","content":"contentaaa"},
		{ "title":"aaa","content":"contentaaa"},
		{ "title":"aaa","content":"contentaaa"}
	];

	$(function(){
        //使用预编译的tpl ，demoList就是我们之前生成的模板js的文件名
        var html = Handlebars.templates.demoList(data)
        $("#content").html(html);
	});

````



##  demo

本文示例demo见 [demo-web](https://github.com/coolnameismy/demo-web)

文本的demo在文件夹Handlebars中

**使用方式**

*	Handlebars目录下执行````http-server -p 8080````
*	usage.html =》 handlerbars的使用及模板预编译
*	componentization.html =》 前端开发框架 - seajs+handlebars模块化开发



##  参考和其他资料

-   [handlebars实用教程](http://www.cnblogs.com/iyangyuan/archive/2013/12/12/3471227.html)
-   [极客标签视频教程](http://www.gbtags.com/gb/gbliblist/7.htm)
-   [Handlebars.js 模板引擎](http://caibaojian.com/handlebars-js.html)

##  最后

刘彦玮原创，转载请注明出处

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处

