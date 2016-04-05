---
layout: post
title: iOS动画和特效（七）仿射变换-CGAffineTransform
category: iOS
tags:
description:
---

>   仿射变换 AffineTransform，在iOS中他的实现类是CGAffineTransform和CATransform3D，很多动画效果都需要用到仿射去完成
所以仿射是动画基础，不能熟练使用也肯定玩不好动画特效的

 在iOS动画和特效专题（六）中有用到仿射变换的内容，这一篇专门来研究一下仿射变换，已经在iOS中的使用。在我写这章内容前我也
对仿射变换一无所知，也是查了一下资料作和看了许多别人的解释，才慢慢了解。和大家一起学习，若有写的不正确的地方也欢迎指出。

##  table of content

-   仿射是什么
-   仿射变换的原理和计算
-   仿射在iOS中常用的方法
-   3D仿射变换

##  仿射是什么

先看看上一篇文章中用到的仿射方法作为例子

````swift

    //Srping fall动画效果实现
    //使用了CGAffineTransformMakeTranslation设置y轴的位移
    //使用了CGAffineTransformMakeRotation 做了旋转
    //使用了CGAffineTransformConcat合并了位移和旋转仿射效果
    UIView.animateWithDuration(NSTimeInterval(duration), delay: NSTimeInterval(delay), usingSpringWithDamping: damping, initialSpringVelocity: velocity, options: [.CurveLinear,.AllowUserInteraction], animations: { () -> Void in
            let translate = CGAffineTransformMakeTranslation(0, 300)
            let rotate = CGAffineTransformMakeRotation(15 * CGFloat(M_PI / 180))
            self.view.transform = CGAffineTransformConcat(translate, rotate)
        }, completion: nil)


    //Srping squeezeRight 动画效果实现
    //使用了CGAffineTransformMakeTranslation设置x轴的位移
    //使用了CGAffineTransformMakeScale 做了缩放
    //使用了CGAffineTransformConcat合并了位移和缩放仿射效果
     UIView.animateWithDuration(NSTimeInterval(duration), delay: NSTimeInterval(delay), usingSpringWithDamping: damping, initialSpringVelocity: velocity, options: [.CurveLinear,.AllowUserInteraction], animations: { () -> Void in
                let translate = CGAffineTransformMakeTranslation(100, 0)
                //slide开头就不需要scale效果
                let scale = CGAffineTransformMakeScale(0.8, 1)
                self.view.transform = CGAffineTransformConcat(translate, scale)
                }, completion: nil)


````

好像挺容易的，就是iOS的CGAffineTrans的API，没错，iOS封装了几个好用的API去实现仿射变换的效果

````swift

        //位移仿射
        CGAffineTransformMakeTranslation
        CGAffineTransformTranslate
        //旋转仿射
        CGAffineTransformMakeRotation
        CGAffineTransformRotate
        //缩放仿射
        CGAffineTransformMakeScale
        CGAffineTransformScale

        //叠加仿射效果
        CGAffineTransformConcat

        //CATransform3D也对应一组相似的api，这个后面在研究到它的时候仔细说说
        

````

带make的方法是直接返回一个仿射变换效果，不带make方法是用来给已有的仿射效果叠加效果，类似于CGAffineTransformConcat方法的作用。

在大多数情况下用这几个封装好的仿射方法基本就能实现大多数的需求。但是既然是研究仿射，那大家可以看CGAffineTransform最基础的那个仿射方法的使用，能理解这个方法的使用，基本上就知道仿射是个什么意思了。

````swift
 CGAffineTransformMake ( CGFloat a, CGFloat b, CGFloat c, CGFloat d, CGFloat tx, CGFloat ty )
````

这个方法的6个参数可以拼出一个矩阵

````
    //仿射矩阵
    [         ]
      a  b  0
      c  d  0
      tx ty 1
    [         ]

````

仿射变化的定义有点复杂，我自己理解就是： 点p（以二维坐标为例）通过仿射矩阵C 后变成新的点p' 。

以上面的缩放仿射变化CGAffineTransformScale为例。就是view中每一个点p通过矩阵C后，view中的每一个新的点p'组成的新的图形，相比之前的view有了缩放的效果。


##   仿射变换的原理和计算

仿射变化原理是数学中的矩阵原理（线性代数、矩阵分析。感慨之前为什么没好好学这门课。。。 自己看这个仿射矩阵画了好多时间才弄明白怎么回事，还补了补基础的矩阵计算知识），要弄明白仿射矩阵对作用点的影响，还得先看看矩阵的乘法怎么计算。

###  基础-矩阵的乘法

````

 矩阵A = [      ]
          1  1 
          2  0
        [      ]

 矩阵B = [         ]
          0  2  3
          1  1  2
        [         ]

 矩阵C = A * B =     [         ]
                      1  3  5
                      0  4  6
                    [         ]

````

计算过程：

````
矩阵C = A * B =      [                                 ]      =        [          ] 
                      (1*0+1*1)  (1*2+1*1)  (1*3+1*2)                    1  3  5
                      (2*0+0*1)  (2*2+0*1)  (2*3+0*2)                    0  4  6
                    [                                 ]               [           ]

