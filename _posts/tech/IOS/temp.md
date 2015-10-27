---
layout: post
title: iOS动画和特性（一）
category: 技术
tags:
description:
---


## 一个简单的例子作为iOS动画系类的开始 QuickExampleViewController
---
>   UIView的方法中有几个易用的静态方法可以做出动画效果，分别是UIView.beginAnimations() ->  UIView.commitAnimations() 和UIView.animateWithDuration()方法
>   我们以一个UIView，每点击一次向右移动100，变色，加速运动这个简单的动效作为例子。


使用UIView.beginAnimations() ->  UIView.commitAnimations()实现
````swift

        //开始动画配置
        UIView.beginAnimations("view1Animation", context: nil)
        //运动时间
        UIView.setAnimationDuration(0.2)
        //设置运动开始和结束的委托 animationDidStart and animationDidStop
        UIView.setAnimationDelegate(self)
        /*
            缓动方式
            EaseInOut // slow at beginning and end
            EaseIn // slow at beginning
            EaseOut // slow at end
            Linear
        */
        UIView.setAnimationCurve(.EaseIn)
        //位置运动
        theView.frame = CGRect(x: theView.frame.origin.x+100, y: theView.frame.origin.y, width: theView.frame.size.width, height: theView.frame.height)
        //颜色渐变
        theView.backgroundColor = UIColor.greenColor()
        //透明度渐变
        theView.alpha = 0.5
        //动画开始
        UIView.commitAnimations()

````

使用跟简单的和UIView.animateWithDuration()实现
````swift

    UIView.animateWithDuration(0.2, delay: 0.5, options: UIViewAnimationOptions.CurveEaseIn, animations: { () -> Void in
                //位置运动
                theView.frame = CGRect(x: theView.frame.origin.x+100, y: theView.frame.origin.y, width: theView.frame.size.width, height: theView.frame.height)
                //颜色渐变
                theView.backgroundColor = UIColor.greenColor()
                //透明度渐变
                theView.alpha = 0.5
            }) { (isCompletion) -> Void in
                NSLog("completion")
        }

````

animateWithDuration的方法有4个从载方法，参数不同，根据需要调用。其中最后一个代理一个阻尼系数和回弹系数，使用他可以做出更加逼真的运动效果

````swift
     //usingSpringWithDamping 阻尼，范围0-1，阻尼越接近于0，弹性效果越明显
     UIView.animateWithDuration(0.2, delay: 0, usingSpringWithDamping: 0.9, initialSpringVelocity: 1, options: UIViewAnimationOptions.CurveEaseIn, animations: { () -> Void in
         theView.frame = CGRect(x: theView.frame.origin.x+100, y: theView.frame.origin.y, width: theView.frame.size.width, height: theView.frame.height)
        }, completion: nil)
````


本节介绍的几个方法，已经可以做出许多的简单动画效果了，这说明apple对高级别对象的动画api封装做的很不错。代码见QuickExampleViewController.swift


## Core Animation的类图
---

![](http://www.cocoachina.com/cms/uploads/allimg/141022/4196_141022102913_1.png)

CAAnimation：核心动画的基础类，不能直接使用，负责动画运行时间、速度的控制，本身实现了CAMediaTiming协议。

CAPropertyAnimation：属性动画的基类（通过属性进行动画设置，注意是可动画属性），不能直接使用。

CAAnimationGroup：动画组，动画组是一种组合模式设计，可以通过动画组来进行所有动画行为的统一控制，组中所有动画效果可以并发执行。

CATransition：转场动画，主要通过滤镜进行动画效果设置。

CABasicAnimation：基础动画，通过属性修改进行动画参数控制，只有初始状态和结束状态。

CAKeyframeAnimation：关键帧动画，同样是通过属性进行动画参数控制，但是同基础动画不同的是它可以有多个状态控制。


## 基本动画 CABasicAnimation
---
>  还记得上一节简单的动画吗，一个uiview向左平移100，这节我们使用CABasicAnimation实现相同的效果

````swift

            let baseAnimation = CABasicAnimation(keyPath: "position")
            //baseAnimation.fromValue 初始位置，如果不设就是当前位置
//          let point = CGPoint(x: theView.layer.position.x+100, y: theView.layer.position.y)
//          baseA baseAnimation.toValue = NSValue(CGPoint:point)nimation.toValue = NSValue(CGPoint:point)//绝对位置
            baseAnimation.byValue = NSValue(CGPoint:CGPoint(x: 100, y: 0))//相对位置

            //动画其他属性
            baseAnimation.duration = 0.2
            baseAnimation.repeatCount = 1
            baseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseIn)//加速运动

            //这两个属性若不设置，动画执行后回复位
            baseAnimation.removedOnCompletion = false
            baseAnimation.fillMode = kCAFillModeForwards

            //可以在动画中缓存一些
            //baseAnimation.setValue(NSValue(CGPoint: point), forKey: "startPoint")
            //开始动画
            theView.layer.addAnimation(baseAnimation, forKey: "theViewMoveRight100")
````


### CABasicAnimation注意点

使用上面的代码之后，发现点击之后view确实向右移动了100，但是再次点击红色区域却发现不会继续移动了，但是点击移动前view所在位置,红色区域会重复移动，如图
(示意图)[]

出现这种现象的原因是因为动画是通过view的layer设置位置的。而设置layer的位置后，uiview的位置是不会发生变化的，所以虽然看见红色移动了，但其实红色view.frame没变化，所以点击区域也没变化。那么如何解决？

解决的思路是在每次动画结束后，把view.frame的位置重新设置成移动后的位置。代码如下：

````swift
//步骤1，设置动画的委托
 baseAnimation.delegate = self

