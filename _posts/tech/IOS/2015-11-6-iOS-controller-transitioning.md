---
layout: post
title: iOS动画和特效（四）controller间的自定义过渡效果
category: iOS
tags:
description:
---
>   前面动画和特效系类文章中有一篇写了UIView的过渡效果，而这一篇主要说的是UIViewController的自定义过渡效果和过渡交互

先看看完成后的效果图

-  点击模态controller，会弹出一个新的绿色UIViewController，手指下滑可以dismiss这个controller
-  四个角的按钮可以自定义圆形切换的过渡效果切换的一个红色的UIViewController，点击返回用同样的方式切换回来

![]({{site.url}}/assets/uploads/ControllerTransitioning1.gif)


## 出场人物介绍
>   介绍下Controller过渡和交互用到的类

### presention and presented

A中模态显示B,那么A就是presention，b就是presented，后续内容会使用这种叫法称呼Modal下的2个controller

### UIViewControllerTransitioningDelegate

controller modal过渡的presented和dismiss的动画交互协议，你需要实现协议，它会询问你：

-   当PresentedController时，你要使用怎样的动画类（UIViewControllerAnimatedTransitioning）展示过渡效果？
-   当DismissedController时，你要使用怎样的动画类（UIViewControllerAnimatedTransitioning）展示过渡效果？
-   当PresentedController时，你要使用怎样的过渡交互类（UIViewControllerInteractiveTransitioning）处理过渡交互？
-   当DismissedController时，你要使用怎样的过渡交互类（UIViewControllerInteractiveTransitioning）处理过渡交互？
-   presentationControllerForPresentedViewController：这篇文章没有用到，应该是自定义modal状态呈现和被呈现的controller，类似于controller的PresentationStyle，想了解的可以参考下面两篇文章
[Present ViewController Modally ](http://www.cnblogs.com/smileEvday/archive/2012/05/29/presentModalViewController.html) 和
[iOS 8的PresentationController ](http://www.cocoachina.com/industry/20140707/9053.html)


### UIViewControllerAnimatedTransitioning

过渡动画效果的具体实现的接口，需要实现它的3个方法，即可完成一个controller过渡动画效果

-   ```` func animationEnded  ```` ：过渡动画完成后要执行的代码可以写到这个方法中
-   ```` func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval```` ：给定一个过渡动画的执行时间
-   ```` func animateTransition(transitionContext: UIViewControllerContextTransitioning)```` ：具体过渡动画都在这个方法里面实现，在这个方法中可以通过transitionContext拿到一切你需要的对象，后面会有讲到


### UINavigationControllerDelegate

controller 非模态状态下的的过渡动画，就不能使用之前说的那个````UIViewControllerTransitioningDelegate````委托解决了，就需要用````UINavigationControllerDelegate````，接口方法比较类似，但也不完全一样

-   你要使用怎样的动画类（UIViewControllerAnimatedTransitioning）展示过渡效果？
-   你要使用怎样的过渡交互类（UIViewControllerInteractiveTransitioning）处理过渡交互？
-   willShowViewController，didShowViewController ： 生命周期事件
-   navigationControllerSupportedInterfaceOrientations: 屏幕支持的方向



### UIViewControllerInteractiveTransitioning

这个类用于实现在转场过路效果中的交互，比如在demo中，用它实现了一个手指下滑解除modal状态的效果

### UIViewControllerContextTransitioning

UIViewControllerAnimatedTransitioning协议的关键方法```` animateTransition(transitionContext: UIViewControllerContextTransitioning) ````里面可以得到，使用transitionContext可以获取一些重要的上下文信息，比如前后的controller，转换时的容器等，示例如下


````swift
        //拿到前后的两个controller
        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!
        //拿到Presenting的最终Frame
        let finalFrameForVC = transitionContext.finalFrameForViewController(toVC)
        //拿到转换的容器view
        let containerView = transitionContext.containerView()
        //拿到过渡动画执行时间
        transitionDuration(transitionContext)
````




## controller modal过渡效果

我们先来实现一个简单的示例，点击一个按钮，出现一个modal controller，自定义从下往上弹出并且有些回弹效果的过渡动画。从这个例子中我们可以了解

-   如何实现UIViewControllerTransitioningDelegate
-   如何实现UIViewControllerAnimatedTransitioning
-   如何组合在一起完成功能

示例效果见demo点击后，弹出的绿色界

![]({{site.url}}/assets/uploads/ControllerTransitioning1.gif)

### 步骤1：界面画出按钮，点击之后用 modal 显示 To2ViewController，并设置transitioningDelegate指向自己

````swift

    //模态视图切换效果
    @IBAction func Transitioning2(sender: AnyObject) {
        let toVC = To2ViewController()
        //设置transitioning委托为自己
        toVC.transitioningDelegate = self
        navigationController?.presentViewController(toVC, animated: true, completion: nil)
    }


````

### 步骤2：controller 实现 UIViewControllerTransitioningDelegate

demo中使用了extension的方式继承UIViewControllerTransitioningDelegate，好处是代码逻辑分离


````swift

//模态视图切换效果
extension ControllerTransitioningDemoViewController:UIViewControllerTransitioningDelegate{

    //返回Presented使用的UIViewControllerAnimatedTransitioning类
    func animationControllerForPresentedController(presented: UIViewController, presentingController presenting: UIViewController, sourceController source: UIViewController) -> UIViewControllerAnimatedTransitioning?{
        return PresentedAnimation() // PresentedAnimation 是自定义的过渡动画效果的实现类，继承自UIViewControllerAnimatedTransitioning 步骤3中介绍它
    }

}

````

###  步骤3: 实现一个过渡效果为自下而上弹出并有些晃动的UIViewControllerAnimatedTransitioning类

就如之前对UIViewControllerAnimatedTransitioning介绍的那样，需要继承自UIViewControllerAnimatedTransitioning，然后实现它的三个委托方法，具体实现请看代码注释

````swift

import UIKit

public class PresentedAnimation: NSObject,UIViewControllerAnimatedTransitioning {

    public func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval{
        //转场过渡动画的执行时间
        return 0.6
    }

    // This method can only  be a nop if the transition is interactive and not a percentDriven interactive transition.
    //在进行切换的时候将调用该方法，我们对于切换时的UIView的设置和动画都在这个方法中完成。
    public func animateTransition(transitionContext: UIViewControllerContextTransitioning){
        //拿到前后的两个controller
        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!
        //拿到Presenting的最终Frame
        let finalFrameForVC = transitionContext.finalFrameForViewController(toVC)
        //拿到转换的容器view
        let containerView = transitionContext.containerView()
        let bounds = UIScreen.mainScreen().bounds
        toVC.view.frame = CGRectOffset(finalFrameForVC, 0, bounds.size.height)
        containerView!.addSubview(toVC.view)

        //自下而上弹出toVC的动画
        UIView.animateWithDuration(transitionDuration(transitionContext),
                                    delay: 0.0,
                                    usingSpringWithDamping: 0.7,
                                    initialSpringVelocity: 0.0,
                                    options: .CurveLinear,
                                    animations: {
                                    fromVC.view.alpha = 0.5
                                    toVC.view.frame = finalFrameForVC
                                    }, completion: {
                                        finished in
                                        transitionContext.completeTransition(true)
                                        fromVC.view.alpha = 1.0
                                    })
         NSLog("animateTransition")

    }

    //执行完成后的回调
    public func animationEnded(transitionCompleted: Bool){
            NSLog("animation ended")
    }
}


````

madal的转场动画分为2类，present和dismiss，刚才我们实现的是animationControllerForPresentedController，这是present类，下节我们实现dissmiss的转场过渡效果


## controller dismiss过渡效果

present的过渡效果实现和modal过渡效果类似，也是设置委托、实现委托、实现动画，就不详细说明了，大家可以参考demo。这里我们只说说和present过渡的区别

### 区别1 委托入口不同

````swift

    //Presented使用的委托
    func animationControllerForPresentedController(presented: UIViewController, presentingController presenting: UIViewController, sourceController source: UIViewController) -> UIViewControllerAnimatedTransitioning?{

    }

    //Dismiss使用的委托
    func animationControllerForDismissedController(dismissed: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        //返回一个UIViewControllerAnimatedTransitioning类型
        return DismissAnimation()
    }

````

### 区别2 动画效果区别（这点其实不算真正的区别，因为你也可以设置为相同的效果）：demo中present动画是从下而上，而dismiss的动画是自上而下。

DismissAnimation的实现

````swift

import UIKit

class DismissAnimation:NSObject,UIViewControllerAnimatedTransitioning {

    func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval{
        return 0.6
    }

    func animateTransition(transitionContext: UIViewControllerContextTransitioning){

        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!

        let screenBounds = UIScreen.mainScreen().bounds
        let initFrame = transitionContext.initialFrameForViewController(fromVC)
        let finalFrame = CGRectOffset(initFrame, 0, screenBounds.size.height)

        let containerView = transitionContext.containerView()!
        containerView.addSubview(toVC.view)
        containerView.sendSubviewToBack(toVC.view)

        let duration: NSTimeInterval = self.transitionDuration(transitionContext)
        UIView.animateWithDuration(duration, animations: {
            fromVC.view.frame = finalFrame
            }, completion: {
                (finished: Bool) in transitionContext.completeTransition(!transitionContext.transitionWasCancelled())
        })

     }
}


````


## controller push、pop过渡效果

push、pop和present、dismiss的过渡走的是两个完全不同的委托，委托里面的方法有相似之处，比如都可以分为过渡和交互两类。交互的内容后面再说，先说过渡效果的区别。

**实现的委托不同:**  push、pop自定义过渡动画，需要实现UINavigationControllerDelegate，而present、dismiss实现的是UIViewControllerTransitioningDelegate

**区分类型方式不同:** UIViewControllerTransitioningDelegate通过2个委托present和dismiss区分开来，而在UINavigationControllerDelegate中，对应转场过渡动画只有一个委托，通过委托中的参数operation: UINavigationControllerOperation 区分pop和push

````swift

//push、pop视图切换
extension ControllerTransitioningDemoViewController:UINavigationControllerDelegate{
    func navigationController(navigationController: UINavigationController, animationControllerForOperation operation: UINavigationControllerOperation, fromViewController fromVC: UIViewController, toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning?{

        let transitioningAnimation = ExpandAnimation(type:operation)
        transitioningAnimation.sender = transitioningSender
        //返回动画的实现类
        return transitioningAnimation
    }
}

````




## UIViewControllerAnimatedTransitioning动画类的实现，完成点击后圆形区域放大过渡的动画效果


### 步骤1添加一个按钮，点击使用push的方式跳转到页面To1ViewController，并设置委托

````swift

    //推出视图切换效果
    @IBAction func Transitioning1(sender: AnyObject) {
        let toVC = To1ViewController()
        //设置委托
        navigationController?.delegate = self
        //主要是动画实现圆形扩大效果，需要知道一个初始园的位置，所以把uiview传过去。这种方式传递uiview不是一个很好的方式，这里为了demo能尽量的简单，所以这么做了
        transitioningSender = sender as! UIView
        navigationController?.pushViewController(toVC, animated: true)
    }


````

### 步骤2实现UINavigationControllerDelegate

````swift

//push、pop视图切换
extension ControllerTransitioningDemoViewController:UINavigationControllerDelegate{
    func navigationController(navigationController: UINavigationController, animationControllerForOperation operation: UINavigationControllerOperation, fromViewController fromVC: UIViewController, toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning?{

        let transitioningAnimation = ExpandAnimation(type:operation)
        transitioningAnimation.sender = transitioningSender
        //返回动画的实现类
        return transitioningAnimation
    }
}

````

###  步骤3 完成点击后圆形区域放大过渡的动画效果的实现类ExpandAnimation

这个动画效果我就简单说说实现步骤，其余的大家看看代码。下面的参考文章中，有一篇对这个效果说的比较详细，大家可以去阅读

实现这样一个效果，基本原理是使用遮罩层，罩住presenting，有一个小圆是初始按钮点击的圆形路径，一个大圆是大于presenting的圆形路径。大圆和小圆作为遮罩的路径。判断过渡类型是presention -》 presenting还是presenting -》 presention，分别做不同的处理

presention -》 presenting ： 小圆作为初始遮罩层路径，罩住presenting，使用baseAnimation动画把遮罩层的路径从小圆路径变为大圆路径，presenting即可显示出来，完成过渡效果。
小圆的位置是通过跳转点击按钮决定的，小圆位置不同会影响到大圆结束的位置，所以分了左上、左下、右上、右下四个位置分别处理。这个步骤由于偷懒在presenting -》 presention这个过程里面被省略了，每次都指定了固定的小圆位置

presenting -》 presention ： 使用大圆遮住presenting，使用baseAnimation动画把遮罩层的路径从大圆路径变为小圆路径，presenting慢慢变小到看不见，presention慢慢即可显示出来，完成过渡效果。

````swift

import UIKit

class ExpandAnimation: NSObject, UIViewControllerAnimatedTransitioning {

    //保存上下文
    var transitionContext:UIViewControllerContextTransitioning!
    //Pop or push
    var type:UINavigationControllerOperation!
    //初始点击的uiview对象，需要他的frame作为初始位置
    var sender:UIView?

    convenience init(type:UINavigationControllerOperation) {
        self.init()
        self.type = type
    }

    func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval{
        return 0.5
    }

    func animateTransition(transitionContext: UIViewControllerContextTransitioning){
        self.transitionContext = transitionContext
        NSLog("animateTransition")
        if(type == .Push){
            PushTransition(transitionContext)
        }else if(type == .Pop){
            PopTransition(transitionContext)
        }

    }

    func animationEnded(transitionCompleted: Bool){
        NSLog("animation ended")
    }

    //弹出效果 在固定位置进行的动画，可以根据需要改成动态位置触发
    func PopTransition(transitionContext: UIViewControllerContextTransitioning){

        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!
        let containerView = transitionContext.containerView()
        let view = toVC.view!

        containerView!.addSubview(toVC.view)
        containerView!.addSubview(fromVC.view)

        //遮罩层
        let mask = CAShapeLayer()
        fromVC.view.layer.mask = mask

        //画出小圆
        let s_center = CGPoint(x: 50, y: 50)
        let s_radius:CGFloat =  sqrt(800)
        let s_maskPath = UIBezierPath(ovalInRect:CGRectInset(CGRect(x: s_center.x, y: s_center.y, width: 1, height: 1), -s_radius, -s_radius))
        //        mask.path = s_maskPath.CGPath

        //画出大圆
        let l_center = CGPoint(x: 50, y: 50)
        let l_radius = sqrt( pow(view.bounds.width - l_center.x, 2) + pow(view.bounds.height - l_center.y, 2) ) + 150
        let l_maskPath = UIBezierPath(ovalInRect:CGRectInset(CGRect(x: l_center.x, y: l_center.y, width: 1, height: 1), -l_radius, -l_radius))

        let baseAnimation = CABasicAnimation(keyPath: "path")
        baseAnimation.duration = transitionDuration(transitionContext)

        baseAnimation.fromValue = l_maskPath.CGPath
        baseAnimation.toValue = s_maskPath.CGPath

        baseAnimation.delegate = self
        baseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseIn)
        mask.addAnimation(baseAnimation, forKey: "path")

    }

    //present 动画，根据触发点的位置开始启动动画
    func PushTransition(transitionContext: UIViewControllerContextTransitioning){

        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!
        let finalFrame = transitionContext.finalFrameForViewController(toVC)
        let containerView = transitionContext.containerView()
        let view = toVC.view!

        containerView!.addSubview(toVC.view)

        //小圆路径
        let s_maskPath = UIBezierPath(ovalInRect:(sender?.frame)!)

        //大圆路径
        let l_center =  (sender?.center)!

        var l_radius:CGFloat
        if(sender!.frame.origin.x > (toVC.view.bounds.size.width / 2)){
            if (sender!.frame.origin.y < (toVC.view.bounds.size.height / 2)) {
                //右上角
                l_radius = sqrt( pow(0 - l_center.x, 2) + pow(CGRectGetMaxY(view.frame) - l_center.y, 2) )
            }else{
                //右下角
                l_radius = sqrt( pow(0 - l_center.x, 2) + pow(0 - l_center.y, 2) )
            }
        }else{
            if (sender!.frame.origin.y < (toVC.view.bounds.size.height / 2)) {
                //左上角
                l_radius = sqrt( pow(CGRectGetMaxX(view.frame) - l_center.x, 2) + pow(CGRectGetMaxY(view.frame) - l_center.y, 2) )
            }else{
                //左下角
                l_radius = sqrt( pow(CGRectGetMaxX(view.frame) - l_center.x, 2) + pow(0 - l_center.y, 2) )
            }
        }
        l_radius += 50 //稍微增加一些位置
        let l_maskPath = UIBezierPath(ovalInRect:CGRectInset(CGRect(x: l_center.x, y: l_center.y, width: 1, height: 1), -l_radius, -l_radius))

        //遮罩层
        let mask = CAShapeLayer()
        mask.path = l_maskPath.CGPath
        view.layer.mask = mask


        ////错误用法，animationWithDuration不能通过操作layer产生动画
        //UIView.animateWithDuration(5) { () -> Void in
        //     mask.path = b_maskPath.CGPath
        //}

        let baseAnimation = CABasicAnimation(keyPath: "path")
        baseAnimation.duration = transitionDuration(transitionContext)

        baseAnimation.fromValue = s_maskPath.CGPath
        baseAnimation.toValue = l_maskPath.CGPath

        baseAnimation.delegate = self
        baseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
        mask.addAnimation(baseAnimation, forKey: "path")


    }
    override func animationDidStop(anim: CAAnimation, finished flag: Bool) {
        //动画完成后去处遮罩
        self.transitionContext.completeTransition(true)
        //动画完成后去处遮罩
        self.transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)?.view.layer.mask = nil
        self.transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)?.view.layer.mask = nil

    }
}


````


## 自定义过渡交互，实现一个下滑手势解除modal状态的效果

UINavigationControllerDelegate和UIViewControllerTransitioningDelegate委托都有对交互的方法支持，返回一个UIViewControllerInteractiveTransitioning对象，他是实现过渡交互的具体实现。

这里我们只实现UIViewControllerTransitioningDelegate的交互，UINavgationController的实现和它类似。这个demo参考了猫神的文章：[iOS7中的ViewController切换](http://onevcat.com/2013/10/vc-transition-in-ios7/) 区别是，这里使用swift实现。猫神在他的文章中有几个地方没看明白，后来自己写了一遍才明白，这里会仔细说明下。


### 第一步：实现interactionControllerForDismissal委托

````swift

   //present、dismiss视图切换效果
   extension ControllerTransitioningDemoViewController:UIViewControllerTransitioningDelegate{

    ...

    //返回dismiss使用的UIViewControllerAnimatedTransitioning类
    func animationControllerForDismissedController(dismissed: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        return DismissAnimation()
    }

    //返回dismiss交互时的使用的UIViewControllerInteractiveTransitioning类
    func interactionControllerForDismissal(animator: UIViewControllerAnimatedTransitioning) -> UIViewControllerInteractiveTransitioning? {
       return interactiveTransition.isInteracting ? interactiveTransition : nil
    }


   }


````

### 第二步：完成DismissAnimation动画效果

DismissAnimation动画和前文中的PresentedAnimation动画效果类似，只是一个自下而上一个自上而下


````swift
import UIKit

class DismissAnimation:NSObject,UIViewControllerAnimatedTransitioning {

    func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval{
        return 0.6
    }

    func animateTransition(transitionContext: UIViewControllerContextTransitioning){

        let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey)!
        let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)!

        let screenBounds = UIScreen.mainScreen().bounds
        let initFrame = transitionContext.initialFrameForViewController(fromVC)
        let finalFrame = CGRectOffset(initFrame, 0, screenBounds.size.height)

        let containerView = transitionContext.containerView()!
        containerView.addSubview(toVC.view)
        containerView.sendSubviewToBack(toVC.view)

        let duration: NSTimeInterval = self.transitionDuration(transitionContext)
        UIView.animateWithDuration(duration, animations: {
            fromVC.view.frame = finalFrame
            }, completion: {
                (finished: Bool) in transitionContext.completeTransition(!transitionContext.transitionWasCancelled())
        })

     }
}

