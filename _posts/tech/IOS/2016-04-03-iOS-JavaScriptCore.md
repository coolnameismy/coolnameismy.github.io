---
layout: post
title: iOS JavaScriptCore使用
category: iOS
tags:
keywords:
description:
---

JavaScriptCore是iOS7引入的新功能，JavaScriptCore可以理解为一个浏览器的运行内核，使用JavaScriptCore可以使用native代码（这里主要指objectiveC和swift）与js代码进行相互的调用，本文主要从几个方面进行了解。

-	native调用js代码
-	js调用native代码
-	异常处理
-	JavaScriptCore和webView的结合使用

要使用JavaScriptCore，首先我们需要引入它的头文件 ` #import <JavaScriptCore/JavaScriptCore.h> `

这个头里面引入了几个重要的对象 

````
#import "JSContext.h"
#import "JSValue.h"
#import "JSManagedValue.h"
#import "JSVirtualMachine.h"
#import "JSExport.h"
````

-	JSContext是JavaScript的运行上下文，他主要作用是执行js代码和注册native方法接口
-	JSValue是JSContext执行后的返回结果，他可以是任何js类型（比如基本数据类型和函数类型，对象类型等），并且都有对象的方法转换为native对象。
-	JSManagedValue是JSValue的封装，用它可以解决js和原声代码之间循环引用的问题
-	JSVirtualMachine 管理JS运行时和管理js暴露的native对象的内存
-	JSExport是一个协议，通过实现它可以完成把一个native对象暴漏给js

##  native调用js代码

先看下面常见的三种情况，之间执行js代码、执行文件或网络中的js代码、注册js方法再利用JSValue调用

````objc
//直接执行js代码
- (void)evaluateScript {
    //定义一个js并执行函数
    JSValue *exeFunction1 = [self.jsContext evaluateScript:@"function hi(){ return 'hi' }; hi()"];
    //执行一个闭包js
    JSValue *exeFunction2 = [self.jsContext evaluateScript:@"(function(){ return 'hi' })()"];
}

//执行一段js文件中的代码
//更多的应用场景使用网络或者本地文件加载一段js代码，充分利用其灵活性
- (void)evaluateScriptFromJSFile {
    NSString * path = [[NSBundle mainBundle] pathForResource:@"core" ofType:@"js"];
    NSString * html = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
    JSValue *constructor = [self.jsContext evaluateScript:html];
}

//注册js方法，然后在利用JSValue调用
- (void)regiestJSFunction {
    //注册一个函数
    [self.jsContext evaluateScript:@"var hello = function(){ return 'hello' }"];
    //调用
    JSValue *value1 = [self.jsContext evaluateScript:@"hello()"];
    
    //注册一个匿名函数
    JSValue *jsFunction = [self.jsContext evaluateScript:@" (function(){ return 'hello objc' })"];
    //调用
    JSValue *value2 = [jsFunction callWithArguments:nil];
}

```` 

这里有几个重要的地方需要说明。

###  jsContext执行evaluateScript方法后的返回值类型

对于native来说，返回的类型都是JSValue，这是Native对js执行对象的统一封装类型，实际上他对应的js类型不同会导致它的使用方法也不相同，常见的类型比如返回数值类型和返回一个函数。

如果是返回数值类型，JSValue也对应了一组转换的API可以把JSValue转换成任何对于的native对象，例如：

````objc
- (NSArray *)toArray;
- (NSDictionary *)toDictionary;
- (NSDate *)toDate;
- (NSString *)toString;
- (NSNumber *)toNumber;
- (uint32_t)toUInt32;
- (id)toObject;
... 还有很多就不一一列举
````

如果返回的是一个函数类型，这可以使用 ` jsvalue callWithArguments `方法进行js函数调用，例如：

````objc
   //注册一个匿名函数
    JSValue *jsFunction = [self.jsContext evaluateScript:@" (function() { return 'hello objc' })"];
    //调用
    JSValue *value2 = [jsFunction callWithArguments:nil];
````

js是非常美妙的，主要这里的js是一段闭包代码，主要看下面两段代码的区别

````js
(function() { return 'hello objc' })
function() { return 'hello objc' }
````

第一行是一个闭包，在js中执行这段代码会返回一个函数，而第二行是定义一个函数，执行第二行的结果是定义了一个匿名函数，但是执行结果无返回值。

所以执行下面这段代码时省略了`()`，那么jsFunction的值就会为空了，很多移动端研发工程师不熟悉js代码很容易出现这样的错误。

````
   JSValue *jsFunction = [self.jsContext evaluateScript:@" (function() { return 'hello objc' })"];
````