//步骤2：将移动后的点和要移动的view放入baseAnimation的context
baseAnimation.setValue(NSValue(CGPoint: endPoint), forKey: "endPoint")
baseAnimation.setValue(theView, forKey: "sender")

//步骤3：重写animationDidStop，重新设置center
override func animationDidStop(anim:CAAnimation, finished flag: Bool) {
    let endPoint = anim.valueForKey("endPoint")?.CGPointValue
    let theView = anim.valueForKey("sender") as! UIView
    //通过layer移动的位置是中心点的位置，所以设置中心点就对了
    theView.center = endPoint!
}

````



其他注意几个地方

1:keyPath用于区分BasicAnimation动画类型
````swift
  /* 
        可选的KeyPath
        transform.scale = 比例轉換
        transform.scale.x = 宽的比例轉換
        transform.scale.y = 高的比例轉換
        transform.rotation.z = 平面圖的旋轉
        opacity = 透明度
        margin
        zPosition
        backgroundColor 背景颜色
        cornerRadius 圆角
        borderWidth
        bounds
        contents
        contentsRect
        cornerRadius
        frame
        hidden
        mask
        masksToBounds
        opacity
        position
        shadowColor
        shadowOffset
        shadowOpacity
        shadowRadius
    */
````

2:动画执行后不恢复原位

````swift
//这两个属性若不设置，动画执行后回复位
baseAnimation.removedOnCompletion = false
baseAnimation.fillMode = kCAFillModeForwards
````

### CABasicAnimation 组合动画
>   组合动画就是把一组CABasicAnimation组合使用，我们以组合移动、旋转、缩放特效为例

````swift

    //组合动画
    func groupAnimation(theView:UIView){

        //向右平移100
        let mAnimation = CABasicAnimation(keyPath: "position")
        //baseAnimation.fromValue 初始位置，如果不设就是当前位置
        let endPoint = CGPoint(x: theView.layer.position.x+100, y: theView.layer.position.y)
        mAnimation.toValue = NSValue(CGPoint:endPoint)//绝对位置

        //baseAnimation.byValue = NSValue(CGPoint:CGPoint(x: 100, y: 0))//相对位置

        //x轴旋转动画
        let xAnimation = CABasicAnimation(keyPath: "transform.rotation.x")
        (xAnimation as CABasicAnimation).byValue =  NSNumber(double:M_PI*500)
        xAnimation.duration = 1.5

        //y轴旋转动画
        let yAnimation = CABasicAnimation(keyPath: "transform.rotation.y")
        (yAnimation as CABasicAnimation).byValue =  NSNumber(double:M_PI*200)

        //缩放动画
        let sAnimation = CABasicAnimation(keyPath: "transform.scale")
        // 动画选项设定
        sAnimation.autoreverses = true // 动画结束时执行逆动画
        // 缩放倍数
        sAnimation.fromValue = NSNumber(double:0.1) // 开始时的倍率
        sAnimation.toValue = NSNumber(double:1.5) // 结束时的倍率

        //动画组
        let groupAnimation = CAAnimationGroup()

        // 动画选项设定，动画组统一设置或者单独设置
        groupAnimation.duration = 3.0;
        groupAnimation.repeatCount = 1;
        groupAnimation.animations = [xAnimation,yAnimation,sAnimation,mAnimation]
        //这两个属性若不设置，动画执行后回复位
        groupAnimation.removedOnCompletion = false
        groupAnimation.fillMode = kCAFillModeForwards
        groupAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseIn)//加速运动
        groupAnimation.delegate = self
        //可以在动画中缓存一些
        groupAnimation.setValue(NSValue(CGPoint: endPoint), forKey: "endPoint")
        groupAnimation.setValue(theView, forKey: "sender")
        //执行动画
        theView.layer.addAnimation(groupAnimation, forKey: "theViewMoveRotation90")
    }

````

![效果图]()

## 关键帧动画 CAKeyframeAnimation



-   Core Animation
    -   UIView动画封装
    -   CABasicAnimation（基本动画）
    -   CAKeyframeAnimation（关键帧动画）
    -   CATransition
    -   动画组
    -   转场动画

-   laryer隐式动画
    -   使用隐式动画
    -   禁用隐式动画

-   第三方动画库
    -   Popgit
    -   Spring

-   其他
    -   UIKit Dynamics （UIKit动力学）
    -   Motion Effects
    -   Custom View Controller Transitions

-   我的学习顺序

-   参考文章


frame         	控制UIView的大小和该UIView在superview中的相对位置。
bounds        	控制UIView的大小
center        	控制UIView的位置
transform     	控制UIView的缩放，旋转角度等固定好中心位置之后的变化
alpha         	控制UIView的透明度
backgroundColor	控制UIView的背景色
contentStretch	控制UIView的拉伸方式

EaseInOut // slow at beginning and end
EaseIn // slow at beginning
EaseOut // slow at end
Linear




##  我的学习顺序
-   1. 学习iOS高层次的api，比如UIView和UIimage的动画api
-   2. 学习低层次的api，CABasicAnimation，CAKeyframeAnimation，CATransition等等的使用
-   3. 第三方动画库，objc的Pop，swift的Spring的使用
-   4. 第三方动画库，objc的Pop，swift的Spring的源码阅读和学习

##  参考文章
---

(iOS开发之让你的应用“动”起来)[http://www.cocoachina.com/ios/20141022/10005.html]
(关于App的一些迷思以及一些动画效果开源库的推荐)[http://www.jianshu.com/p/69449e6bdc14]
(CABasicAnimation的基本使用方法（移动·旋转·放大·缩小）)[http://blog.csdn.net/iosevanhuang/article/details/14488239]
()[]
()[]
()[]