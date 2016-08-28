---
layout: post
title: ios绘图demo,做一个涂鸦板(上)
category: iOS
tags: IOS,绘图,coreGraphices,Graffiti
description:
---

>   之前一篇文字写了ios绘图基础，这篇文章，使用之前写的绘图基础，做一个涂鸦板。并把每一步完成都结果都单独保存一个文件，加上v+版本号

### [ios绘图基础](http://liuyanwei.jumppo.com/2015/07/25/ios-draw-base.html)

### [ios绘图demo,做一个涂鸦板(上)](http://liuyanwei.jumppo.com/2015/07/26/ios-draw-Graffiti.html)

-  1完成一个最基本的涂鸦板
-  2给涂鸦板加上颜色选择功能，和笔触粗细功能

### [ios绘图demo,做一个涂鸦板(下)](http://liuyanwei.jumppo.com/2015/07/26/ios-draw-Graffiti-2.html)

-  3画贝塞尔曲线


---

### ios绘图demo,做一个涂鸦板(上) 的效果图：
![效果图]({{site.url}}/assets/uploads/paintDemo.gif)

### 代码下载:github库，对应此文章的目录是paint ,[点击跳转代码下载地址](https://github.com/coolnameismy/demo)

## 1:完成一个最基本的涂鸦板
##### 下载代码后见文件PaintViewV01,看效果请在ViewController中找到PaintView，换成PaintView01
---

### 步骤和原理

-   1：重写uiview的 init、initWithFrame方法，主要是添加一个白色的背景色
-   2：重写touchesBegan、touchesMoved、touchesEnded，作用是接收屏幕触摸的坐标，手指接触uiview后会依次执行这三个方法。
其中重写touchesBegan和重写touchesEnded只在开始和结束执行一次，而手指在移动的过程中，会多次执行touchesMoved
-   3：重写drawRect方法，根据用户手指的移动，画出涂鸦

###代码（关键步骤都已经注释，应该都能看明白吧）


```` objective-c

//
//  PaintView.m
//  Paint
//
//  Created by 刘彦玮 on 15/7/26.
//  Copyright (c) 2015年 刘彦玮. All rights reserved.
//

#import "PaintViewV01.h"




@implementation PaintViewV01{

    //画的线路径的集合，内部是NSMutableArray类型
    NSMutableArray *paths;
}

-(instancetype)init{
    self = [super init];
    if (self) {
       //初始化uiview的样式
        [self paintViewInit];
    }
    return  self;
}
-(instancetype)initWithFrame:(CGRect)frame{
        self = [super initWithFrame:frame];
        if (self) {
            //初始化uiview的样式
            [self paintViewInit];
        }
        return  self;
}

//初始化paintViewInit样式和数据
-(void)paintViewInit{
    //添加背景色
    self.backgroundColor = [UIColor whiteColor];
    //初始化路径集合
    paths = [[NSMutableArray alloc]init];
}

-(void)drawRect:(CGRect)rect{
    //必须调用父类drawRect方法，否则 UIGraphicsGetCurrentContext()获取不到context
    [super drawRect:rect];
    //获取ctx
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    //渲染所有路径
    for (int i=0; i<paths.count; i++) {
        NSMutableArray *pathPoints = [paths objectAtIndex:i];
        CGMutablePathRef path = CGPathCreateMutable();
        for (int j=0; j<pathPoints.count; j++) {
            CGPoint point = [[pathPoints objectAtIndex:j]CGPointValue] ;
            if (j==0) {
                CGPathMoveToPoint(path, &CGAffineTransformIdentity, point.x,point.y);
            }else{
                CGPathAddLineToPoint(path, &CGAffineTransformIdentity, point.x, point.y);
            }
        }
        //路径添加到ct
        CGContextAddPath(ctx, path);
        //描边
        CGContextStrokePath(ctx);
    }
}