````

### 第三步：完成SwipeUpInteractiveTransition交互处理

SwipeUpInteractiveTransition继承自UIPercentDrivenInteractiveTransition，UIPercentDrivenInteractiveTransition继承UIViewControllerInteractiveTransitioning，使用UIPercentDrivenInteractiveTransition可以帮你省许多事情。

实现的原理是让SwipeUpInteractiveTransition监控presenting view的手势，检测手指y位置的移动，如果超过200，则标志为完成。大家可以看下代码，交互实现主要是那三个方法的运用。

-   updateInteractiveTransition() ： 更新界面，实际效果就是手指上下移动时presenting会跟着上下移动
-   cancelInteractiveTransition()： 取消交互，页面恢复presenting
-   finishInteractiveTransition()： 完成交互，页面切到presention

````swift

 import UIKit

 class SwipeUpInteractiveTransition: UIPercentDrivenInteractiveTransition {

     var vc:UIViewController?

     //是否正在交互
     var isInteracting:Bool = false
     //是否判断交互完成
     var shouldComplete:Bool = false

     init(vc:UIViewController) {
         super.init()
         self.vc = vc
         //添加手势
         vc.view.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: "panGestureHandler:"))

     }

     //处理滑动手势
     func panGestureHandler(gesture:UIPanGestureRecognizer){
         let translation = gesture.translationInView(gesture.view)
         switch(gesture.state){
         case .Began:
             //标记交互开始，dismiss model
             isInteracting = true
             vc?.dismissViewControllerAnimated(true, completion: nil)
         case .Changed:
             var fraction = Float(translation.y / 400)
             //限制fraction值在0-1之间
             fraction = fminf(fmaxf(fraction, 0.0), 1.0)
             shouldComplete = fraction > 0.5
             updateInteractiveTransition(CGFloat(fraction))
             NSLog("x:%f y:%f" , translation.x,translation.y)
             NSLog("fraction:%f" , fraction)
             NSLog("shouldComplete:%@" ,shouldComplete)
         case .Ended , .Cancelled:
              isInteracting = false
              if(!shouldComplete || gesture.state == .Cancelled){
                  cancelInteractiveTransition()
              }else{
                  finishInteractiveTransition()
              }

         default:break

         }

     }
 }

