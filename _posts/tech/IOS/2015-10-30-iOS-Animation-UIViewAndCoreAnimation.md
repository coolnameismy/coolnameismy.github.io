---
layout: post
title: iOS动画和特效（一）UIView动画和CoreAnimation
category: iOS
tags:
description:
---


## 一个简单的例子作为iOS动画系类的开始 QuickExampleViewController
---
>   UIView的方法中有几个易用的静态方法可以做出动画效果，分别是UIView.beginAnimations() ->  UIView.commitAnimations() 和UIView.animateWithDuration()方法
>   我们以一个UIView，每点击一次向右移动100，变色，加速运动这个简单的动效作为例子。
>   转载请注明出处



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

使用更简单的和UIView.animateWithDuration()实现

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

![]({{site.url}}/assets/uploads/animationAndEffect05.png)


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
            //baseAnimation.timingFunction = CAMediaTimingFunction(controlPoints: 0.5, 0, 0.9, 0.7)//自定义加速的曲线参数

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
![]({{site.url}}/assets/uploads/animationAndEffect01.gif)

出现这种现象的原因是因为动画是通过view的layer设置位置的。而设置layer的位置后，uiview的位置是不会发生变化的，所以虽然看见红色移动了，但其实红色view.frame没变化，所以点击区域也没变化。那么如何解决？

解决的思路是在每次动画结束后，把view.frame的位置重新设置成移动后的位置。代码如下：

````swift
//步骤1，设置动画的委托
 baseAnimation.delegate = self

//步骤2：将移动后的点和要移动的view放入baseAnimation的context
baseAnimation.setValue(NSValue(CGPoint: endPoint), forKey: "endPoint")
baseAnimation.setValue(theView, forKey: "sender")

//步骤3：重写animationDidStop，layer.position
override func animationDidStop(anim:CAAnimation, finished flag: Bool) {
    let endPoint = anim.valueForKey("endPoint")?.CGPointValue
    let theView = anim.valueForKey("sender") as! UIView
    theView.layer.position = endPoint!
}

````



其他注意几个地方

1:keyPath用于区分BasicAnimation动画类型