当然如果我们在运行时中定义一个函数，后面也是可以调用的，只是不是使用callWithArguments方法了，示例如下：

````objc
 [self.jsContext evaluateScript:@"var hello = function(){ return 'hello' }"];
  JSValue *value1 = [self.jsContext evaluateScript:@"hello()"];
````

执行后的结果就是value1或得到一个string类型的值：“hello”


##  js调用native代码

js调用native代码之前需要native先注册接口，使用jsContext["方法名"]就可以注册，后面是一个闭包，闭包可以定义函数参数，也可以使用 `[JSContext currentArguments]` 方法获取到所有函数调用的参数

看一段例子：

````objc
//注册js方法给Native调用
- (void)regiestNativeFunction {
    //注册一个objc方法给js调用
    self.jsContext[@"log"] = ^(NSString *msg){
        NSLog(@"js:msg:%@",msg);
    };
    //另一种方式，利用currentArguments获取参数
    self.jsContext[@"log"] = ^() {
        NSArray *args = [JSContext currentArguments];
        for (id obj in args) { NSLog(@"%@",obj); }
    };
    
    //使用js调用objc
    [self.jsContext evaluateScript:@"log('hello,i am js side')"];
}
````

block使用仍然需要注意循环引用的问题，所以在block中可以使用JSContext的静态方法 ` + (JSContext *)currentContext ` 获取到context 

初次之外，JSContext还可以获取到更多的内容，比如：

````
currentCallee
currentThis
currentArguments
globalObject
````

callee和this都是js中的对象，callee简单的说就是调用函数的对象，this类似于native中的self。

当然，jsContext中下标不仅仅可以放函数，也可以放对象和数值，对于熟悉js代码的人也不会觉得奇怪，因为js中基本上不太区分对象，函数的概念，对象和函数都是一样的东西。

除了使用jsContext下标方法暴露js对象以外，还可以使用JSExprot协议去把objc复杂对象转换成JSValue并暴露给js对象

###  JSExport对象的用法

1: 首先自定义个协议继承自JSExprot，并定义需要暴露给js的属性和方法，比如：

````objc
@protocol JSPersonProtocol <JSExport>

@property (nonatomic, copy) NSDictionary *data;
- (NSString *)whatYouName;

@end
````

2: 新建一个native对象，实现协议和方法,比如：

.h

````objc
@interface Person : NSObject<JSPersonProtocol>

@property (nonatomic, copy)NSString *name;
- (NSString *)whatYouName;

@end

````

.m

````objc
#import "Person.h"

@implementation Person

-(NSString *)whatYouName {
    return @"my name is liuyanwei";
}

-(NSString *)name {
    return @"liuyanwei";
}

@end
````

使用

````objc
- (void)useJSExprot {
    Person *p = [[Person alloc]init];
    self.jsContext[@"person"] = p;
    JSValue *value = [self.jsContext evaluateScript:@"person.whatYouName()"];
}
````

执行后的结果就是，value的值为：my name is liuyanwei

##  异常处理

````objc
//注册js错误处理
- (void)jsExceptionHandler {
    self.jsContext.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"%@", exception);
        con.exception = exception;
    };
}
````

##  JavaScriptCore和UIWebView的结合使用

上面的代码都是基于JSContext的，如果声明了一个UIWebView，也可以使用UIWebView获取到JSContext对象，就可以使用JavaScriptCore的Api了，在UIWebView中获取JSContext的方法是：

````objc
 JSContext *context=[webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
````

不过遗憾的是WKWebView目前我还没有找到获取JSContext的方法，如果有知道的朋友也希望能联系我。


##  JSVirtualMachine

在创建jscontext的时候，可以传入一个JSVirtualMachine对象，如果没有传入这个对象，会新建一个JSVirtualMachine对象。

JSVirtualMachine主要有3个作用：

1: 支持js并发，多个VM之间的js操作是并发的
1：使用JSVirtualMachine初始化的多个context，可以共享jsvalue对象
2：解决循环引用问题

````
注意，当我们 export 一个 OC 或 Swift object 到 JS 中时，不能在这个object 中存储对应的 JS values。这种行为会导致一个retain cycle，JSValue objects 持有他们对应的 JSContext 的强引用，JSContext 则持有export到JS的native object的强引用，即 native object(OC or Swift object) —> JSValue —> JSContext —> native object
````


##  参考

- [JavaScriptCore学习之JavaScriptCore](http://blog.csdn.net/colorapp/article/details/51059645)
- [iOS7新JavaScriptCore框架入门介绍](http://blog.iderzheng.com/introduction-to-ios7-javascriptcore-framework/)
##  demo

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/JavaScriptCore)

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处