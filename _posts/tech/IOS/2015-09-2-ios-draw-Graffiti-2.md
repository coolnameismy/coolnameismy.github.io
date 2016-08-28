---
layout: post
title: ios绘图demo,做一个涂鸦板(下)
category: iOS
tags: IOS,绘图,coreGraphices,Graffiti
description:
---

>   之前一篇ios绘图demo,做一个涂鸦板(上) 完成了一个基本功能的绘图板，这一篇，最要是增加一个画贝塞尔曲线的功能。
#### [ios绘图基础](http://liuyanwei.jumppo.com/2015/07/25/ios-draw-base.html)

#### [ios绘图demo,做一个涂鸦板(上)](http://liuyanwei.jumppo.com/2015/07/26/ios-draw-Graffiti.html)

-  1完成一个最基本的涂鸦板
-  2给涂鸦板加上颜色选择功能，和笔触粗细功能

#### [ios绘图demo,做一个涂鸦板(下)](http://liuyanwei.jumppo.com/2015/07/26/ios-draw-Graffiti-2.html)

-  3画贝塞尔曲线

---

#### | ios绘图demo,做一个涂鸦板(下) | 完成后的效果图：
![]({{site.url}}/assets/uploads/paintDemo2.gif)

#### 代码下载:github库,[点击跳转代码下载地址](https://github.com/coolnameismy/demo/tree/master/paint)



#### 步骤和原理

-   1：添加一个贝塞尔曲线功能按钮，点击之后，画图模式为画贝塞尔曲线。
-   2：重写touchesBegan、touchesMoved、touchesEnded， 第一次点击获得起始点的坐标，第二次点击获取结束点的坐标并移动手指，根据手指的移动，设置贝塞尔曲线的控制点位置。
随着手指移动，绘制出当前曲线的和控制点的参考线。松手后将绘制的线存入数组



#### 添加控制面板

````objective-c

-(void)createControlBoard{
    paintViewMode = PaintViewModeStroke;

    UIView *controlBoard = [[UIView alloc]initWithFrame:CGRectMake(0, 60, 60, height-50)];
    [self addSubview:controlBoard];
    NSMutableArray *boards = [[NSMutableArray alloc]init];

    //bezier曲线面板
    UIButton *berzierBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    [berzierBtn setBackgroundImage:[UIImage imageNamed:@"bezierBoard" ] forState:UIControlStateNormal];
    [berzierBtn addTarget:self action:@selector(berzierBtnClick:) forControlEvents:UIControlEventTouchUpInside];
    [boards addObject:berzierBtn];


    //添加面板包含的每一个按钮
    int vercital = 20;
    int horizontal = 10;
    int btnWH = 60;
    for (int i = 0 ; i< boards.count ; i++) {
        UIButton *btn = boards[i];
        btn.frame = CGRectMake(horizontal,(i+1)* vercital ,btnWH, btnWH);
        [controlBoard addSubview:btn];
    }


}

    #pragma mark -控制面板按钮点击
    //贝塞尔按钮的点击事件
    -(void)berzierBtnClick:(id)sender{
        UIButton *btn = sender;
        if(paintViewMode == PaintViewModeStroke){
            paintViewMode = PaintViewModeBezier;
            [btn setBackgroundImage:[UIImage imageNamed:@"bezierBoard_l"] forState:UIControlStateNormal];
        }else{
            paintViewMode = PaintViewModeStroke;
            [btn setBackgroundImage:[UIImage imageNamed:@"bezierBoard"] forState:UIControlStateNormal];
        }

    }

````

#### 定义当前画图模式的枚举，和贝塞尔曲线的数组,定义了一个bezierStep类封装bezier曲线的数据


````objective-c

    typedef enum {
        PaintViewModeStroke,
        PaintViewModeBezier
    } PaintViewMode

    //画的线路径的集合，内部是NSMutableArray类型
    NSMutableArray *bezierSteps;


    //
    //  BezierStep.h
    //  Paint
    //
    //  Created by ZTELiuyw on 15/7/27.
    //  Copyright (c) 2015年 刘彦玮. All rights reserved.
    //

    #import <Foundation/Foundation.h>
    #import <UIKit/UIKit.h>


    typedef enum {
        BezierStepStatusSetStart,
        BezierStepStatusSetEnd,
        BezierStepStatusSetControl
    }BezierStepStatus;

    @interface BezierStep : NSObject{

    @public

        //路径
        CGPoint startPoint;
        CGPoint controlPoint;
        CGPoint endPoint;
        //颜色
        CGColorRef color;
        //笔画粗细
        float strokeWidth;
        //步骤状态
        BezierStepStatus status;
    }


    @end




    ````

#### 重写touchesBegan、touchesMoved、touchesEnded， 把不同模式的绘图区分出来

````objective-c
#pragma mark -手指移动

