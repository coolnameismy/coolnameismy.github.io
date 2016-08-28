---
layout: post
title: iOS动画和特效（六）swift动画库spring使用和代码拆解
category: iOS
tags:
description:
---

![](https://camo.githubusercontent.com/4b086bf363f44f96e9384c06fbfc36610a98f9d3/687474703a2f2f636c2e6c792f696d6167652f3031325230443352337832672f646f776e6c6f61642f737072696e677377696674322e6a7067)


##  table of content

* [spring介绍](#spring介绍)
* [简单介绍使用spring实现动画效果](#简单介绍使用spring实现动画效果)
* [spring代码拆解](#spring代码拆解)
    -   demo架构
    -   核心动画实现

##  spring介绍

 [spring](https://github.com/MengTo/Spring) 是一个基于swift写的动画库，是swift目前最常用的动画库 github6000+ 
 

###  spring优点：

  - 用简单的语法封装了ios UIView Animation的方法，使用起来减少了代码量
  - 添加了几种常见的动画效果如shake pop等动画
  - 支持直接在storyboard中通过配置加入动画效果


###  安装：

  - 手动安装：直接将项目中的spring文件夹拖入你的项目
  - pods：

````
    use_frameworks!
    pod 'Spring', :git => 'https://github.com/MengTo/Spring.git', :branch => 'swift2'
````

##  简单介绍使用spring实现动画效果

spring实现动画效果有2种方式，一种是在storyboard里面配置，我个人来说不喜欢这种方式，iOS开发不分前端后端，动画实现放在界面中其实维护起来容易出错，并且不利于代码重用，所以我就不介绍storyboard的实现方式，有兴趣的自己看spring主页。spring提供的demo里面，code和option弹出vc使用的就是storyboard配置的方式。

###  使用spring动画示例：

````swift
    
     //1：需要让view继承自SpringView
     var ballView: SpringView!

     //2：配置动画的运行参数
     ballView.animation = "Shake" //配置动画方式
     
     //配置运动曲线 这里类似于先慢后快的运动，除了原生的运动曲线外，Spring库还添加了许多自定义的运动曲线
     ballView.curve = "EaseOut" 

     //3：执行动画
     ballView.animate()

````

这样就动了起来，如图：

![]()


###  可选的配置参数

Animation：动画类型

````
    shake
    pop
    morph
    squeeze
    wobble
    swing
    flipX
    flipY
    fall
    squeezeLeft
    squeezeRight
    squeezeDown
    squeezeUp
    slideLeft
    slideRight
    slideDown
    slideUp
    fadeIn
    fadeOut
    fadeInLeft
    fadeInRight
    fadeInDown
    fadeInUp
    zoomIn
    zoomOut
    flash
````

Curve：运动曲线

````
    EaseIn,
    EaseOut,
    EaseInOut,
    Linear,
    Spring,
    EaseInSine,
    EaseOutSine,
    EaseInOutSine,
    EaseInQuad,
    EaseOutQuad,
    EaseInOutQuad,
    EaseInCubic,
    EaseOutCubic,
    EaseInOutCubic,
    EaseInQuart,
    EaseOutQuart,
    EaseInOutQuart,
    EaseInQuint,
    EaseOutQuint,
    EaseInOutQuint,
    EaseInExpo,
    EaseOutExpo,
    EaseInOutExpo,
    EaseInCirc,
    EaseOutCirc,
    EaseInOutCirc,
    EaseInBack,
    EaseOutBack,
    EaseInOutBack
````

Properties：属性

````
    force
    duration
    delay
    damping
    velocity
    repeatCount
    scale
    x
    y
    rotate

````

**注意，并不是所有的属性都可以同时设置使用的**


##  spring动画的实现-序

我们简单的看一下spring动画库中的代码文件。spring1.0.3版本，spring文件夹有30个文件，其中居然还存在一些基本没用的文件，还有些文件的作用我也没仔细看。这里主要分析下spring动画实现部分的代码，最核心的类只有就3个文件

````swift

//核心动画效果实现类
Spring

//UIView.animateWithDuration的动画的简单封装
SpringAnimation

//使用动画的入口类，本身继承自UIView，自己使用时可以通过继承SpringView，
//然后就可以使用spring动画特效，同时也支持Storyboard配置动画属性
SpringView

````

说实话个人觉得这个库写的很啰嗦，spring里面30个文件，正真核心的就3个。使用动画也很不方便，还得继承SpringView，这个算是侵入式的编程，就像java中strcts和spring的controller区别一样明显。要是我来写一个动画库，1个文件把动效封装一下就好了，用静态方法或是扩展方法都挺好，也不会去支持通过storyboard去配置动画。我真的会去写一个哦，计划16年写吧。15年还得更新更新babybluetooth蓝牙库。

虽然这么说spring框架，但其实他里面的动画效果和时间函数还是挺好的，作者好像就是设计师出生，里面每个特效的参数设置的极为合理。后面我来拆一拆它每一个动画效果和时间函数的实现。


## 动画效果实现
>   本文中把所有spring中的动画特效类型使用原生方法实现一次

动画效果有这些

````
    shake //晃动
    pop
    morph
    squeeze
    wobble
    swing
    flipX
    flipY
    fall
    squeezeLeft
    squeezeRight
    squeezeDown
    squeezeUp
    slideLeft
    slideRight
    slideDown
    slideUp
    fadeIn
    fadeOut
    fadeInLeft
    fadeInRight
    fadeInDown
    fadeInUp
    zoomIn
    zoomOut
    flash

````

这段介绍暂时忽略动画的时间函数，都已线性时间函数为例

###  shake

shake是一个关键帧动画，通过定义左右左右2次的数值变化实现晃动效果，这个效果使用原生代码实现如下

````swift

        let force = 1
        let duration = 0.7
        let delay = 0
        let repeatCount:Float = 1.0
        let timeFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionLinear)
        
        let animation = CAKeyframeAnimation()
        animation.keyPath = "position.x"
        animation.values = [0, 30*force, -30*force, 30*force, 0]
        animation.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
        animation.timingFunction =  timeFunction
        animation.duration = CFTimeInterval(duration)
        animation.additive = true
        animation.repeatCount = repeatCount
        animation.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
        ballView.layer.addAnimation(animation, forKey: "shake")

````

###  pop


````swift

   let force:Float = 1.0
        let duration = 0.7
        let delay = 0
        let repeatCount:Float = 1.0
        let timeFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionLinear)
      
        let animation = CAKeyframeAnimation()
        animation.keyPath = "transform.scale"
        animation.values = [0, 0.2 * force, -0.2 * force, 0.2 * force, 0]
        animation.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
        animation.timingFunction = timeFunction
        animation.duration = CFTimeInterval(duration)
        animation.additive = true
        animation.repeatCount = repeatCount
        animation.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
        view.layer.addAnimation(animation, forKey: "pop")

````

###  morph 

这个词中文应该是变形的意思，他是实现是做了x和y轴的scale变化

````swift

    let morphX = CAKeyframeAnimation()
    morphX.keyPath = "transform.scale.x"
    morphX.values = [1, 1.3*force, 0.7, 1.3*force, 1]
    morphX.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
    morphX.timingFunction = getTimingFunction(curve)
    morphX.duration = CFTimeInterval(duration)
    morphX.repeatCount = repeatCount
    morphX.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    layer.addAnimation(morphX, forKey: "morphX")

    let morphY = CAKeyframeAnimation()
    morphY.keyPath = "transform.scale.y"
    morphY.values = [1, 0.7, 1.3*force, 0.7, 1]
    morphY.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
    morphY.timingFunction = getTimingFunction(curve)
    morphY.duration = CFTimeInterval(duration)
    morphY.repeatCount = repeatCount
    morphY.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    layer.addAnimation(morphY, forKey: "morphY")

````

###  squeeze

挤压效果，这个效果和上面的很类似，只有x和y的scale参数不一样。注意这个force参数设置的位置还是很有讲究的

````swift
 //区别
 morphX.values = [1, 1.5*force, 0.5, 1.5*force, 1]
 morphY.values = [1, 0.5, 1, 0.5, 1]

````

###  wobble

摆动效果，实际上类似于shake并在shake中带一些旋转

````swift

    let animation = CAKeyframeAnimation()
    animation.keyPath = "transform.rotation"
    animation.values = [0, 0.3*force, -0.3*force, 0.3*force, 0]
    animation.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
    animation.duration = CFTimeInterval(duration)
    animation.additive = true
    animation.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    layer.addAnimation(animation, forKey: "wobble")

    let x = CAKeyframeAnimation()
    x.keyPath = "position.x"
    x.values = [0, 30*force, -30*force, 30*force, 0]
    x.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
    x.timingFunction = getTimingFunction(curve)
    x.duration = CFTimeInterval(duration)
    x.additive = true
    x.repeatCount = repeatCount
    x.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    layer.addAnimation(x, forKey: "x")

````

###  swing

这个词翻译过来也是摆动，我的英文也没那么好，不能给大家形象的解释swing和wobble区别。这里就当不同的摆动效果吧。spring中swing的摆动是只旋转

````swift

    let animation = CAKeyframeAnimation()
    animation.keyPath = "transform.rotation"
    animation.values = [0, 0.3*force, -0.3*force, 0.3*force, 0]
    animation.keyTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]
    animation.duration = CFTimeInterval(duration)
    animation.additive = true
    animation.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    layer.addAnimation(animation, forKey: "swing")

````

###  FlipX,FlipY

这两个动画是分别使用3D中x和y轴转换

````swift

    var perspective = CATransform3DIdentity
    perspective.m34 = -1.0 / layer.frame.size.width/2

    let animation = CABasicAnimation()
    animation.keyPath = "transform"
    animation.fromValue = NSValue(CATransform3D:
    CATransform3DMakeRotation(0, 0, 0, 0))

    //FlipX使用这句
    //animation.toValue = NSValue(CATransform3D:
        CATransform3DConcat(perspective,CATransform3DMakeRotation(CGFloat(M_PI), 0, 1, 0)))
    //FlipY使用这句
    animation.toValue = NSValue(CATransform3D:
    CATransform3DConcat(perspective,CATransform3DMakeRotation(CGFloat(M_PI), 1, 0, 0)))

    animation.duration = CFTimeInterval(duration)
    animation.beginTime = CACurrentMediaTime() + CFTimeInterval(delay)
    animation.timingFunction = getTimingFunction(curve)
    layer.addAnimation(animation, forKey: "3d")

````

###  fall

这个方法是使用animateWithDuration和CGAffineTransformMakeTranslation实现的,做了y轴下降和旋转

````swift

   UIView.animateWithDuration(NSTimeInterval(duration), delay: NSTimeInterval(delay), usingSpringWithDamping: damping, initialSpringVelocity: velocity, options: [.CurveLinear,.AllowUserInteraction], animations: { () -> Void in
            let translate = CGAffineTransformMakeTranslation(0, 300)
            let rotate = CGAffineTransformMakeRotation(15 * CGFloat(M_PI / 180))
            self.view.transform = CGAffineTransformConcat(translate, rotate)
        }, completion: nil)

````

###  squeezeLeft,squeezeRight,squeezeDown,squeezeUp,slideLeft,slideRight,slideDown,slideUp

这组方法是上下左右移动，slideLeft就是普通的移动，squeeze开头的会在移动中根据方向改变x或y的sacle，是效果更加逼真一些

````swift

 UIView.animateWithDuration(NSTimeInterval(duration), delay: NSTimeInterval(delay), usingSpringWithDamping: damping, initialSpringVelocity: velocity, options: [.CurveLinear,.AllowUserInteraction], animations: { () -> Void in
            let translate = CGAffineTransformMakeTranslation(100, 0)
            //slide开头就不需要scale效果
            let scale = CGAffineTransformMakeScale(0.8, 1)
            self.view.transform = CGAffineTransformConcat(translate, scale)
            }, completion: nil)

````

###  fadeIn，fadeOut，fadeInLeft，fadeInRight，fadeInDown，fadeInUp 

这组动画是淡入淡出效果。后面四个带方向的是淡入淡出时添加方向位移效果。代码不写了，都一样的东西，就比移动的动画代码增加了一个alpha属性的修改。这组动画任然使用animateWithDuration完成

###  zoomIn，zoomOut

方法缩小，但是在spring中附加了淡入淡出的效果。这个命名就和之前的不符合了，按照之前的方法命名习惯，这里应该分成4个方法，普通的和淡入淡出的版本
    

###  flash

就是repeat几次，fadeIn，fadeOut，fadeIn，fadeOut，好像在闪烁一样。这个效果spring根本没做好。

###  动画类型总结

基本动画类型就这么几种，关键帧动画，基本动画，CATransform3D和CATransform。整体来说spring的动画类型也没有很多，有的动画效果参数设置的还不错，有的动画也没做好，有很多优化的空间。


##  时间函数实现

spring动画库中扩充了原生时间函数的类型，原来只有EaseIn，EaseOut，EaseInOut，Linear四种。在spring中有很多很多种类，也有很多相似，名称也不知道如何翻译合适。我把所有的时间函数二次贝塞尔曲线画出来，大家自己看吧。

使用一个在线贝塞尔曲线查看工具：[cubic-bezier-tool](http://labs.pufen.net/cubic-bezier)

下方有个去曲线库，旁边点击导入，把下面的json导入进去。之后就可以选择每个曲线点击执行查看运动效果了，很方便。

````json

{
  "ease": ".25,.1,.25,1",
  "linear": "0,0,1,1",
  "ease-in": ".42,0,1,1",
  "ease-out": "0,0,.58,1",
  "ease-in-out": ".42,0,.58,1",
  "EaseInSine": "0.47, 0, 0.745, 0.715",
  "EaseOutSine": "0.39, 0.575, 0.565, 1",
  "EaseInOutSine": "0.445, 0.05, 0.55, 0.95",
  "EaseInQuad": "0.55, 0.085, 0.68, 0.53",
  "EaseOutQuad": "0.25, 0.46, 0.45, 0.94",
  "EaseInOutQuad": "0.455, 0.03, 0.515, 0.955",
  "EaseInCubic": "0.55, 0.055, 0.675, 0.19",
  "EaseOutCubic": "0.215, 0.61, 0.355, 1",
  "EaseInOutCubic": "0.645, 0.045, 0.355, 1",
  "EaseInQuart": "0.895, 0.03, 0.685, 0.22",
  "EaseOutQuart": "0.165, 0.84, 0.44, 1",
  "EaseInOutQuart": "0.77, 0, 0.175, 1",
  "EaseInQuint": "0.755, 0.05, 0.855, 0.06",
  "EaseOutQuint": "0.23, 1, 0.32, 1",
  "EaseInOutQuint": "0.86, 0, 0.07, 1",
  "EaseInExpo": "0.95, 0.05, 0.795, 0.035",
  "EaseOutExpo": "0.19, 1, 0.22, 1",
  "EaseInOutExpo": "1, 0, 0, 1",
  "EaseInCirc": "0.6, 0.04, 0.98, 0.335",
  "EaseOutCirc": "0.075, 0.82, 0.165, 1",
  "EaseInOutCirc": "0.785, 0.135, 0.15, 0.86",
  "EaseInBack": "0.6, -0.28, 0.735, 0.045",
  "EaseOutBack": "0.175, 0.885, 0.32, 1.275",
  "EaseInOutBack": "0.68, -0.55, 0.265, 1.55"
}

````

所有时间曲线的函数图如下

![]({{site.url}}/assets/uploads/springsCAMediaTimingFunction.png)


##  spring library中我们能学到的内容总结

-   最值得我们学习的地方：spring中定义的各种动画效果和时间函数的实现，所有不是全都很有用，但是还是有很多好用的地方
-   demo里面有很多细节，比如modal页面中presention和presenting的交互，通过````UIApplication.sharedApplication().sendAction("minimizeView:", to: nil, from: self, forEvent: nil)```` 和委托实现
-   其他还有很多细节，自己看源码去吧



##  最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处
