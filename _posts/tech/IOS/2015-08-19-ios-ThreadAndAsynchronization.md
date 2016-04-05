---
layout: post
title: ios的线程和同步异步操作
category: iOS
tags: IOS,线程
keywords: IOS,异步，同步,线程
description:
---


## ios的线程和同步异步操作
> ios的多线程，同步异步操作，都是我们日常的开发中经常会遇到的问题，本文把常见的ios线程，同步异步的操作进行了整理。
---

##代码下载:

我博客中大部分示例代码都上传到了github，地址是：https://github.com/coolnameismy/demo，[点击跳转代码下载地址](https://github.com/coolnameismy/demo)

本文代码存放目录是 **ThreadAndAsynchronization**

如果大家支持，请follow我的github账号，并fork我的项目，有其他问题可以在github上给我留言或者给我发邮件，coolnameismy@hotmail.com，blog的RSS订阅地址：http://liuyanwei.jumppo.com/pages/rss.xml


##  基础知识
---

###  1.线程和进程 ,多线程

**线程和进程**：网上有一大堆很专业的说法，大多数说的都比较复杂，越复杂的解释其实说的越准确和严谨，但是常常会把人弄糊涂。这里我也不去解释了，大多数场景你可以理解为，一个应用程序就是一个进程，而一个进程可以分为多个线程

**多线程**：大多数框架都支持一个进程启多个线程，比如 c#、java、obejctive-c，但是并不是所有的框架都支持，比如flex的框架就不支持多线程。
多线程必须要有多核的cpu支持才行，对应单核cpu，无论你起多少个线程，都是在同一个cpu上跑程序，速度并不会有任何变化。对于多核cpu，多个线程会在多个cpu中同时运行，从而加快程序的执行速度。

**多线程适用场景**
最常见的是网络下载，在网络下载的适合，你总不能让程序一直无响应吧，所以你启动另一个线程去下载，留着主线程去相应用户的ui事件。多线程适合一些高io，低cpu的操作。

### 2.同步和异步，并行和串行

**同步**就是顺序往下执行。举例：烧完水后泡茶

**异步**就是几件事情同时在执行。烧水的时候拿出茶具，洗茶具，然后泡茶。其中烧水和拿茶具，洗茶具是同时进行的。

**并行和串行** 并行就是几个人同时做一件事，串行就是一个人同时做几件事。


### 3.同步异步操作和多线程的联系和区别

同步是我们一般程序顺序执行，异步是大多数时候是多线程，但是却不一定。比如方法回叫和定时执行的方法也是异步操作，单不一定全是多线程。

### 4.ios中的同步异步方法和多线程技术

1 performSelector

支持多线程和异步操作，使用简单，但是没有没有线程的一些控制和调度的操作

2 NSThread

支持多线程和异步操作，使用简单，比performSelector稍微复杂一些，performSelector背后使用的就是NSThread，但是没有没有线程的一些控制和调度的操作

3 NSTimer

不支持多线程操作，但是可以执行异步操作，异步操作很方便，最常用的就是定时执行和延迟执行某一方法

4 GCD

支持多线程，同步异步操作，线程控制，线程队列，线程信号等等，IOS和OS中最强大的线程管理都是是它了。
要说缺点的话，就是代码比较复杂，前面能实现的就用前面的把，如果实现不了，那找它准没错。

5  NSOperation

很容易实现异步队列操作，相比GCD比较简单，但功能任然没有GCD强大


##  代码例子
---

代码注释写的很全，大家直接看注释都能懂，可以在github上把代码下载下来跑跑看。

```` objective-c


//ios多线程，同步异步的使用，大家可以切换类，去掉注释跑跑看
- (void)viewDidLoad {
    [super viewDidLoad];


    //使用performSelector的多线程和异步
    //[self performSelectorFunction];

    //使用NSThread的多线程
    //[self NSThreadFunction];

    //使用NSTimer的反面教材
    //[self NSTimerFunction];

    //使用GCD的多线程
    //[self GCDFunction];

}


//耗时2秒的方法
-(void)function1{
    [NSThread sleepForTimeInterval:2];
    NSLog(@"function1 done");
}

````


## 1. performSelector的使用

````objective-c


/*
 *使用performSelector 的多线程
 *优点：简单
 *缺点：没有串行并线队列，不能实现高级线程调度
 */

