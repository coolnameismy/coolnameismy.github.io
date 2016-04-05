---
layout: post
title: 深入理解unslider.js源码
category: web前端
tags: unslider,js
keywords:  unslider,js,jquery
description: 
---

> 最近用到了一个挺好用的幻灯片插件，叫做unslider.js,就想看看怎么实现幻灯片功能，就看看源码，顺便自己也学习学习。看完之后收获很多，这里和大家分享一下。

unslider.js 源码和使用教程可以在他[github](https://github.com/idiot/unslider)库 和[unslider官网](http://unslider.com/) 中找到

大纲

-   unslider.js使用
-   unslider.js库的代码结构
-   unslider.js库的实现
-   总结unslider.js源码中值得我们学习的点

代码下载:github库，对应此文章的目录是DeepIntoUnslider ,[点击跳转代码下载地址](https://github.com/coolnameismy/demo)

##  (一)unslider.js使用
---


unslider.js用起来很简单。



1.  引入juqery 和 unslider.js

		 <script type="text/javascript" src="js/jquery-1.10.1.min.js"> </script>
	     <script type="text/javascript" src="js/unslider.js"> </script>


2.  写html和css

		<div class="banner">
	        <ul >
	            <li style=" background-image: url(http://unslider.com/img/sunset.jpg);"></li>
	            <li style=" background-image: url(http://unslider.com/img/wood.jpg);"></li>
	            <li style="background-image: url(http://unslider.com/img/subway.jpg);"></li>
	            <li style="background-image: url(http://unslider.com/img/subway.jpg);"></li>
	        </ul>
	    </div>

    css 省略，可以看我的demo



3.  js初始化unslider

        $(function() {
                unslider = $('.banner').unslider({
                    speed: 500,               //  切换的速度
                    delay: 3000,              //  切换的速度
                    keys: true,               //  是否启用左右按钮控制slider切换
                    fluid: false,              // 是否每次在容器大小改变的时候，修正slider的大小
                    pause:true,                 //鼠标以上去是否暂停播放
                    starting:function(){        //每次开始切换时回叫方法
                        console.log("starting");
                    },
                    complete:function(){         //每次完成切换时回叫方法
                        console.log("complete");
                    },
                    arrows: true,               //  是否显示左右箭头，用于slider切换
                    dots: true                  //  是否显示白色圆点，用于slider切换
                });
         });


3.  unslider方法调用

		var data = unslider.data('unslider');

        // 开始
        data.start();

        // 暂停
        data.stop();

        //  切换至第n个 function是回调函数
        data.move(2, function() {});
        //  data.move(0);

 
        //  切换下一个
        data.next();

        // 切换上一个
        data.prev();

更多内容可以去[unslider官网](http://unslider.com/) 查看。

## （二） unslider.js库的代码结构
---

####    1.  先看Unslider内部实现的结构


        (function($, f) {
            var Unslider = function() {
                ...（第三部分讲）
            };

            //  Create a jQuery plugin
            $.fn.unslider = function(o) {
                ...（第二部分讲）
            };

            Unslider.version = "1.0.0";
        })(jQuery, false);


<br/>

    (function($, f) {})(jQuery, false);

这是js的匿名函数，匿名函数的调用。我们看个简单的

 (function(i){ console.log(i)})(10)

把它在浏览器里面执行以下，会打印出数字10.

方法的前半句   function(i){ console.log(i)}   是定义了一个匿名函数，后半句（10）是调用了这个匿名函数。

所以 (function($, f) {})(jQuery, false) 就是定义了这样2个参数的方法，第一个参数是jquery对象



        $.fn.unslider = function(o) {

         };

这个是jquery的方法扩展，执行这个方法后就可以使用： $('.banner').unslider(o) 的方式调用。o在unslider中就是你配置的各种参数

####    2. $.fn.unslider 的方法实现

        $.fn.unslider = function(o) {
                var len = this.length;
                return this.each(function(index) {
                    var me = $(this),
                            key = 'unslider' + (len > 1 ? '-' + ++index : ''),
                            instance = (new Unslider).init(me, o);
                me.data(key, instance).data('key', key);
            });
        };
        Unslider.version = "1.0.0";


**return this.each(function(index) {})**

$.each是jquery的遍历工具方法，每次会返回function中的内容。这里用each主要是因为$('.banner')对象是一个数组，这样可以把每一个.banner渲染为unslider，并且返回$('.banner')。

**Unslider.version = "1.0.0"; 只是给Unslider 增加了一个版本号的属性**


**me.data(key, instance).data('key', key)**

$.data方法是对dom元素数据的保存。 $.data(key)是取值，$.data(key,value)是赋值。

比如: ```` <div data-key="abc"></div>  ````  那么$("div").data("key")会返回”abc“。 $("div").data("key","newkey")会给key附上新值”newkey“。

但是请注意，dom元素上的data-key="abc"不会变化，不过下次再取key值时候，会返回”newkey“了

unslider用$.data缓存了unslider的实例，所以在调用unslider的方法时，先要 ````var data = unslider.data('unslider');````获取实例之后才调用方法。

多说一句：这里我不是很理解作者是怎么考虑的，作者让$.unslider方法返回一个jquery对象，而把实例缓存在$对象中。所以使用实例方法需要多一步转换。如果是我的话，我会直接让$.unslider返回unslider的实例，我会把
$.fn.unslider = function(o) {} 改成这样

    	$.fn.unslider = function(o) {
            var len = this.length,
                arr = [];
            Unslider.version = "1.0.0";

            this.each(function(index) {
                var me = $(this),
                    key = 'unslider' + (len > 1 ? '-' + ++index : ''),
                    instance = (new Unslider).init(me, o);
                arr.push(instance);
            });
            // if single,return instance ，else return array of instance
            if(arr.length==1) return arr[0];
            return arr;
    	};

####  3.  ```` var Unslider = function() {} ```` 内部方法结构

unsliders一共定义了8个对象，分别是：o,init,to,play,stop,next,perv,nav


**o：unslider的配置对象，我翻译并解释了一下**

        _.o = {
            speed: 500,     // 切换时候的运动速度,false是不进行切换 (integer or boolean)
            delay: 3000,    // 切换的时间间隔，false是不自动切换 (integer or boolean)
            init: 0,        // 初始化时候的延迟，false为不延迟 (integer or boolean)
            pause: !f,      // 鼠标移上去的时候是否需要暂停切换 默认值是yes(boolean)
            loop: !f,       // 是否循环切换 (boolean)
            keys: f,        // 快捷键 (boolean)
            dots: f,        // 是否显现 可以切换的控制点  (boolean)
            arrows: f,      // 是否显现 上一页下一页的箭头 (boolean)
            prev: '&larr;', // 上一页按钮的文字 (string)
            next: '&rarr;', // 下一页按钮的文字
            fluid: f,       // 是否是一个百分比的宽度（boolean)
            starting: f,    // 开始切换时的回叫函数 (function)
            complete: f,    // 切换完成时候的回叫函数 (function)
            items: '>ul',   // slides jquery选择容器的标签
            item: '>li',    // slides items 选择容器的标签
            easing: 'swing',// 动画运动的方式    swing 或者linear，这个是由jquery $(selector).animate(styles,speed,easing,callback) 方法提供的参数。
            autoplay: true  // 自动播放
        };


**init:unsliders的构造方法，通过对这个方法传入jquery对象和unsliders的构造参数，生成一个unsliders的实例**

**to:切换sliders的方法，是实现幻灯切换的核心方法**

**play:定时调用to方法，切换到下一个**

**stop:取消play的定时器**

**next:立刻切换到下一个**

**prev:立刻切换到上一个**

**nav:构造silders中间的点样式和点击切换，以及左右箭头切换上一张下一张**


这样看下去，整个unslider.js的整体结构就都已经看清了，后面主要说一下init方法和to方法。


##  （三）unslider.js库的实现
---
这里我只简单说说几个重要的方法，如果想看详细的每一步，可以打开[unsliders.zh-cn.js](https://github.com/coolnameismy/demo/blob/master/DeepIntoUnslider/js/unsliders.zh-cn.js)进行阅读，我对unslider.js的每一步的实现做了中文翻译，并添加了一些注释。

###  init方法：
init方法开始时候通过```` _.o = $.extend(_.o, o);````把你设定的unslider参数和默认参数进行了合并。$.extend参数有很多作用，后面还会说道。

接着修正了生成unslider容器的样式，构造dot和arrows（这两个东西主要是切换slider使用），开启了定时器调用play()方法

之后添加了一些扩展特性，都是通过option可配的。 1：对触摸屏左右滑动的支持（需要另外添加一个js文件。jquery.event.swipe.js）2：容器大小变化，修正slider的扩展 3：键盘左右控制unslider左右切换的支持

最后初始化完成之后，返回self

###  to方法：

**slider切换的原理**

slider是通过在ul中放置li，切换slider就是调整ulleft位置实现的。这样说还不是很明白，我来举个例子。

ul中有4个li，每个li的宽高是100px*100px ，那么就需要把ul的style设为{ height:100px;witdh:400px; position:relative;left:0px }

通过修改left这个css属性，left:0px 对应第一个li的位置，left=-100px对应第二个li的位置， left=-200px对应第三个li的位置，left=-300px对应第四个li的位置

在通过$.animate 方法修改left，这个slider切换就动了起来。


**to方法的实现**

首先刷新定时器。之后获取一大堆配置参数，比如使用设置了回调方法，切换时的速度，切换动画的方式（easing：swing 或者linear。这两个参数是jquery，animate方法的参数，运动方式会有区别，linear是线性匀速运动，swing是先，慢后快的运动。默认是swing，因为这种动画方式更自然）

最后执行切换slider的动画，并回执行切换完成的回调方法。

###  其他方法
其他方法基本上都是对to方法的调用，和定时器的控制。

         // 自动播放
        _.play = function() {
            _.t = setInterval(function() {
                _.to(_.i + 1);
            }, _.o.delay | 0);
        };

        // 停止自动播放
        _.stop = function() {
            _.t = clearInterval(_.t);
            return _;
        };

        //立刻切换下一张
        _.next = function() {
            return _.stop().to(_.i + 1);
        };

        //回到上一张
        _.prev = function() {
            return _.stop().to(_.i - 1);
        };

##  （四）总结unslider.js源码中值得我们学习的点
---

unslider有很多我们值得学习的地方。

###  1 标准js类库的写法

````(function($, f) {})(jQuery, false)````和 ````$.fn ````：通过这两个方法，把js类库中的变量私有化，不会和外部变量冲突，$.fn扩展方法使用，使类库的调用更优雅。

###  2 jquery工具函数的使用：

$.data ：缓存数据到jquery对象中

$.resize：监听容器尺寸变化

            // 解决自适应 当屏幕大小变化时，会进入方法，重新校正容器的宽度和高度。
            o.fluid && $(window).resize(function() {
                _.r && clearTimeout(_.r);

                _.r = setTimeout(function() {
                    var styl = {height: li.eq(_.i).outerHeight()},
                        width = el.outerWidth();

                    ul.css(styl);
                    styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
                    el.css(styl);
                    li.css({ width: width + 'px' });
                }, 50);
            }).resize();

-$.extend 用法。

(1)：jquery静态扩展对象。 例如 ```` $.extend({  test:function(){alert('test函数')}   }) ````执行后会增加一个 $.test方法

(2)：合并对象。 ```` -_.o = $.extend(_.o, o); ````

(3)：深层合并对象 ```` -_.o = $.extend(ture,_.o, o);```` 这个方法和上面的方法的区别在于，o的每个属性的属性是否合并。对于location，只有用这个方法，才会保留下location的city和state

        var obj = jQuery.extend( true,
             { name: "John", "location": { "city": "Boston" } },
             { last: "Resig", "location": { "state": "MA" } }
        );

-jquery.queue:

这里主要是函数队列的使用。可以定义一组队列，在实现方法串行调用的适合很有用。

        var FUNC=[
            function(){alert("方法1")},
            function(){alert("方法2")},
            function(){alert("方法3")},
            function(){alert("方法结束")}
        ];
        $(document).queue(FUNC);//存入队列，不指定队列名称时会设置默认名称为fx，并直接返回函数数组的第一个元素 alert("方法1")
        $(document).dequeue("fx");弹出队列第一个函数 ，会执行alert("方法2")  dequeue的时候必须指定队列名称
        $(document).queue("fx");//返回当前队列

        $(document).queue("q",FUNC);//存入队列，指定队列名称时不会返回函数数组的第一个元素
        $(document).dequeue("q");弹出队列第一个函数 ，会执行alert("方法1")
        $(document).queue("q");//返回当前队列


###  3 精炼的语法

        //连续赋值
        var me = $(this),
            key = 'unslider' + (len > 1 ? '-' + ++index : ''),
            instance = (new Unslider).init(me, o);

        //  && 代替if语句
         o.dots && nav('dot');

        //jquery的串行函数执行
        el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');


感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处