=
````

计算规则：

1. ：当矩阵A的列数等于矩阵B的行数是，才可以计算
2. ：计算的结果矩阵C的行数等于A的行数，列数等于B的列数
3. ：结果矩阵C的第 i 行第 j 列的元素Cij  等于矩阵A的第 i 行的元素与矩阵B的第 j 列对应元素乘积之和


###  仿射变换的矩阵计算

仿射计算中，（以二维坐标为例，坐标点为x,y）我们设我们的坐标点矩阵为

 ```` A = [x y 1] ````

仿射变换基础矩阵为：

````
    //仿射基础矩阵
    B = [         ]
          a  b  0
          c  d  0
          tx ty 1
        [         ]

````

根据矩阵计算规则我们知道A x B的结果是一个1行3列的矩阵，设A x B得到的新矩阵C ，那么C的矩阵应该为


````
    C = [  (a*x+c*y+tx)  (b*x+d*y+ty)  (1) ]

````

设C为 = [x' y' 1] , 那么可以得到 

````
x' = a*x + c*y + tx
y' = b*x + d*y + ty

````

看明白了嘛？这步很关键。根据这个公式，那么仿射矩阵就可以分成5种分别对应 

-   平移（Translation）
-   缩放（Scale）
-   翻转（Flip）
-   旋转（Rotation）
-   剪切（Shear）