-(void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event{

    switch (paintViewMode) {

        //笔画模式
        case PaintViewModeStroke:
            [self strokeModeTouchesBegan:touches withEvent:event];
            break;
        //曲线模式
        case PaintViewModeBezier:
            [self bezierModeTouchesBegan:touches withEvent:event];
            break;
        default:
            break;
    }
}

-(void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{

    switch (paintViewMode) {

            //笔画模式
        case PaintViewModeStroke:
            [self strokeModeTouchesMoved:touches withEvent:event];
            break;
            //曲线模式
        case PaintViewModeBezier:
            [self bezierModeTouchesMoved:touches withEvent:event];
            break;
        default:
            break;
    }
}

-(void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
    switch (paintViewMode) {


            //笔画模式
        case PaintViewModeStroke:
            [self strokeModeTouchesEnded:touches withEvent:event];
            break;
            //曲线模式
        case PaintViewModeBezier:
            [self bezierModeTouchesEnded:touches withEvent:event];
            break;
        default:
            break;
    }

}
````

笔画模式的代码后之前一样，只是做了拆分，这里就不写了，把贝塞尔曲线模式的代码贴出来


````objective-c

-(void)bezierModeTouchesBegan:(NSSet *)touches withEvent:(UIEvent *)event{
    //创建贝塞尔 步骤
    BezierStep *step = [bezierSteps lastObject];
    CGPoint point =[[touches anyObject]locationInView:self];

    if (step) {
        switch (step->status) {

            case BezierStepStatusSetStart:
            {
                step->endPoint = point;
                step->status = BezierStepStatusSetControl;
            }
                break;
            case BezierStepStatusSetEnd:
            {
                step =  [[BezierStep alloc]init];
                step->color = currColor.CGColor;
                step->strokeWidth = slider.value;
                [bezierSteps addObject:step];
            }
                break;

            default:
                break;
        }

    }else{
        step =  [[BezierStep alloc]init];
        step->color = currColor.CGColor;
        step->strokeWidth = slider.value;
        [bezierSteps addObject:step];
    }


}

-(void)bezierModeTouchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{

    BezierStep *step = [bezierSteps lastObject];
    CGPoint point =[[touches anyObject]locationInView:self];
    switch (step->status) {

        case BezierStepStatusSetControl:
        {
            step->controlPoint = point;
        }

            break;
        default:
            break;
    }

     [self setNeedsDisplay];

}

-(void)bezierModeTouchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
    BezierStep *step = [bezierSteps lastObject];
    CGPoint point =[[touches anyObject]locationInView:self];
    switch (step->status) {
        case BezierStepStatusSetStart:
        {
            step->startPoint = point;
//            step->status = BezierStepStatusSetControl;
        }
             break;
        case BezierStepStatusSetControl:
        {
            step->controlPoint = point;
            step->status = BezierStepStatusSetEnd;
        }
            break;

        default:
            break;
    }



}


````

#### 最后，根据状态画出曲线了参考线

````objective-c

-(void)drawRect:(CGRect)rect{
    //必须调用父类drawRect方法，否则 UIGraphicsGetCurrentContext()获取不到context
    [super drawRect:rect];
    //获取ctx
    CGContextRef ctx = UIGraphicsGetCurrentContext();

    //渲染所有路径
    for (int i=0; i<paintSteps.count; i++) {
        PaintStep *step = paintSteps[i];
        NSMutableArray *pathPoints = step->pathPoints;
        CGMutablePathRef path = CGPathCreateMutable();
        for (int j=0; j<pathPoints.count; j++) {
            CGPoint point = [[pathPoints objectAtIndex:j]CGPointValue] ;
            if (j==0) {
                CGPathMoveToPoint(path, &CGAffineTransformIdentity, point.x,point.y);
            }else{
                CGPathAddLineToPoint(path, &CGAffineTransformIdentity, point.x, point.y);
            }
        }
        //设置path 样式
        CGContextSetStrokeColorWithColor(ctx, step->color);
        CGContextSetLineWidth(ctx, step->strokeWidth);
        //路径添加到ct
        CGContextAddPath(ctx, path);
        //描边
        CGContextStrokePath(ctx);
    }

    //渲染bezier路径
    for (int i=0; i<bezierSteps.count; i++) {
        BezierStep *step = bezierSteps[i];
        //设置path 样式
        CGContextSetStrokeColorWithColor(ctx, step->color);
        CGContextSetLineWidth(ctx, step->strokeWidth);
        //路径参考线
        CGContextMoveToPoint(ctx, step->startPoint.x, step->startPoint.y);
        CGContextAddQuadCurveToPoint(ctx, step->controlPoint.x, step->controlPoint.y, step->endPoint.x, step->endPoint.y);
        //描边
        CGContextStrokePath(ctx);

        switch (step->status) {
            case BezierStepStatusSetControl:
                //画出起点到控制线的距离
            {
                //设置path 样式
                CGContextSetStrokeColorWithColor(ctx, [UIColor colorWithRed:0.233 green:0.480 blue:0.858 alpha:1.000].CGColor);
                //虚线线条样式
                CGFloat lengths[] = {10,10};
                CGContextSetLineDash(ctx, 1, lengths, 2);
                CGContextMoveToPoint(ctx, step->startPoint.x, step->startPoint.y);
                CGContextAddLineToPoint(ctx, step->controlPoint.x, step->controlPoint.y);
                CGContextAddLineToPoint(ctx, step->endPoint.x, step->endPoint.y);
                CGContextStrokePath(ctx);
            }
                break;

            default:
                break;
        }


            }
}

````

#### 代码下载:github库,[点击跳转代码下载地址](https://github.com/coolnameismy/demo/tree/master/paint)

完成后的文件见 PaintViewV03.m

#### | ios绘图demo,做一个涂鸦板(下) | 完成后的效果图：
![]({{site.url}}/assets/uploads/paintDemo2.gif)


## 最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处