-(void)performSelectorFunction{

    NSLog(@"performSelectorFunction start");

    //同步
    //方式执行，直接执行function1
    //[self performSelector:@selector(function1)];

    //异步，线程阻塞
    //延迟两秒执行function1,在function1执行期间，主线程是阻塞的，表现就是界面无响应。
    //[self performSelector:@selector(function1) withObject:nil afterDelay:2];

    //线程阻塞 最后一个参决定是同步还是异步
    // 主线程上执行，主线程阻塞，waitUntilDone:YES：等待执行完成顺序执行，waitUntilDone:NO 先执行后面语句
    //[self performSelectorOnMainThread:@selector(function1) withObject:nil waitUntilDone:NO];

    //异步，非阻塞
    //子线程上执行
    [self performSelectorInBackground:@selector(function1) withObject:nil];

    NSLog(@"performSelectorFunction end");

}

````


## 2. NSThread的使用

````objective-c

/*
 *使用NSThread 的多线程
 *优点：简单
 *缺点：没有串行并线队列，不能实现高级线程调度,和performSelector是一样的。
 */

-(void)NSThreadFunction{

    NSLog(@"NSThreadFunction start");

    //同步 阻塞
    //线程暂停 2秒
    //[NSThread sleepForTimeInterval:2];

    //异步 非阻塞
    //显示创建的方式执行
    //NSThread *myThread = [[NSThread alloc]initWithTarget:self selector:@selector(function1) object:nil];
    //[myThread start];

    //异步 非阻塞
    //静态方法执行线程
    //[NSThread detachNewThreadSelector:@selector(function1) toTarget:self withObject:nil];

    NSLog(@"NSThreadFunction end");

}

````

### 创建NSThread主要有两种方式：

-   1.使用类方法创建

```` [NSThread detachNewThreadSelector:@selector(doInBackgroud) toTarget:self withObject:nil];````

-   2.使用传统方式创建

````
 NSThread *thread = [[NSThreadalloc] initWithTarget:self selector:@selector(doInBackgroud) object:nil];
[thread start];
````


## 3. NSTimer的使用

````objective-c

/*
 *使反面教材，他不是多线程，但可以执行异步操作。最常用的就是定时执行一个任务，重复或非重复。
 */

-(void)NSTimerFunction{

    NSLog(@"NSTimerFunction start");

    //定时执行任务，可以重复和不重复
    //NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:2 target:self selector:@selector(function1) userInfo:nil repeats:NO];

    //暂时停止定时器
    //[timer setFireDate:[NSDate distantFuture]];
    //重新开启定时器
    //[timer setFireDate:[NSDate distantPast]];
    //永久通知定时器
    //[timer invalidate];
    //timer = nil;

    NSLog(@"NSTimerFunction end");

}


````

## 4. GCD的使用

GCD的方法很多，用法也很多，这里只列举一些常用的方法。常用的方法包括：

  - 同步、非阻塞执行
  - 异步非阻塞执行
  - 一次性执行
  - 延迟执行
  - 线程队列串行执行
  - 线程队列控制（屏障，同步等待，线程暂停和恢复，线程信号量控制等）


````objective-c

/*
 *使用GCD 的多线程
 *优点：有很多串行并线队列多线程，block实现线程方法，高级，好用，方法多。
 *缺点：在很多不需要高级控制线程的场景可以不用使用GCD
 */
