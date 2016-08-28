---
layout: post
title: iOS动画和特效（五）layer隐式动画
category: iOS
tags:
description:
---

每个UIView都有一个layer属性，它的类型是CALayer，属于QuartzCore框架。CALayer本身并不包含在UIKit中，它不能响应事件。由于CALayer在设计之初就考虑它的动画操作功能，CALayer很多属性在修改时都能形成动画效果，这种属性称为“隐式动画属性”。
对每个UIView的非root layer对象属性进行修改时，都存在隐式动画。

CALayer常用的属性

![]({{site.url}}/assets/uploads/layerProperty.png)

**注意点**
-   CALayer中很少使用frame属性，因为frame本身不支持动画效果，通常使用bounds和position代替
-   CALayer中透明度使用opacity表示而不是alpha；中心点使用position表示而不是center



##   一个简单的layer动画示例：


````swift

        //运动的layer
        myLayer = CALayer()
        myLayer.frame = CGRect(x: 10, y: 200, width: 100, height: 100)
        myLayer.backgroundColor = UIColor.redColor().CGColor
        view.layer.addSublayer(self.myLayer)

        //layer每次点击像右下移动一些，如果超过范围则x从头开始
        func view1Clicked(tapGesture:UITapGestureRecognizer){

            self.myLayer.backgroundColor = UIColor.greenColor().CGColor
            self.myLayer.opacity = 0.5
            var moveToPoint  = CGPoint(x: myLayer.position.x + 50, y: myLayer.position.y + 50)
            if(moveToPoint.x > view.frame.size.width) { moveToPoint.x -= view.frame.size.width}
            if(moveToPoint.y > view.frame.size.height) { moveToPoint.y -= view.frame.size.height}
            self.myLayer.position = moveToPoint
        }

````

##  CATransaction
>   layer隐式动画实际上是自动执行了CATransaction，通过begin和commit进行入栈和出栈，并再run loop中执行一次0.25秒的隐式动画。通过CATranscation可以控制隐式动画的行为.UIView的begin-》commit动画底层也是使用CATranscation实现的。

修改隐式动画的执行时间，从默认0.25秒改为1秒

````swift

    func view1Clicked(tapGesture:UITapGestureRecognizer){

        CATransaction.begin()
        CATransaction.setAnimationDuration(2)
        self.myLayer.backgroundColor = UIColor.greenColor().CGColor
        self.myLayer.opacity = 0.5
        var moveToPoint  = CGPoint(x: myLayer.position.x + 50, y: myLayer.position.y + 50)
        if(moveToPoint.x > view.frame.size.width) { moveToPoint.x -= view.frame.size.width}
        if(moveToPoint.y > view.frame.size.height) { moveToPoint.y -= view.frame.size.height}
        self.myLayer.position = moveToPoint
        CATransaction.commit()
    }

````

代码和之前的也都差不多，只是多了这么几句,手动设置了CATranscation

````swift

        CATransaction.begin()
        CATransaction.setAnimationDuration(1)

        ...
        ...

        CATransaction.commit()

````

##  CATransaction的常见参数设置

设置动画执行时间

````swift

    CATransaction.setAnimationDuration(1)

````

关闭隐式动画,这句话必须放在修改属性之前

````swift

     CATransaction.setDisableActions(true)

````

设置动画完成后的回调

````swift
        CATransaction.setCompletionBlock { () -> Void in
            NSLog("Animation complete")
        }
````


##  动画的暂停与继续

效果可以看demo，启动后点击uiview，会先移动0.2秒后停顿0.5秒后继续执行

````swift

    //动画暂停
    func pause(){
        let interval =  myLayer.convertTime(CACurrentMediaTime(), fromLayer: nil)
        myLayer.timeOffset = interval
        myLayer.speed = 0
    }

    //动画继续
    func resume(){
        let interval = CACurrentMediaTime() - myLayer.timeOffset
        myLayer.timeOffset = 0
        myLayer.beginTime = interval
        myLayer.speed = 1
    }


````

##  demo
---



[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/AnimationAndEffects)

本文的代码对于的文件夹/ControllerTransitioning

- ImplicitAnimationViewController.swift:隐式动画

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处

##  推荐的相关文章

[Layer 中自定义属性的动画](http://www.objccn.io/issue-12-2/)
[iOS开发之让你的应用“动”起来](http://www.cocoachina.com/ios/20141022/10005.html)