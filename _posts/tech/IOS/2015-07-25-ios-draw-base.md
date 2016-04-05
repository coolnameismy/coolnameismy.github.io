---
layout: post
title: ios绘图基础
category: iOS
tags: IOS,绘图,coreGraphices
description:
---

>   ios绘图才一些场合很好用，这里演示一些基本的方法。


-1  ios绘图基础

-2  ios常见的图形绘制

    - 画线
    - 画圆、圆弧
    - 画矩形,画椭圆，多边形
    - 画图片
    - 画文字

---

####  画出来的草图：
![草图](https://geekpics.net/images/2015/07/25/aNRFGp.jpg)

####  代码下载:github库，对应此文章的目录是draw [点击跳转代码下载地址](https://github.com/coolnameismy/demo)

## 1:ios绘图基础
---

#### 几个基本的概念

-   context：上下文，ios绘图的方法都需要传一个上下文context，这个context在重写uiview的drawRect的方法里调用UIGraphicsGetCurrentContext()获取
-   path：路径，ios绘图可以想象为你拿着一支笔去画图，画几条线或几个点从而形成一个路径，之后可以利用理解去填色或者描边
-   stroke,fill 描边和填充，每个路径都需要填充或者描边后才能在视图中看见，他们都各自有很多样式可以设置，常见的有颜色、粗细、渐变，连接样式等等。
-   画图可以使用默认路径画，或者单独创建path画图，对应画图的api并不完全相同，是两组名称相似的api，两组pi常用的方法如下

````
CGContextMoveToPoint设置起点
CGContextClosePath 连接起点和当前点
CGPathCreateMutable 类似于 CGContextBeginPath
CGPathMoveToPoint 类似于 CGContextMoveToPoint
CGPathAddLineToPoint 类似于 CGContextAddLineToPoint
CGPathAddCurveToPoint 类似于 CGContextAddCurveToPoint
CGPathAddEllipseInRect 类似于 CGContextAddEllipseInRect
CGPathAddArc 类似于 CGContextAddArc
CGPathAddRect 类似于 CGContextAddRect
CGPathCloseSubpath 类似于 CGContextClosePath
CGContextAddPath函数把一个路径添加到graphics

````
- 画图步骤 1：获取context，2：设置路径 3：填充或描边路径
- 关于填充颜色 填充颜色有3种模式，分别是1：填充笔触，就是只给路径描边，2：根据路径填充颜色 3：填充笔触和颜色。填充颜色也分为非零绕数规则和奇偶规则，这个概念比较复杂难以解释，大家可以百度看看或者花几个图试试就明白。

````

CGContextStrokePath(ctx); //描出路径
CGContextFillPath(ctx)  使用非零绕数规则填充当前路径
CGContextDrawPath	 两个参数决定填充规则，kCGPathFill表示用非零绕数规则，kCGPathEOFill表示用奇偶规则，kCGPathFillStroke表示填充，kCGPathEOFillStroke表示描线，不是填充
CGContextEOFillPath	 使用奇偶规则填充当前路径
CGContextFillRect	 填充指定的矩形
CGContextFillRects	 填充指定的一些矩形
CGContextFillEllipseInRect	 填充指定矩形中的椭圆

````
## 2:ios常见的图形绘制
---

#### 2.0 准备工作
- （1）新建一个文件，继承UIView
- （2）重写-(void)drawRect:(CGRect)rect； 方法

```` objective-c

-(void)drawRect:(CGRect)rect{

    [super drawRect:rect];

    //获取ctx
    CGContextRef ctx = UIGraphicsGetCurrentContext();

    //设置画图相关样式参数

    //设置笔触颜色
    CGContextSetStrokeColorWithColor(ctx, [UIColor blackColor].CGColor);//设置颜色有很多方法，我觉得这个方法最好用
    //设置笔触宽度
    CGContextSetLineWidth(ctx, 2);
    //设置填充色
    CGContextSetFillColorWithColor(ctx, [UIColor purpleColor].CGColor);
    //设置拐点样式
    //    enum CGLineJoin {
    //        kCGLineJoinMiter, //尖的，斜接
    //        kCGLineJoinRound, //圆
    //        kCGLineJoinBevel //斜面
    //    };
    CGContextSetLineJoin(ctx, kCGLineJoinRound);
    //Line cap 线的两端的样式
    //    enum CGLineCap {
    //        kCGLineCapButt,
    //        kCGLineCapRound,
    //        kCGLineCapSquare
    //    };
    CGContextSetLineCap(ctx, kCGLineCapRound);
    //虚线线条样式
    //CGFloat lengths[] = {10,10};

    //画线
    [self drawLine:ctx];

    //画圆、圆弧
    [self drawCircle:ctx];


    //画矩形,画椭圆，多边形
    [self drawShape:ctx];

    //画图片
    [self drawPicture:ctx];

    //画文字
    [self drawText:ctx];

    }


````

#### 2.1:画线
>   第一个方法我写的比较详细，写了使用path的方式和直接画线的方式。推荐使用path的方式画线。
>   另外，第一个方法也写了移动笔触画线和用点集合画线。后面方法只会涉及其中一种，因为方法都比较类似。


```` objective-c

    //画线
    -(void)drawLine:(CGContextRef)ctx{

        //画一条简单的线
        CGPoint points1[] = {CGPointMake(10, 30),CGPointMake(300, 30)};
        CGContextAddLines(ctx,points1, 2);


        //画线方法1，使用CGContextAddLineToPoint画线，需要先设置一个起始点
        //设置起始点
        CGContextMoveToPoint(ctx, 50, 50);
        //添加一个点
        CGContextAddLineToPoint(ctx, 100,50);
        //在添加一个点，变成折线
        CGContextAddLineToPoint(ctx, 150, 100);


        //画线方法2
        //构造线路径的点数组
        CGPoint points2[] = {CGPointMake(60, 60),CGPointMake(80, 120),CGPointMake(20, 300)};
        CGContextAddLines(ctx,points2, 3);


        //利用路径去画一组点（推荐使用路径的方式，虽然多了几行代码，但是逻辑更清晰了）
        //第一个路径
        CGMutablePathRef path1 = CGPathCreateMutable();
        CGPathMoveToPoint(path1, &CGAffineTransformIdentity, 0, 200);
        //CGAffineTransformIdentity 类似于初始化一些参数
        CGPathAddLineToPoint(path1, &CGAffineTransformIdentity, 100, 250);
        CGPathAddLineToPoint(path1, &CGAffineTransformIdentity, 310, 210);
        //路径1加入context
        CGContextAddPath(ctx, path1);
        //path同样有方法CGPathAddLines(),和CGContextAddLines()差不多用户，可以自己试下

        //描出笔触
        CGContextStrokePath(ctx);
    }


````


#### 2.2:画矩形,画椭圆，多边形

```` objective-c

//画矩形,画椭圆，多边形
-(void)drawSharp:(CGContextRef)ctx{

    CGContextSetFillColorWithColor(ctx, [UIColor redColor].CGColor);


    //画椭圆，如果长宽相等就是圆
    CGContextAddEllipseInRect(ctx, CGRectMake(0, 250, 50, 50));

    //画矩形,长宽相等就是正方形
    CGContextAddRect(ctx, CGRectMake(70, 250, 50, 50));


    //画多边形，多边形是通过path完成的
    CGMutablePathRef path = CGPathCreateMutable();
    CGPathMoveToPoint(path, &CGAffineTransformIdentity, 120, 250);
    CGPathAddLineToPoint(path, &CGAffineTransformIdentity, 200, 250);
    CGPathAddLineToPoint(path, &CGAffineTransformIdentity, 180, 300);
    CGPathCloseSubpath(path);
    CGContextAddPath(ctx, path);


    //填充
    CGContextFillPath(ctx);


}


````

#### 2.3:画图

```` objective-c

    //画图片
    -(void)drawPicture:(CGContextRef)context{
        /*图片*/
        UIImage *image = [UIImage imageNamed:@"head.jpeg"];
        [image drawInRect:CGRectMake(10, 300, 100, 100)];//在坐标中画出图片
    }


````

#### 2.4:画文字

```` objective-c
    //画文字
    -(void)drawText:(CGContextRef)ctx{


        //文字样式
        UIFont *font = [UIFont systemFontOfSize:18];
        NSDictionary *dict = @{NSFontAttributeName:font,
                               NSForegroundColorAttributeName:[UIColor whiteColor]};

        [@"hello world" drawInRect:CGRectMake(120 , 350, 500, 50) withAttributes:dict];
    }

````


#### 2.5:画圆、圆弧、贝塞尔曲线

>  画圆和圆弧是一回事，只是起点和重点位置不同，画圆画弧线主要依赖于这几个方法
CGContextAddArc,CGContextAddArcToPoint,
CGContextAddCurveToPoint,CGContextAddQuadCurveToPoint
后面两个方法是贝塞尔二次曲线和三次曲线

---

```` objective-c

   //画圆、圆弧
   -(void)drawCircle:(CGContextRef)ctx{

       CGContextSetStrokeColorWithColor(ctx, [UIColor purpleColor].CGColor);

       /* 绘制路径 方法一
        void CGContextAddArc (
        CGContextRef c,
        CGFloat x,             //圆心的x坐标
        CGFloat y,    //圆心的x坐标
        CGFloat radius,   //圆的半径
        CGFloat startAngle,    //开始弧度
        CGFloat endAngle,   //结束弧度
        int clockwise          //0表示顺时针，1表示逆时针
        );
        */

       //圆
       CGContextAddArc (ctx, 100, 100, 50, 0, M_PI* 2 , 0);
       CGContextStrokePath(ctx);

       //半圆
       CGContextAddArc (ctx, 100, 200, 50, 0, M_PI*2, 0);
       CGContextStrokePath(ctx);

       //绘制路径 方法二，这方法适合绘制弧度 ，端点p1和p2是弧线的控制点，类似photeshop中钢笔工具控制曲线，还不明白请去了解贝塞尔曲线
       //    void CGContextAddArcToPoint(
       //                                CGContextRef c,
       //                                CGFloat x1,  //端点1的x坐标
       //                                CGFloat y1,  //端点1的y坐标
       //                                CGFloat x2,  //端点2的x坐标
       //                                CGFloat y2,  //端点2的y坐标
       //                                CGFloat radius //半径
       //                                )；

       //1/4弧度 * 4
       CGContextMoveToPoint(ctx, 200, 200);
       CGContextAddArcToPoint(ctx, 200, 100,300, 100, 100);
       CGContextAddArcToPoint(ctx, 400, 100,400, 200, 100);
       CGContextAddArcToPoint(ctx, 400, 300,300, 300, 100);
       CGContextAddArcToPoint(ctx, 200, 300,200, 200, 100);
       CGContextStrokePath(ctx);

       //贝塞尔曲线
       CGContextSetStrokeColorWithColor(ctx, [UIColor orangeColor].CGColor);

       //三次曲线函数
       //void CGContextAddCurveToPoint (
       //                               CGContextRef c,
       //                               CGFloat cp1x, //控制点1 x坐标
       //                               CGFloat cp1y, //控制点1 y坐标
       //                               CGFloat cp2x, //控制点2 x坐标
       //                               CGFloat cp2y, //控制点2 y坐标
       //                               CGFloat x,  //直线的终点 x坐标
       //                               CGFloat y  //直线的终点 y坐标
       //                               );

       CGContextMoveToPoint(ctx, 200, 200);
       CGContextAddCurveToPoint(ctx, 200, 0, 300, 200, 400, 100);
       CGContextStrokePath(ctx);

       //三次曲线可以画圆弧，比如这里画一条之前用CGContextAddArcToPoint构成的圆弧
       CGContextMoveToPoint(ctx, 200, 200);
       CGContextAddCurveToPoint(ctx, 200, 100, 300, 100, 300 ,100);
       CGContextStrokePath(ctx);
       //二次曲线函数
       //void CGContextAddQuadCurveToPoint (
       //                                   CGContextRef c,
       //                                   CGFloat cpx,  //控制点 x坐标
       //                                   CGFloat cpy,  //控制点 y坐标
       //                                   CGFloat x,  //直线的终点 x坐标
       //                                   CGFloat y  //直线的终点 y坐标
       //                                   );

       CGContextMoveToPoint(ctx, 100, 100);
       CGContextAddQuadCurveToPoint(ctx, 200, 0, 300, 150);
       CGContextStrokePath(ctx);

   }


````


## 最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处