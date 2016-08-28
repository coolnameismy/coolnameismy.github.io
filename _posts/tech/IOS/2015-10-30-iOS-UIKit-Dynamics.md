---
layout: post
title: iOS动画和特效（二）UIKit力学行为
category: iOS
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

![]({{site.url}}/assets/uploads/UIKitDynamics01.gif)

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

![]({{site.url}}/assets/uploads/UIKitDynamics02.gif)

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

![]({{site.url}}/assets/uploads/UIKitDynamics03.gif)


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


![]({{site.url}}/assets/uploads/UIKitDynamics04.gif)

## 重力+黑洞吸引
>   让自由落下的箱子被黑洞吸引吧！

````swift
//黑洞
func blockHole(){

    //把黑洞画出来
    let point = UIImageView(image: UIImage(named: "blackhole"))
    point.frame = CGRect(x: 300, y: 140, width: 50, height: 50)
    view.addSubview(point)

    //初始化动画的持有者
    let animator =  UIDynamicAnimator(referenceView: view)
    //初始化重力行为
    let gravityBehavior = UIGravityBehavior(items: [box])
    //添加重力行为
    animator.addBehavior(gravityBehavior)

    //需要保持变量
    self.animator = animator

    //0.5秒后启动黑洞
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, Int64(500 * NSEC_PER_MSEC)), dispatch_get_main_queue()) { () -> Void in
        NSLog("black hole !!!")
        let snapBehavior = UISnapBehavior(item: self.box, snapToPoint: CGPoint(x: 300, y: 140))
        snapBehavior.damping = 50 //阻尼
        self.animator.addBehavior(snapBehavior)
    }

}
````

![]({{site.url}}/assets/uploads/UIKitDynamics05.gif)

## 自定义力学行为，合成多个力学行为的效果
>   让自由落下的箱子被黑洞吸引吧！


定义一个行为类，给行为添加重力和吸力子行为

````swift

    class GravityAndSnapBehavior:UIDynamicBehavior {
        init(view:UIView) {
            var point:CGPoint!
            super.init()
            let gravityBehavior = UIGravityBehavior(items: [view])
            let snapBehavior = UISnapBehavior(item: view, snapToPoint: CGPoint(x: 300, y: 140))
            self.addChildBehavior(gravityBehavior)
            point =  CGPoint(x: 100 , y: 100)
            self.addChildBehavior(snapBehavior)
            //可以监听每一个步骤，然后自己对行为加自定义的影响和作用
            self.action = {
                NSLog("step")
//                view.layer.position = CGPoint(x: point.x++, y: point.y++)
      }


````

黑洞+使用自定义的合成行为

````swift

    class GravityAndSnapBehavior:UIDynamicBehavior {
        init(view:UIView) {
            //把黑洞画出来
            let blackhole = UIImageView(image: UIImage(named: "blackhole"))
            blackhole.frame = CGRect(x: 300, y: 140, width: 50, height: 50)
            view.addSubview(blackhole)

            //初始化动画的持有者
            let animator =  UIDynamicAnimator(referenceView: view)
            //初始化合成行为
            let gravityAndSnapBehavior = GravityAndSnapBehavior(view: box)
            //添加重力行为
            animator.addBehavior(gravityAndSnapBehavior)
            //需要保持变量
            self.animator = animator
      }


````

指定注意的是UIDynamBehavior中的action属性，这个属性会再每次view改变时候出发，因此你可以根据自己需要，添加自己的特殊行为


## demo
---
[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/AnimationAndEffects)

本文的代码对于的文件名：AnimationAndEffects/UIKitDynamicsViewController.swift

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处

##  参考文章
---

 -   [iOS动画和特效专题](/2015/10/29/iOS-animation-0.html)
 -   [WWDC 2013 Session笔记 - UIKit Dynamics入门](http://www.cocoachina.com/industry/20131106/7309.html)
 -   [UICollectionView和UIKit Dynamics](http://www.cocoachina.com/industry/20140425/8241.html)
 -   [实战iOS 9：剖析UIKit Dynamics的改进 移动·旋转·放大·缩小](http://www.csdn.net/article/1970-01-01/2825673)