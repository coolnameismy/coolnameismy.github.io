---
layout: post
title: iOS动画和特效（二）UIKit Dynamics-UIKit动力行为
category: 技术
tags:
description:
---

> UIKit Dynamics是UIKit的动力交互体系，比如重力，铰链连接，碰撞，悬挂等物理效果，它将2D物理引擎引入了人UIKit，它能使原本的动画和交互效果更加符合物理规律，当然动画效果也更逼真。


## 先看一个简单的demo view添加重力效果

````swift

    //自由落体
    func fall(){

        /*给箱子加上重力效果*/
        //初始化动画的持有者
        let gravityAnimator =  UIDynamicAnimator(referenceView: view)
        //初始化重力行为
        let gravityBehavior = UIGravityBehavior(items: [box])
        //添加重力行为
        gravityAnimator.addBehavior(gravityBehavior)
        //需要保持变量
        self.animator = gravityAnimator

    }


````

效果如下
！[]()

## UIKit Dynamics基础

为了实现动力行为UI，我们必须先了解四个对象

-   UIDynamicItem：用来描述一个力学物体的状态，其实就是实现了UIDynamicItem委托的对象，或者抽象为有面积有旋转的质点；
-   UIDynamicBehavior：动力行为的描述，如例子中的重力行为
-   UIDynamicAnimator：动力行为（UIDynamicBehavior）的容器，添加到容器内的行为将发挥作用。
-   ReferenceView：力学参考对象，就是对象在哪个view中会产生响应的力学行为，例子中````let gravityAnimator =  UIDynamicAnimator(referenceView: view)```` 对象产生力学作用的区域是 self.view

场见的力学行为有这么几种

-   UIAttachmentBehavior：连接行为
-   UICollisionBehavior：碰撞行为
-   UIGravityBehavior：重力行为
-   UIPushBehavior：推力行为
-   UISnapBehavior：不知道怎么翻译，实际效果类似吸引力

## 重力+碰撞
>   前面的demo中box会一直落下，我们给demo改一改，变成落到地下后就停止

````swift

        //自由落在地板上
        func fallDown(){

            //初始化动画的持有者
            let animator =  UIDynamicAnimator(referenceView: view)
            //初始化重力行为
            let gravityBehavior = UIGravityBehavior(items: [box])
            //添加重力行为
            animator.addBehavior(gravityBehavior)
            //初始化碰撞行为
            let collisionBehavior = UICollisionBehavior(items: [box])
            //指定边界为参考系的边界
            collisionBehavior.translatesReferenceBoundsIntoBoundary = true
            animator.addBehavior(collisionBehavior)

            //需要保持变量
            self.animator = animator
        }

````

效果如下
！[]()

````swift
//还可以添加更为复杂边界
//Bezier边界
collisionBehavior.addBoundaryWithIdentifier(<identifier: NSCopying NSCopying>, forPath: <UIBezierPath>)
//线边界
collisionBehavior.addBoundaryWithIdentifier(<#identifier: NSCopying NSCopying>, fromPoint: <CGPoint>, toPoint: <GPoint>)
````

## 重力+附着力
>   这次把box钉在点200，200位置

UIAttachmentBehavior是连接行为，要把box钉在某一位置，就给他添加连接行为即可

````swift
    //把box钉在 x: 200, y: 200 位置
    func pin(){
        //初始化动画的持有者
        let animator =  UIDynamicAnimator(referenceView: view)
        //初始化重力行为
        let gravityBehavior = UIGravityBehavior(items: [box])
        //添加重力行为
        animator.addBehavior(gravityBehavior)
        //初始化连接行为
        let attachmentBehavior = UIAttachmentBehavior(item: box, attachedToAnchor: CGPoint(x: 200, y: 200))

        //把点画出来
        let point = UIImageView(image: UIImage(named: "AttachmentPoint_Mask"))
        point.frame = CGRect(x: 200, y: 200, width: 10, height: 10)
        view.addSubview(point)
        //设置行为
        animator.addBehavior(attachmentBehavior)

        //需要保持变量
        self.animator = animator

    }
````

效果如下
！[]()


## 重力+推力
>   这次利用推力，把箱子往右上角方向推一下，把箱子丢出去

````swift

    //丢箱子
    func throwBox(){

        //重新设置box的位置
        box.hidden = true
        box.frame = CGRect(x: 0, y: 400, width: 50, height: 50)
        box.hidden = false

        //初始化动画的持有者
        let animator =  UIDynamicAnimator(referenceView: view)
        //初始化重力行为
        let gravityBehavior = UIGravityBehavior(items: [box])
        //添加重力行为
        animator.addBehavior(gravityBehavior)
        //初始化推力行为     Continuous:持续给力 Instantaneous:瞬间给力
        let pushBehavior = UIPushBehavior(items: [box], mode: .Instantaneous)
        //推力速度
        pushBehavior.magnitude = 2
        //推力方向
        pushBehavior.angle = pointToAngle(CGPoint(x: 500, y: -300))
        //设置行为
        animator.addBehavior(pushBehavior)

        //设置边界
        let collisionBehavior = UICollisionBehavior(items: [box])
        collisionBehavior.translatesReferenceBoundsIntoBoundary = true
        animator.addBehavior(collisionBehavior)

        //需要保持变量
        self.animator = animator

    }

    //根据给定点和view中心点计算角度
    func pointToAngle(p:CGPoint)->CGFloat{
        let o: CGPoint = CGPointMake(CGRectGetMidX(self.view.bounds), CGRectGetMidY(self.view.bounds))
        let angle: CGFloat = atan2(p.y - o.y, p.x - o.x)
        return angle
    }

````

## 重力+推力
效果如下
！[]()





================================================================================================================================================





-   Core Animation
    -   UIView动画封装
    -   CABasicAnimation（基本动画）
    -   CAKeyframeAnimation（关键帧动画）
    -   CATransition
    -   动画组
    -   转场动画

-   UIKit Dynamics （UIKit动力行为）
    

-   laryer隐式动画
    -   使用隐式动画
    -   禁用隐式动画

-   第三方动画库
    -   Popgit
    -   Spring

-   其他
    -
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
(动画解释)[http://www.objccn.io/issue-12-1/]
()[]
()[]