-(void)GCDFunction{

    NSLog(@"GCDFunction start");

    //获取一个队列
    dispatch_queue_t defaultQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);

    //dispatch_async：异步方式执行方法（最常用）
    //    dispatch_async(defaultQueue, ^{
    //        [self function1];
    //    });

    //dispatch_sync：同步方式使用场景，比较少用，一般与异步方式进行调用
    //    dispatch_async(defaultQueue, ^{
    //       NSMutableArray *array = [self GCD_sync_Function];
    //       dispatch_async(dispatch_get_main_queue(), ^{
    //           //利用获取的arry在主线程中更新UI
    //
    //       });
    //    });

    //dispatch_once：一次性执行，常常用户单例模式.这种单例模式更安全
    //    static dispatch_once_t onceToken;
    //    dispatch_once(&onceToken, ^{
    //        // code to be executed once
    //        NSLog(@"dispatch_once");
    //    });

    //dispatch_after 延迟异步执行
    //    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, 2.0 * NSEC_PER_SEC);
    //    dispatch_after(popTime, defaultQueue, ^{
    //        NSLog(@"dispatch_after");
    //    });


    //dispatch_group_async 组线程可以实现线程之间的串联和并联操作
    //    dispatch_group_t group = dispatch_group_create();
    //    NSDate *now = [NSDate date];
    //    //做第一件事 2秒
    //    dispatch_group_async(group, defaultQueue, ^{
    //        [NSThread sleepForTimeInterval:2];
    //         NSLog(@"work 1 done");
    //    });
    //    //做第二件事 5秒
    //    dispatch_group_async(group, defaultQueue, ^{
    //        [NSThread sleepForTimeInterval:5];
    //        NSLog(@"work 2 done");
    //    });
    //
    //    //两件事都完成后会进入方法进行通知
    //    dispatch_group_notify(group, defaultQueue, ^{
    //        NSLog(@"dispatch_group_notify");
    //        NSLog(@"%f",[[NSDate date]timeIntervalSinceDate:now]);//总共用时5秒，因为2个线程同时进行
    //    });


    //dispatch_barrier_async :作用是在并行队列中，等待前面的队列执行完成后在继续往下执行
    //    dispatch_queue_t concurrentQueue = dispatch_queue_create("my.concurrent.queue", DISPATCH_QUEUE_CONCURRENT);
    //    dispatch_async(concurrentQueue, ^{
    //        [NSThread sleepForTimeInterval:2];
    //        NSLog(@"work 1 done");
    //    });
    //    dispatch_async(concurrentQueue, ^{
    //        [NSThread sleepForTimeInterval:2];
    //        NSLog(@"work 2 done");
    //    });
    //    //等待前面的线程完成后执行
    //    dispatch_barrier_async(concurrentQueue, ^{
    //         NSLog(@"dispatch_barrier_async");
    //    });
    //
    //    dispatch_async(concurrentQueue, ^{
    //        [NSThread sleepForTimeInterval:3];
    //        NSLog(@"work 3 done");
    //    });



    //dispatch_semaphore 信号量的使用，串行异步操作
    //    dispatch_semaphore_create　　　创建一个semaphore
    //　　 dispatch_semaphore_signal　　　发送一个信号
    //　　 dispatch_semaphore_wait　　　　等待信号


    /*应用场景1：马路有2股道，3辆车通过 ，每辆车通过需要2秒
     *条件分解:
        马路有2股道 <=>  dispatch_semaphore_create(2) //创建两个信号
        三楼车通过 <=> dispatch_async(defaultQueue, ^{ } 执行三次
        车通过需要2秒 <=>  [NSThread sleepForTimeInterval:2];//线程暂停两秒
     */

    dispatch_semaphore_t semaphore = dispatch_semaphore_create(2);

        dispatch_async(defaultQueue, ^{
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
            [NSThread sleepForTimeInterval:2];
            NSLog(@"carA pass the road");
            dispatch_semaphore_signal(semaphore);
        });
        dispatch_async(defaultQueue, ^{
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
            [NSThread sleepForTimeInterval:2];
            NSLog(@"carB pass the road");
            dispatch_semaphore_signal(semaphore);
        });
        dispatch_async(defaultQueue, ^{
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
            [NSThread sleepForTimeInterval:2];
            NSLog(@"carC pass the road");
            dispatch_semaphore_signal(semaphore);
        });



    //应用场景2 ：原子性保护，保证同时只有一个线程进入操作
    //    dispatch_semaphore_t semaphore = dispatch_semaphore_create(1);
    //    for(int i=0 ;i< 10000 ;i++){
    //        dispatch_async(defaultQueue, ^{
    //            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    //            NSLog(@"i:%d",i);
    //            dispatch_semaphore_signal(semaphore);
    //        });
    //    }


    NSLog(@"GCDFunction end");
}



````

## 5.NSOperation的用法

### 基本用法

NSOperation需要在NSOperationQueue中使用，通过queue可以实现先进先出的队列任务，可以添加或取消任务，NSOperation有2个重要的子类，分别是：NSInvocationOperation，NSBlockOperation，分别表示调用一个方法或调用一个block的任务。
NSOperation是比GCD更高层次的api，相同的线程操作如果能用NSOperation操作就尽量用，不能实现的线程操作才使用GCD.相比GCD，NSOperation还有个好处，就是任务可以被取消，而GCD不可以。

````objc