-(void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event{
    //创建一个路径，放到paths里面
    NSMutableArray *path = [[NSMutableArray alloc]init];
    [paths addObject:path];
}

-(void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{
    //获取当前路径
    NSMutableArray *path = [paths lastObject];
    //获取当前点
    CGPoint movePoint = [[touches anyObject]locationInView:self];
    NSLog(@"touchesMoved     x:%f,y:%f",movePoint.x,movePoint.y);
    //CGPint要通过NSValue封装一次才能放入NSArray
    [path addObject:[NSValue valueWithCGPoint:movePoint]];
    //通知重新渲染界面，这个方法会重新调用UIView的drawRect:(CGRect)rect方法
    [self setNeedsDisplay];
}

-(void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{

}

@end



````

###  1完成后，就可以画画了，不过只能画固定粗细的黑色笔画，下面，我我们增加彩色笔画和控制粗细的功能
---

## 2:给涂鸦板加上颜色和笔触粗细选择的功能
### 下载代码后见文件PaintViewV02,看效果请在ViewController中找到PaintView，换成PaintView02

---

### 步骤

-   1增加一个数据对象，封装笔触pathPoint、笔触颜色、笔触粗细
-   2修改变量名称，增加变量
-   3修改界面，添加色板，和笔触粗细选择器
-   4修改原来的touchesBegan,touchesMoved方法，将选择的颜色数据和粗细数据封装
-   5修改drawRect方法

### 1增加一个数据对象，封装笔触pathPoint、笔触颜色、笔触粗细

```` objective-c

//
//  PaintStep.h
//  Paint
//
//  Created by 刘彦玮 on 15/7/26.
//  Copyright (c) 2015年 刘彦玮. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface PaintStep : NSObject{

@public
    //路径
    NSMutableArray *pathPoints;
    //颜色
    CGColorRef color;
    //笔画粗细
    float strokeWidth;
}

@end


//
//  PaintStep.m
//  Paint
//
//  Created by 刘彦玮 on 15/7/26.
//  Copyright (c) 2015年 刘彦玮. All rights reserved.
//

#import "PaintStep.h"

@implementation PaintStep

@end



````

### 2修改变量名称，增加变量，
#### paths 改名为 paintSteps,并增加currColor和slider两个变量
---

```` objective-c

//屏幕的宽高，做自适应用的
#define width  [UIScreen mainScreen].bounds.size.width
#define height [UIScreen mainScreen].bounds.size.height


@implementation PaintViewV02{

    //画的线路径的集合，内部是NSMutableArray类型
    NSMutableArray *paintSteps;
    //当前选中的颜色
    UIColor *currColor;
    //当前笔触粗细选择器
    UISlider *slider;

}

````


### 3修改界面，添加色板，和笔触粗细选择器
####(void)paintViewInit 方法增加对两个方法的调用
---

```` objective-c


-(void)paintViewInit 方法增加

    ....

    //创建色板
    [self createColorBord];

    //创建笔触粗细选择器
    [self createStrokeWidthSlider];
}
````

#### 创建色板和创建笔触粗细选择器的实现

```` objective-c

//创建色板
-(void)createColorBord{
    //默认当前笔触颜色是黑色
    currColor = [UIColor blackColor];
    //色板的view
    UIView *colorBoardView = [[UIView alloc]initWithFrame:CGRectMake(0, 20, width, 20)];
    [self addSubview:colorBoardView];
    //色板样式
    colorBoardView.layer.borderWidth = 1;
    colorBoardView.layer.borderColor = [UIColor blackColor].CGColor;

    //创建每个色块
    NSArray *colors = [NSArray arrayWithObjects:
                       [UIColor blackColor],[UIColor redColor],[UIColor blueColor],
                       [UIColor greenColor],[UIColor yellowColor],[UIColor brownColor],
                       [UIColor orangeColor],[UIColor whiteColor],[UIColor orangeColor],
                       [UIColor purpleColor],[UIColor cyanColor],[UIColor lightGrayColor], nil];
    for (int i =0; i<colors.count; i++) {
        UIButton *btn = [[UIButton alloc]initWithFrame:CGRectMake((width/colors.count)*i, 0, width/colors.count, 20)];
        [colorBoardView addSubview:btn];
        [btn setBackgroundColor:colors[i]];
        [btn addTarget:self action:@selector(changeColor:) forControlEvents:UIControlEventTouchUpInside];
    }

}

//切换颜色
-(void)changeColor:(id)target{
    UIButton *btn = (UIButton *)target;
    currColor = [btn backgroundColor];
}

//创建笔触粗细选择器
-(void)createStrokeWidthSlider{
    slider = [[UISlider alloc]initWithFrame:CGRectMake(0, 50, width, 20)];
    slider.maximumValue = 20;
    slider.minimumValue = 1;
    [self addSubview:slider];
}

````

#### 4修改原来的touchesBegan,touchesMoved方法，将选择的颜色数据和粗细数据封装
---
```` objective-c
-(void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event{

    PaintStep *paintStep = [[PaintStep alloc]init];
    paintStep->color = currColor.CGColor;
    paintStep->pathPoints =  [[NSMutableArray alloc]init];
    paintStep->strokeWidth = slider.value;
    [paintSteps addObject:paintStep];
}


-(void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{

    //获取当前路径
    PaintStep *step = [paintSteps lastObject];
    NSMutableArray *pathPoints = step->pathPoints;

    ....
}

````
#### 5：修改drawRect方法

```` objective-c

-(void)drawRect:(CGRect)rect{

    ....

    //渲染所有路径
    for (int i=0; i<paintSteps.count; i++) {
        ....

        //设置path 样式
        CGContextSetStrokeColorWithColor(ctx, step->color);
        CGContextSetLineWidth(ctx, step->strokeWidth);
        //路径添加到ct
        CGContextAddPath(ctx, path);

        ....
    }
}

````


#### 完成后，我们的画板就可以画出彩色的笔画，控制粗细了。之后，我会继续给画板增加一些功能，并把方法写出来。

#### | ios绘图demo,做一个涂鸦板(上) | 完成后的效果图：
![效果图]({{site.url}}/assets/uploads/paintDemo.gif)

## 最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处