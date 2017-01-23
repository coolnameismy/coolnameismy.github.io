---
layout: post
title: 知乎live：一小时蓝牙科普 文字整理版
category: 技术
tags: 
---


###  简介
2017年1月18日，我进行了一次知乎live的活动，主题是： ”[知乎live：一小时蓝牙应用开发科普][106]“，感谢微信公众号，qq Babybluetooth开发群的同学们参加了活动，现在活动已经结束，我把活动中语音内容整理了文字，就是下面的内容 ~ 
 
###  什么是蓝牙4.0, 蓝牙其他标准又是什么

低功耗蓝牙(Low Energy; LE)，又视为Bluetooth Smart或蓝牙核心规格4.0版本。其特点具备节能、便于采用，是蓝牙技术专为物联网(Internet of Things; IOT)开发的技术版本。

所以它最主要的特点是低功耗，普及率高。现在所说的蓝牙设备，大部分都是在说4.0设备，ble也特指4.0设备。
在4.0之前重要的版本有[2.1版本-基本速率／增强数据率(BR/EDR)][101]和[3.0 高速蓝牙][102]版本，这些统称为经典蓝牙，

4.0还有4.1[101]和4.2的小版本，其中4.2版本对传输速率做了进一步他提升，提高了2.5倍，苹果从iphone6开始使用4.2，

 ![](http://2.bp.blogspot.com/-YA11cF3sBgw/VUIjLupD5qI/AAAAAAAABqg/P4C2RygCiTk/s1600/new.png)

最新的蓝牙标准为蓝牙5.0 

其中最大的特点连接范围扩大了4呗，速度又提高了2倍，无连接数据广播能力提高了8倍，增加了蓝牙组网的能力。2017年才开始有芯片出厂，我和Ti，nordic工程师有聊过，他们的5.0芯片都已经完成，准备量产。

###  应用侧iOS，android操作系统支持的蓝牙协议
苹果从iphone4s,ipad3,pod touch 5开始支持蓝牙4.0,android从4.3以上系统开始支持4.0，此外，苹果从iphone 6开始，支持蓝牙4.2协议，提高了数据传输速度。就如前面所说的，提高大约2.5倍。 

[蓝牙5.0][103]很期待，不过要普及到手机和其他智能设备上，可能还需要等上几年。

###  蓝牙开发必须知道的概念

**central和peripheral：**

蓝牙应用开发中，存在两种角色，分别是central和peripheral(pə'rɪfərəl) ,中文就是中心和外设。比如手机去连接智能设备，那手机就是central，智能设备就是peripheral。大多时候都是central去连接peripheral的场景，所以我们就来说他的流程

**广播和连接**

peripheral会发出广播(advertisement:ædvɚ'taɪzmənt),central扫描到广播后，可以对设备进行连接，发出connect请求，peripheral接收到请求后，同意连接后，central和peripheral就建立了连接。

**连接后的操作**

write，read，notify，indecate， response or not ...  这个在后面详细说

indecate和notify的区别就在于，indecate是一定会收到数据，notify有可能会丢失数据（不会有central收到数据的回应），write也分为response和noresponse，如果是response，那么write成功回收到peripheral的确认消息，但是会降低写入的速率。

**协议**

每个具体的智能设备，都约定了一组数据格式，这个就是数据协议，例如手环中获取到数据0X001023，其中第2位到第5位表示步数，那么就2310就是步数的16进制的数据，转换成10进制就是8976步，需要注意的是，设备端都是小端模式，所以取4位时候，高字节在前低字节在后

###  蓝牙应用的一般开发流程

已iOS为例，android也和这个是类似的。

````
1. 建立中心角色
2. 扫描外设（discover）
3. 连接外设(connect)
4. 扫描外设中的服务和特征(discover)
    - 4.1 获取外设的services
    - 4.2 获取外设的Characteristics,获取Characteristics的值，获取Characteristics的Descriptor和Descriptor的值
5. 与外设做数据交互(explore and interact)
6. 订阅Characteristic的通知
7. 断开连接(disconnect)
````

### 蓝牙的数据交互

write，read，notify，indecate， response or not ... 读写大家都是容易理解的，indecate和notify对应的是长连接，建立indecate后，peripheral可以随时往central发送数据。

indecate和notify的区别就在于，indecate是一定会收到数据，notify有可能会丢失数据（不会有central收到数据的回应），write也分为response和noresponse，如果是response，那么write成功回收到peripheral的确认消息，但是会降低写入的速率。

对于一个charateristic，他的读写订阅的权限是peripheral决定的，熟悉可以被同时设置，一般会根据外设的功能来决定。

###  蓝牙ota DFU

蓝牙ota,DFU（Device Firmware Update）指的是蓝牙设备的固件升级，其实是一整套流程，不同的蓝牙芯片，ota的流程有不同之处，我这里用ti的芯片举例。步骤为：切系统(bootloader mode)，重启，传输数据，验证数据，切系统，重启，完成。

其中数据传输也会分成很多节去发送，没法送一段数据，做一次数据校验。

###  ota存在的问题
已ti的芯片举例，他需要可以存2个image，数据传输时候需要的空间比较大，而每个智能设备的速率，功耗，存储都会有很多限制，导致很多设备会自己去实现ota的功能，自定义流程和数据传输方式，导致许多设备都是有自己私有的ota模式和协议，所以在做开发的时候，要仔细阅读设备协议中对ota的描述。

下面来说一下蓝牙开发中的一些常见的问题和坑。

### 应用如何做自动重连
其实自动重连比想象的要简单许多，无论是android还是ios端，只需要在设备断开连接的委托方法中，重新调用gatt.connet或者是centralManager.connet方法就可以了，无论当时设备是否有点，是否在周围，当设备再次开会或者连接到可连接范围内，都会自动被连上，就是这么简单。

### 连接失败处理
分两个平台来说，iOS端也有连接失败的委托，但是好像几乎不会发生这种情况，至少我从来没遇见过，而对于同款设备，android常常会出现连接失败的情况，`status != BluetoothGatt.GATT_SUCCESS`  ，android端开发请不要把连接失败和断开连接放在一块处理，因为断开连接可以直接尝试重新连接，而连接失败后尝试重新连接，需要加一些延时，并且需要gatt.close，清空一下状态，否则会把gatt阻塞导致手机不重启蓝牙就再也无法连接任何设备的情况。

### 后台运行
iOS后来运行，需要设备中info.Plist权限，key:Required background modes ,value: bluetooth-central(手机作为central) , bluetooth-peripheral（手机作为外设） [参考链接][104]

###  同时连接多个设备
android很简单，创建多个gattCallback，每个gattCallback单独管理设备连接后的操作，而iOS也最好不要创建多个CBCentralManager,多个CBCentralManager理论上可以用，但是会存在多个手机版本存在不同的行为，还有一些很容易出错的问题，这块内容不细说了。使用同一个CBCentralManager，通过进入委托的peripheral的identifier区分不同的设备，进行不同的操作和处理。
在阿里的smurfs蓝牙模块中，我使用了一个dispatcher去分发每个连接设备的事件到不同实例中进行处理。

###  扫描广播包：
所有外设，只有在发出广播包的情况下，才能被central发现，绝大多数情况下，外设被连接后就不会发出广播（也有例外），很多人遇到无法找到设备的问题，大多属于这种情况。 重复扫描问题------------------ 

###  提高蓝牙连接速度：
无论是iOS，还是android，都可以通过已绑定的设备，在不开启扫描的情况下进行快速连接，iOS需要的参数是peripheral的identifier，android需要mac地址。但android和iOS还是有一些区别的，比如iOS不能拿到已绑定的设备list，但是可以通过UUID去拿到peripheral的实例。而android可以拿到已绑定的设备list。android绑定过程需要手动调用createBond的方法，而iOS在连接成功一次后会自动绑定。 android在处理createBond时，常常会应为不同手机平台，不同设备，会产生兼容性的问题，这点需要注意。

### 定向扫描
在扫描时候可以传入serviceUUID，这样可以扫描到特定条件的设备，提高扫描的速度，排除干扰

### 如何获取mac地址
android可以直接通过getAddress得到mac地址，而iOS出于苹果的安全策略问题，无法直接获得mac地址，只能得到一个mac地址换算出来的identifier。不过在智能设备开发时，一般都会考虑到这个问题，大多数智能设备会把mac地址保存在广播数据中，不同设备可能会存在不同的位置。

###  Babybluetooth蓝牙库的使用
Babybluetooth是iOS的蓝牙库的封装，iOS蓝牙委托层级特别讨厌，一个委托接着一个委托，比如先进入扫描的委托，在进入链接的委托，在进入连接成功，发现服务，发现特征，读写操作，一套操作被拆分的很散，容易出错，代码不易维护，上手慢等缺点，Babybluetooth对CoreBluetooth进行了封装，把委托回调进行方法调用的方式，改成了链式方法顺序调用，直接调用baby.enjoy()方法，完成一整套操作。简化了上手难度和代码维护成本。现在开源在github上，有2300个star，蓝牙库中排名第一。

由于时间关系，这里不会详细介绍BabyBluetooth的使用，想连接的可以看[github bady的主页][105]

###  和大家交流时间

我的微信公众账号：
!()[https://github.com/coolnameismy/BabyBluetooth/raw/master/qrcode.jpg]

回答了大家的问题，由于问题比较多，这里就不做整理了，原知乎live活动页的地址: [知乎live：一小时蓝牙应用开发科普][106]

 
##  参考
 
[101]: http://developer.bluetooth.cn/Technology/Article/16
[102]: http://developer.bluetooth.cn/Technology/Article/35
[103]: http://developer.bluetooth.cn/Technology/Basics/Bluetooth5
[104]: https://github.com/coolnameismy/BabyBluetooth/wiki/%E5%90%8E%E5%8F%B0%E6%A8%A1%E5%BC%8F
[105]: https://github.com/coolnameismy/BabyBluetooth/
[106]: https://zhihu.com/lives/801845027214102528?utm_campaign=zhihulive&utm_source=zhihucolumn&utm_medium=Livecolumn