-(void)NSOperationFunction{
    NSOperationQueue *queue = [[NSOperationQueue alloc]init];
    //设置队列最大同时进行的任务数量，1为串行队列
    [queue setMaxConcurrentOperationCount:1];
    //添加一个block任务
    [queue addOperationWithBlock:^{
       sleep(2);
        NSLog(@"block task 1");
    }];
    [queue addOperationWithBlock:^{
        sleep(2);
        NSLog(@"block task 2");
    }];
    //显示添加一个block任务
    NSBlockOperation *block1 = [NSBlockOperation blockOperationWithBlock:^{
        sleep(2);
        NSLog(@"block task 3");
    }];
    //设置任务优先级
    //说明：优先级高的任务，调用的几率会更大,但不表示一定先调用
    [block1 setQueuePriority:NSOperationQueuePriorityHigh];
    [queue addOperation:block1];

    NSBlockOperation *block2 = [NSBlockOperation blockOperationWithBlock:^{
        sleep(2);
        NSLog(@"block task 4，任务3依赖4");
    }];
    [queue addOperation:block2];
    //任务3依赖4
    [block1 addDependency:block2];
    //设置任务完成的回调
    [block2 setCompletionBlock:^{
         NSLog(@"block task 4 comlpete");
    }];

    //设置block1完成后才会继续往下走
    [block1 waitUntilFinished];
     NSLog(@"block task 3 is waitUntilFinished!");

    //初始化一个子任务
    NSInvocationOperation *oper1 = [[NSInvocationOperation alloc]initWithTarget:self selector:@selector(function1) object:nil];
    [queue addOperation:oper1];

    [queue waitUntilAllOperationsAreFinished];
    NSLog(@"queue comlpeted");

    //    取消全部操作
    //    [queue cancelAllOperations];
    //    暂停操作/恢复操作/是否暂定状态
    //    [queue setSuspended:YES];[queue setSuspended:NO];[queue isSuspended];


    //操作优先级



    //      [queue waitUntilAllOperationsAreFinished];

````

执行结果

````
2016-02-04 15:11:54.283 ThreadAndAsynchronization[28948:3783683] block task 1
2016-02-04 15:11:56.358 ThreadAndAsynchronization[28948:3783684] block task 2
2016-02-04 15:11:58.430 ThreadAndAsynchronization[28948:3783683] block task 4，任务3依赖4
2016-02-04 15:11:58.430 ThreadAndAsynchronization[28948:3783694] block task 4 comlpete
2016-02-04 15:12:00.504 ThreadAndAsynchronization[28948:3783683] block task 3
2016-02-04 15:12:00.504 ThreadAndAsynchronization[28948:3783527] block task 4 is waitUntilFinished!
2016-02-04 15:12:02.573 ThreadAndAsynchronization[28948:3783694] function1 done
2016-02-04 15:12:02.573 ThreadAndAsynchronization[28948:3783527] queue comlpeted
````


有2个值得注意的地方，第一个是mainQueue，第二个是maxConcurrentOperationCount。

mainQueue是通过 ````NSOperationQueue *mainQueue = [NSOperationQueue mainQueue];```` 获取到，它代表主队列，也就是UI队列，所以用到mainQueue队列的时候一般用于更新ui界面，且特别注意在这个队列中执行的方法，要考虑到会不会阻塞进程。

maxConcurrentOperationCount：最多有多少个队列可以同时执行，默认是5，当设置为1是，队列是一个串行队列，设置>1时，队列是一个并行队列。但是在主队列上设置同时执行的任务是没有效果的！如果没有设置最大并发数，那么并发的个数是由**系统内存和CPU决定的**，可能内存多久开多一点，内存少就开少一点。

### 队列的取消，暂停和恢复

-   取消队列的所有操作 ```` [queue cancelAllOperations];````
-   暂停队列恢复

````
//    [queue setSuspended:YES];
//    [queue setSuspended:NO];
//    [queue isSuspended];
````

###  优先级
、、、、objc
     //显示添加一个block任务
      NSBlockOperation *block1 = [NSBlockOperation blockOperationWithBlock:^{
          sleep(2);
          NSLog(@"block task 3");
      }];
      //设置任务优先级
      //说明：优先级高的任务，调用的几率会更大,但不表示一定先调用
      [block1 setQueuePriority:NSOperationQueuePriorityHigh];

      [queue addOperation:block1];
、、、、

优先级高的任务，调用的几率会更大,但不表示一定先调用

###  操作依赖

````objc
    //block1依赖block2
    [block1 addDependency:block2];
````

### 操作完成的监听

````objc
    //设置任务完成的回调
    [block2 setCompletionBlock:^{
         NSLog(@"block task 4 comlpete");
    }];
````

除了这个方法以外，还可以调用 ````waitUntilFinished````方法，等待完成操作或队列全部完成后继续执行代码。这是一个很好的顺序执行代码的异步编程最佳实践！

queue也有对应的方法，叫做````waitUntilAllOperationsAreFinished````

```
  [queue waitUntilAllOperationsAreFinished];
   NSLog(@"queue comlpeted");
````

### 更好的控制NSOperation

如果这些自带的api还不能满足你对线程和队列任务的控制，你可以尝试继承NSOperation，重写一些关键方法。



##  代码下载:

####    我博客中大部分示例代码都上传到了github，地址是：https://github.com/coolnameismy/demo，[点击跳转代码下载地址](https://github.com/coolnameismy/demo)
####    本文代码存放目录是ThreadAndAsynchronization

## 最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处