````swift
  /*
        可选的KeyPath
        transform.scale = 比例轉換
        transform.scale.x
        transform.scale.y
        transform.rotation = 旋轉
        transform.rotation.x
        transform.rotation.y
        transform.rotation.z
        transform.translation
        transform.translation.x
        transform.translation.y
        transform.translation.z

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

![]({{site.url}}/assets/uploads/animationAndEffect02.gif)

## 关键帧动画 CAKeyframeAnimation
>   关键帧动画就是在动画控制过程中开发者指定主要的动画状态，至于各个状态间动画如何进行则由系统自动运算补充（每两个关键帧之间系统形成的动画称为“补间动画”），这种动画的好处就是开发者不用逐个控制每个动画帧，而只要关心几个关键帧的状态即可。

关键帧动画和基本动画也很相似，通过keyPath设置动画类型，才对齐进行一组关键值的设定。数据变化也有2种形式，一种是关键点，一种是路径，比如实例中的按一个贝塞尔弧移动view。

````swift

        //关键帧动画
        //keyPath和basicAnimation的类型相同，@see BasicAnimationViewController.swift
        let keyframeAnimation = CAKeyframeAnimation(keyPath: "position")

        //线段的位置移动
//        keyframeAnimation.values = [
//                                        NSValue(CGPoint: CGPoint(x: 10, y: 100)),
//                                        NSValue(CGPoint: CGPoint(x: 30, y: 100)),
//                                        NSValue(CGPoint: CGPoint(x: 30, y: 120)),
//                                        NSValue(CGPoint: CGPoint(x: 60, y: 120)),
//                                        NSValue(CGPoint: CGPoint(x: 60, y: 100)),
//                                        NSValue(CGPoint: CGPoint(x: 106, y: 210)),
//                                        NSValue(CGPoint: CGPoint(x: 106, y: 410)),
//                                        NSValue(CGPoint: CGPoint(x: 300, y: 310))
//                                   ]

        //弧线位置移动
        let path = CGPathCreateMutable()
        CGPathMoveToPoint(path, nil, 50, 50)
        CGPathAddCurveToPoint(path, nil, 50, 50, 700, 300, 30, 500)
        keyframeAnimation.path = path

        //设置其他属性
        keyframeAnimation.duration = 1.0;
//        keyframeAnimation.beginTime = CACurrentMediaTime() + 2;//设置延迟2秒执行

        tapGesture.view?.layer.addAnimation(keyframeAnimation, forKey: "keyframeAnimation1")

````

![]({{site.url}}/assets/uploads/animationAndEffect03.gif)

关键帧动画其他可以设置的参数

````swift

//keyTimes：各个关键帧的时间控制

//caculationMode：动画计算模式。
kCAAnimationLinear: 线性模式，默认值
kCAAnimationDiscrete: 离散模式
kCAAnimationPaced:均匀处理，会忽略keyTimes
kCAAnimationCubic:平滑执行，对于位置变动关键帧动画运行轨迹更平滑
kCAAnimationCubicPaced:平滑均匀执行

````


##  转场效果

转场动画就是从一个场景以动画的形式过渡到另一个场景。转场动画的使用一般分为以下几个步骤：

-   创建转场动画
-   设置转场类型、子类型（可选）及其他属性
-   设置转场后的新视图并添加动画到图层


一个简单专场效果的例子：

````swift

        let transfer = CATransition()
        transfer.type = kCATransitionPush//push过渡方式
        transfer.duration = 1
        imageView.image = fetchImage() //获取新的UIImage对象
        imageView.layer.addAnimation(swipeTransition(), forKey: "rightSwipe")//开始转场

````

转场的效果transfer.type有很多选项，主要选项有

````
kCATransitionFade：淡入淡出，默认效果
kCATransitionMoveIn：新视图移动到就是图上方
kCATransitionPush:新视图推开旧视图
kCATransitionReveal：移走旧视图然后显示新视图

//苹果未公开的私有转场效果
cube:立方体
suckEffect:吸走的效果
oglFlip:前后翻转效果
rippleEffect:波纹效果
pageCurl:翻页起来
pageUnCurl:翻页下来
cameraIrisHollowOpen:镜头开
cameraIrisHollowClose:镜头关
````

除了淡入淡出以外，其余三个效果都存在方向性，所以还有个.subType可以设置方向类型

````
kCATransitionFromRight:
kCATransitionFromLeft:
kCATransitionFromTop:
kCATransitionFromBottom:
````

下面我们来实现一个淡入淡出切换图片的场景。
-   左右滑动切换图片
-   切换的图片和切换效果随机出现

*步骤1：添加view底图，添加view的左右滑动手势*

````swift

    override func viewDidLoad() {
        super.viewDidLoad()

        //背景图片
        let bg = UIImageView(image: UIImage(named: "x1.png"))
        bg.frame = view.frame
        view.addSubview(bg)

        //左右滑动事件
        let rigthSwipe = UISwipeGestureRecognizer(target:self, action:"rightSwipe:")
        rigthSwipe.direction = .Right
        let leftSwipe = UISwipeGestureRecognizer(target:self, action:"leftSwipe:")
        leftSwipe.direction = .Left
        view.addGestureRecognizer(rigthSwipe)
        view.addGestureRecognizer(leftSwipe)

    }

````


*步骤2：随机获取图片和随机获取转场效果的函数*

````swift

    func fetchImage()->UIImage{
        if images == nil{
            images = [];
            for index in 0...5 {
                let image = UIImage(named: "x" + String(index))
                images.append(image!)
            }
        }
        return images[Int(arc4random()%5)]
    }

    func swipeTransition(subtype:String)->CATransition{
        let transfer = CATransition()
        /*
            kCATransitionFade：淡入淡出，默认效果
            kCATransitionMoveIn：新视图移动到就是图上方
            kCATransitionPush:新视图推开旧视图
            kCATransitionReveal：移走旧视图然后显示新视图

            //苹果未公开的私有转场效果
            cube:立方体
            suckEffect:吸走的效果
            oglFlip:前后翻转效果
            rippleEffect:波纹效果
            pageCurl:翻页起来
            pageUnCurl:翻页下来
            cameraIrisHollowOpen:镜头开
            cameraIrisHollowClose:镜头关
        */
        let types = [kCATransitionFade,kCATransitionMoveIn,kCATransitionPush,kCATransitionReveal,"cube","suckEffect","oglFlip","rippleEffect","pageCurl","pageUnCurl","cameraIrisHollowOpen","cameraIrisHollowClose"]
        let type = types[Int(arc4random()%11)]
        transfer.type = type
        NSLog("%@", type)
        transfer.subtype = subtype
        transfer.duration = 1
        return transfer
    }


````

*步骤3：左右滑动方法，实现场景切换*


````swift

      func rightSwipe(gesture:UISwipeGestureRecognizer){
          bg.image = fetchImage()
          bg.layer.addAnimation(swipeTransition(kCATransitionFromRight), forKey: "rightSwipe")

      }

      func leftSwipe(gesture:UISwipeGestureRecognizer){
          bg.image = fetchImage()
          bg.layer.addAnimation(swipeTransition(kCATransitionFromLeft), forKey: "leftSwipe")
      }

````

完成后效果图如下：
![]({{site.url}}/assets/uploads/animationAndEffect04.gif)

## demo
---
[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/AnimationAndEffects)

本文的代码对于的文件名：

-   QuickExampleViewController.swift
-   BasicAnimationViewController.swift
-   KeyFrameAnimationViewController.swift
-   TransferAnimationViewController.swift

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处



##  参考文章
---

-   [iOS动画和特效专题](/2015/10/29/iOS-animation-0.html)
-   [iOS开发之让你的应用“动”起来](http://www.cocoachina.com/ios/20141022/10005.html)
-   [关于App的一些迷思以及一些动画效果开源库的推荐](http://www.jianshu.com/p/69449e6bdc14)
-   [CABasicAnimation的基本使用方法 移动·旋转·放大·缩小](http://blog.csdn.net/iosevanhuang/article/details/14488239)
-   [动画解释](http://www.objccn.io/issue-12-1/)