````


这里要注意下，为什么.Began时候就要执行 ````vc?.dismissViewControllerAnimated(true, completion: nil) ```` ，因为执行dismiss的时候不会直接dismiss，会进入interactionControllerForDismissal委托问你要UIViewControllerInteractiveTransitioning，
因为设置了标志位isInteracting，所以会返回SwipeUpInteractiveTransition，接着处理手指移动和移动结束事件。涉及到很多委托方法的先后发生顺序的问题，请看下节内容

## controller过渡和UIViewController的委托事件发生的先后顺序

presention -》 presenting ：弹出模态视图过程

````swift

     presenting viewWillAppear
     animateTransition start
     presenting viewDidAppear
     presention viewDidDisappear
     animateTransition ended

````

presenting -》presention ：解除模态视图过程

````swift

    presention viewWillAppear
    animateTransition start
    presention viewDidAppear
    presenting viewDidDisappear
    animateTransition ended

````

可以看出来，animate 发生在 viewWillAppear和viewDidAppear之间的，并且在viewDidDisappear后，animateTransition才结束。了解这些的发生先后顺序，对理解整个过渡动画的处理过程很好帮助

## demo
---

![]({{site.url}}/assets/uploads/ControllerTransitioning1.gif)

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/AnimationAndEffects)

本文的代码对于的文件夹/ControllerTransitioning

- SwipeUpInteractiveTransition.swift:motal 手势dismiss视图的实现
- PresentedAnimation.swift : 呈现modal视图从下至上弹出vc的动画实现
- DismissAnimation.swift : dismiss modal视图从上至上消失的动画
- ControllerTransitioningDemoViewController.swift : 实现了push、pop 、present、dismiss视图动画委托的viewcontroller
- To1ViewController、To2ViewController ： 两个用于展示的viewcontroller

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处

## 文章引用和参考

-   [iOS7中的ViewController切换](http://onevcat.com/2013/10/vc-transition-in-ios7/)
-   [实现通过圆圈放大缩小的转场动画](http://www.kittenyang.com/pingtransition/)