![](http://my.csdn.net/uploads/201205/07/1336349553_1044.jpg)

![](http://my.csdn.net/uploads/201205/07/1336349566_2134.jpg)

###  平移（Translation）

设a,d=1  c,b = 0 那么

````
x' = a*x + c*y + tx
y' = b*x + d*y + ty

````

就变成了

````
x' = x + tx
y' = y + ty

````

这个不就是新的点P'(x' y') 是根据原来的P在x和y分别添加了一个常量就可以得到了嘛？ 所以这个就是仿射中的平移效果了。把a,b,c,d带入仿射的基础矩阵，就得了仿射的位移矩阵

````
       //仿射基础矩阵
        [         ]
          a  b  0
          c  d  0
          tx ty 1
        [         ]

````

````
       //仿射位移矩阵
       [          ]
          1  0  0
          0  1  0
          tx ty 1
       [          ]

````

再来看看代码

````swift

//向右移动300的仿射效果
let translate = CGAffineTransformMakeTranslation(300, 0)

//使用仿射基础方法CGAffineTransformMake ( CGFloat a, CGFloat b, CGFloat c, CGFloat d, CGFloat tx, CGFloat ty )
let translate = CGAffineTransformMake(1,0,0,1,300,0)

````

这下应该能明白仿射基础矩阵的意思了，如果没明白，从头在看一遍吧


###  缩放（Scale）

````
x' = a*x + c*y + tx
y' = b*x + d*y + ty

````

设 c,b,tx,ty = 0 ,得到


````
x' = a*x 
y' = d*y 

````

新坐标（x',y'）和原坐标是倍数关系，这个就可以用来做缩放效果了。所以得到缩放矩阵

````
       //仿射缩放矩阵
       [          ]
          a  0  0
          0  d  0
          0  0  1
       [          ]

       //也可以写成
       [            ]
          sx  0   0
          0   sy  0
          0   0   1
       [            ]

````

代码

````swift

//x和y都放大1倍
//let scaleAffine = CGAffineTransformMakeScale(2, 2)

//使用仿射基础方法CGAffineTransformMake 
let scaleAffine = CGAffineTransformMake(2,0,0,2,0,0)

````

###  剪切（Shear）

````
x' = a*x + c*y + tx
y' = b*x + d*y + ty

````

设 a,d = 1  tx,ty = 0 ,得到


````
x' = x + cy
y' = y + bx 

````

x和y的变化总是相互关联，这个就是剪切（Shear）

````
       //仿射剪切矩阵
       [          ]
          1  b  0
          c  1  0
          0  0  1
       [          ]

       //也可以写成
       [             ]
          1   shx  0
         shy   1   0
          0    0   1
       [             ]

````

代码

````swift

//使用仿射基础方法CGAffineTransformMake,设置x和y都为0.5的斜切
//斜切效果只能用CGAffineTransformMake实现,但是通过CATransform3DMakeRotation可以有类似的效果
let shearAffine = CGAffineTransformMake(1,0.5,0.5,1,0,0)

````

###   旋转（Rotation）

````
       //仿射旋转矩阵
       [                  ]
          cosa   sina   0
         -sina   cosa   0
           0      0     1
       [                  ]

````

代码

````swift

let rotation = CGAffineTransformMake(CGFloat( cos(M_PI_4) ), CGFloat( sin(M_PI_4) ), -CGFloat( sin(M_PI_4) ), CGFloat( cos(M_PI_4) ), 0, 0)

````



-   翻转（Flip）

我不知道使用CGAffineTransformMake()如何设置矩阵可以实现翻转效果，请知道的读者告知。我阅读的所有Flip效果都是使用CATransform3D实现的，代码如下

````swift

//Flip仿射，要是有3D去实现
let flip = CATransform3DMakeRotation(angle, x, y, z)

//示例
let flipX = CATransform3DMakeRotation(CGFloat(M_PI), 1, 0, 0)
let flipY = CATransform3DMakeRotation(CGFloat(M_PI), 0, 1, 0)
let flipZ = CATransform3DMakeRotation(CGFloat(M_PI), 0, 0, 1)

````

### 总结一下CATransform3DMakeRotation方法的6个参数

在不考虑旋转时，CATransform3DMakeRotation6个参数可以写成

````swift
 
 //sx,sy:缩放因子
 //shx,shy:斜切因子
 //tx,ty:移动因子
 CGAffineTransformMake (sx,shx,shy,sy,tx,ty)

````



##  仿射在iOS中常用的方法


````swift

        //位移仿射
        CGAffineTransformMakeTranslation
        CGAffineTransformTranslate
        //旋转仿射
        CGAffineTransformMakeRotation
        CGAffineTransformRotate
        //缩放仿射
        CGAffineTransformMakeScale
        CGAffineTransformScale

        //叠加仿射效果
        CGAffineTransformConcat
        
        //仿射矩阵方法，可以直接做效果叠加
        CGAffineTransformMake (sx,shx,shy,sy,tx,ty)

        /*
            这个是一个初始化矩阵，带入矩阵算法计算后的结构会得到
            x'=x , y'=y
            它的作用是清除之前对矩阵设置的仿射效果，或者用来初始化一个原始无效果的仿射矩阵
            [ 1 0 0 ]
            [ 0 1 0 ]
            [ 0 0 1 ]
        */
        CGAffineTransformIdentity

        //检查是否有做过仿射效果
        CGAffineTransformIsIdentity(transform)

        //检查2个仿射效果是否相同
        CGAffineTransformEqualToTransform(transform1,transform2)

        //仿射效果反转（反效果，比如原来扩大，就变成缩小）
        CGAffineTransformInvert(transform)


````

##  3D仿射变换

3D仿射在iOS中是通过CATransform3D实现的，它有着与CGAffineTrans类似的一组API，但他们有个重要的区别在于**CATransform3D的效果只能加在layer的transform属性上**，而CGAffineTransform直接加在View上


###  3D仿射矩

类似于2D仿射，3D仿射也有一个基础矩阵，并且比2D的多一个维度

````
    [                       ]
        m11  m12  m13  m14
        m21  m22  m23  m24
        m31  m32  m33  m34
        m41  m42  m43  m44  
    [                       ]

````

矩阵的计算过程和2D类似，最后也能得到矩阵中每个位置的值对3D仿射效果的作用。我直接把结果贴出来。

平移因子：  m41（x位置）  m42（y位置）  m43（z位置）
缩放因子：  m11（x位置）  m22（y位置）  
切变因子：  m21（x位置）  m12（y位置）  
旋转因子：  m13（x位置）  m31（y位置）  
透视因子：  m34(有旋转才能看出效果)
 

###  3D仿射常用的方法

````swift

        //位移3D仿射
        CATransform3DMakeTranslation
        CATransform3DTranslation
        
        //旋转3D仿射
        CATransform3DMakeRotation
        CATransform3DRotation
     
        //缩放3D仿射
        CATransform3DMakeScale
        CATransform3DScale

        //叠加3D仿射效果
        CATransform3DConcat
        
        //仿射基础3D方法，可以直接做效果叠加
        CGAffineTransformMake (sx,shx,shy,sy,tx,ty)

        /*
            这个是一个初始化矩阵，带入矩阵算法计算后的结构会得到
            x'=x , y'=y , z'=z
            它的作用是清除之前对矩阵设置的仿射效果，或者用来初始化一个原始无效果的仿射矩阵
            [ 1 0 0 0 ]
            [ 0 1 0 0 ]
            [ 0 0 1 0 ]
            [ 0 0 0 1 ]
        */
        CATransform3DIdentity

        //检查是否有做过仿射3D效果
        CATransform3DIsIdentity(transform)

        //检查是否是一个仿射3D效果
        CATransform3DIsAffine(transform)

        //检查2个3D仿射效果是否相同
        CATransform3DEqualToTransform(transform1,transform2)

        //3D仿射效果反转（反效果，比如原来扩大，就变成缩小）
        CATransform3DInvert(transform)

        //2D仿射转换3D仿射
        CATransform3DGetAffineTransform(transform)
        CATransform3DMakeAffineTransform(transform)

````


##  demo
---

[本文的demo下载](https://github.com/coolnameismy/demo/tree/master/AffineTransform)

本文demo是一个playground文件，做了一些2D仿射的效果。如果没有显示出UIView，可以在每一个bg对应的行后面的小圆圈点一下，就可以在playground中看见UIView对应仿射的变化

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处


##  推荐的相关文章
---

网上关于仿射的文章参考了许多，也没看到几篇质量很高的文章，基本上都没这这篇写的全，倒是有一个利用3D仿射做的一个特效还不错，大家可以看看

[iOS动效-利用CATransform3D实现翻页动画效果](http://www.jianshu.com/p/9cbf52eb39dd)





