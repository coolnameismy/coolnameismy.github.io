---
layout: post
title: hello nodemcu
category: IoT
---

我的同事里有很多geek,上午被介绍了一块nodemuc的单片机，10分钟驱动安装，刷系统，写代码就变成了一个基于mqtt的物联网设备，确实觉得非常简单和方便，所以也做个简单的使用介绍，和大家一起玩一玩。

nodemuc官方介绍：这是一款开源快速硬件原型平台，包括固件和开发板，用几行简单的Lua脚本就能开发物联网应用。它的特点就是1：api简单，2：支持lua和node，3价格便宜。

官网地址：[http://nodemcu.com/](http://nodemcu.com/)


## mac环境10分钟完成跑起来

### 1：连接设备

首先把芯片通过usb和mac进行连接，连接后在终端中输入 ```` ls /dev/tty.SLA* ````  看到有 ```` /dev/tty.SLAB_USBtoUART ```` 显示，说明已经正确连接，否则需要安装驱动程序，驱动下载地址：[下载页面](http://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers),打开下载页面，选择你电脑的平台，这里选择 Download for Macintosh OSX (v4) ，下载后直接安装后就可以找到设备了。

### 2：安装操作系统
nodemuc出厂的操作系统并不好，我们使用mongoose OS，直接使用node api，有很有的的demo示例，使用超级简单。 [官网](https://mongoose-os.com/) 

在mac中直接使用命令行安装:  ```` curl -fsSL https://mongoose-os.com/downloads/mos/install.sh | /bin/sh ````

### 3:mongoose os使用
 安装成功后输入 ```` cd .mos/bin/ ```` 进入os的应用目录 ,可以输入 ```` ./mos --help ```` 查看帮助， 首先我们配置一下wifi环境，输入命令 ```` ./mos wifi <wifi-ssid> <password> ```` 第一个参数是wifi的ssid，就是wifi名称，第二个参数是密码。 接着输入 ```` ./mos ```` 会启动一个web界面，通过web界面可以对os进行操作。点击 switch to protyping mode,进入主系统。

 ![]({{site.url}}/assets/uploads/mongooseos.png)

 ![]({{site.url}}/assets/uploads/mongooseos1.png)


### 4:编写mqtt的client代码

系统启动后会执行init.js文件，通过修改init.js文件，点击save & reboot就可以重启后执行。 开始玩的时候我还傻傻的问了一个问题，怎么跑后台进程和服务？ 答案是单片机不支持多进程 :) ，所以我也是新手，和大家一起学习中。

mqtt在mos的使用方式：

````js
// Load Mongoose OS API
load('api_mqtt.js');

//定义主题名称，#是通配符 'my/topic/#'
let topic = 'my/topic/1';

//订阅topic
MQTT.sub(topic, function(conn, topic, msg) {
  print('Topic: ', topic, 'message:', msg);
}, null);

//发消息到topic,参数：topic,数据，数据长度
var data = "aaa";
MQTT.pub(topic,data,data.length); 
````

### 5:在mqtt borker中查看结果

mos有个默认的mqtt borker服务端，地址是:[http://www.hivemq.com/demos/websocket-client/](http://www.hivemq.com/demos/websocket-client/),可以进入网页，这个网站的名字叫做HIVEMQ。 进入后首先点击右侧的 "add new topic subscription",增加一个主题，然后在左侧的用相同主题发送数据，在messages中就可以看到。那么在nodemcu中发送相同topic的数据，HIVEMQ也同样可以看到。

注意，mos的mqtt borker地址配置可以在configuratio中修改，也可以通过命令修改，比： ```` mos config-set mqtt.server=broker.hivemq.com:1883 ````

![]({{site.url}}/assets/uploads/hivemq.png)


## 总结

这样一个基于nodemcu的一个mqtt client端就跑起来了，下一篇我会写如果在mcu中添加一下交互，比如按钮和一些传感器。


