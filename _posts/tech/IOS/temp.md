---
layout: post
title: iOS动画和特性（一）
category: 技术
tags:
description:
---

>   UIView的方法中有几个易用的静态方法可以做出动画效果，分别是UIView.beginAnimations() ->  UIView.commitAnimations() 和UIView.animateWithDuration()方法

## 一个简单的例子作为iOS动画系类的开始 QuickExampleViewController
>   一个UIView，每点击一次向右移动100，变色，加速运动


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

![](http://www.cocoachina.com/cms/uploads/allimg/141022/4196_141022102913_1.png)

CAAnimation：核心动画的基础类，不能直接使用，负责动画运行时间、速度的控制，本身实现了CAMediaTiming协议。

CAPropertyAnimation：属性动画的基类（通过属性进行动画设置，注意是可动画属性），不能直接使用。

CAAnimationGroup：动画组，动画组是一种组合模式设计，可以通过动画组来进行所有动画行为的统一控制，组中所有动画效果可以并发执行。

CATransition：转场动画，主要通过滤镜进行动画效果设置。

CABasicAnimation：基础动画，通过属性修改进行动画参数控制，只有初始状态和结束状态。

CAKeyframeAnimation：关键帧动画，同样是通过属性进行动画参数控制，但是同基础动画不同的是它可以有多个状态控制。



## 基本动画 CABasicAnimation




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
()[]
()[]
()[]
()[]