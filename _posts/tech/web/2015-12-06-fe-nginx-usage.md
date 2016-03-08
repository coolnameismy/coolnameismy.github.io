---
layout: post
title: mac环境nginx的安装和使用
category: web前端
tags:
keywords:
description:
---

>   nginx是一个轻量级服务器，特别适合一些静态资源服务，nginx是一项比较复杂的东西，我理解也不是很深，就不向大家介绍了，这里只是说一下mac环境nginx的安装和简单的使用


##  安装

-   1:下载

Download latest [nginx](http://nginx.org/) from [Nginx.org](http://nginx.org/)

-   2:安装

````
$ cd ~/Downloads
$ tar xvzf nginx-1.6.0.tar.gz
$ cd nginx-1.6.0
$ sudo ./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-cc-opt="-Wno-deprecated-declarations"
$ sudo make
$ sudo make install

````

-   3:配置环境变量

````
vim ~/.bash_profile
````

添加下面一段内容

````
#nginx config
export PATH=${PATH}:/usr/local/nginx/sbin:$PATH
````

-   4：启动,停止

```
//启动
sudo nginx

//停止
sudo nginx -s stop
nginx -s reload
nginx -t

````

-   5：常用nginx命令

````
测试nginx配置文件

nginx -t -c /etc/nginx/nginx.conf
重启nginx服务器

/etc/init.d/nginx restart
设置某脚本开机启动

sudo chmod 755 /etc/init.d/foobar
sudo update-rc.d foobar defaults     #开机时启动
sudo update-rc.d -f foobar remove　　#开机时不启动
````
##  nginx配置

mac安装后，nginx的默认配置文件位置在````/usr/local/nginx/conf````

启动后默认在80端口，就可以访问[http://localhost/](http://localhost/)了


##  nginx 评价

````
我们投资的一些公司把web平台切换到Nginx后，可以显著的解决扩展问题。Nginx明显有效的实现了今天互联网上最大网站数量的增长。

– Thomas Gieselmann, BV Capital.

我对今天运行网站的所有人的建议是，想打破性能限制就研究下能否使用Nginx。CloudFlare去年在一个相对较小的基础设施上已经扩展到可以处理每月超过150亿的浏览量，很大程度上是因为Nginx的扩展性。我的经验表明切换到Nginx可以最大限度的利用现代的操作系统和现有的硬件资源。

– Matthew Prince, CloudFlare的联合创始人和CEO

Apache和Nginx都有能力提供每秒钟庞大的请求服务，但是随着并发数量的增加，Apache的性能开始下降，然而Nginx的性能几乎不会下降。

这里最好的一点是：因为Nginx是基于事件的，它不用为每个请求产生新的进程或线程，所以它的内存使用很低。在我的基准测试中，它的内存使用坐落在2.5M，Apache使用得更多。

– WebFaction

针对Nginx v0.5.22 and Apache v2.2.8我用ab（Apache的基准测试工具）跑了一个简单的测试。在测试过程中，我用vmstat和top检测系统。结果表明在提供静态内容时，Nginx做得比Apache好。两个服务器都在并发数100时表现最佳。Apache使用4个工作进程（线程模式），30%的CPU和17MB的内存，每秒钟处理6,500次请求。Nginx使用一个工作进程，15%的CPU，1MB内存，每秒钟处理11,500次请求。

– Linux Journal

Apache好比是微软Word，它有100万个选项，但是你只需要其中6个。Nginx就处理那6项任务，但处理其中5项任务时速度比Apache快50倍。

– Chris Lea

我现在使用Nginx在单一服务器上处理每天超过数千万（也就是每秒钟几百次）的反向代理HTTP请求。在负载高峰期，它消耗大约15MB的内存和10%的CPU，在我的特定配置下（FreeBSD 6）。

在同样的负载下，Apache表现大跌（在大约使用1000个进程后，上帝知道使用了多少内存），Pound表现大跌（如此多的线程，所有的线程栈会消耗400MB以上的内存），还有Lighttpd每小时泄露20MB以上内存（使用更多CPU，但不显著）。

– Bob Ippolito in the TurboGears mailing list, 2006-08-24

我们现在使用Nginx 0.6.29的upstream hash模块为我们需要的Varnish代理提供静态杂凑。我们通常处理8-9千次请求/秒，大约1.2Gb/秒数据在几台Nginx服务器间传输，而且还有很大的成长空间。

– WordPress.com

直到今天，我们一直使用Pound来解决Justin.tv 的负载均衡。它一直使用20%的CPU，在高峰期会达到80%。在极高的负载下，它偶尔会崩溃。

我们只是切换到了Nginx，负载马上就降到了大约3%的CPU使用。我们的页面感觉更快了，尽管这可能是我的错觉。不仅它的配置文件格式容易理解和配置，而且还提供了完整的web服务器功能。我们再也没有遇到尖峰期了，而且我怀疑现有的性能会彻底打败Pound。

– Emmett Shear

我们使用Nginx作为主要的软件用于一个免费的托管平台，我已经在Nginx中开发了一个特定的模块用于banner潜入和统计计算，现在我们的中央服务器可以处理大约150-200Mbit/s高度分散的http流量（所有的文件都很小）。

我认为这是非常好的结果。因为在同样的服务器上面Apache不管怎么优化，甚至都不能处理60-80Mbit/s。

– Alexey Kovyrin

前阵子，我们把我们的前端IMAP/POP代理从perdition切换到了nginx…，现在我们又使用nginx来做前端web代理服务器…。最终的结果是，现在的每台前端代理服务器可以保持超过10,000并发（IMAP, POP, Web & SMTP）连接（其中很多还是SSL），仅仅只使用了大约10%的CPU。

– FastMail.fm blog

最近，我们的静态内容服务器切换到了Nginx，无疑这是这么多年来我印象最深刻的一款web服务器。我们运行在一台配有8G内存的机器上，但是nginx进程只使用了可笑的1.4Mb。

– Philip Jacob

我们已经用nginx取代了Squid（反向代理）+Apache的方案，平均负载和CPU使用一样降低了一半。另外我们的基准测试表明新的配置每秒钟可以处理的请求数是旧配置的2-3倍。

– HowtoForge

我们用一些CMS系统（ Wordpress, Drupal, Joomla, TYPO3等）做了基准测试，结果是Nginx提供网页的速度比Apache快了50%，同时nginx每秒钟处理的请求数(RPS)是Apache的177%

````


##  参考

-   [在mac os x 10.9.2上安装nginx](http://blog.csdn.net/eagle_naixue/article/details/26063871)
-   [nginx配置](http://blog.csdn.net/joeblackzqq/article/details/45925995)
-   [Nginx开发从入门到精通](http://tengine.taobao.org/book/)
