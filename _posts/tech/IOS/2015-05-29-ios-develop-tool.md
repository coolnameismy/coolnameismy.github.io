---
layout: post
title: 提高iOS开发效率的工具
category: iOS
tags: iOS,pod,cocoapods,Xcode插件
description:
---

>   iOS开发中又很多可以提高开发效率的工具，这篇文章整理我使用提高效率的工具，如果你也有一些好的工具，可以向我推荐一下。

-1  源代码依赖管理工具cocoaPods

-2  Xcode 好用的插件

## 1:源代码依赖管理工具cocoaPods

>   以来管理工具有很多，例如java的maven，android的gradle，js的bower，iOS中的cocaPods。他们可以帮你下载第三方包
>   并管理这些包的依赖关系。

---

####    安装

-   1:更新ruby环境 $ gem update rails ＝＝＝＝＝＝＝＝＝ Mac OS X 10.5以上
-   2:更新gem环境 ： gem update --system
-   3:安装cocoapods：sudo gem install cocoapods
-   4:pod setup

---

####    配置项目依赖

-   1:创建prdfile文件 :touch Podfile

-   2:输入项目依赖 vi Podfile,例如

        platform :ios, "6.1"
        pod 'MBProgressHUD', '~> 0.8'
        pod 'MapBox', '~> 1.1.0'
-   3:pod install 安装
-   4:后续打开项目文件

---

####    常用命令

-   1:查看某个库是否存在 －－$ pod search AFNetworking
-   2:更新pod －－$ pod update
-   3：安装pod  -- $ pod install


####  使用下面两条命令可以提高速度，原因是不检查spec仓库更新
-   pod install --verbose --no-repo-update
-   pod update --verbose --no-repo-update

## 2:xcode好用的插件

>   xcode插件可以大大提高开发效率

#### 插件安装方式
-   1：推荐！ 使用Alcatraz安装，commannd + sift + 9 调出图形界面，然后使用搜索插件安装
-   2：手动安装：对应有些好的插件，Alcatraz找不到的话，可以手动下载插件包，然后安装。
    安装方法：下载附件，解压后放在：你的用户/Library/Application Support/Developer/Shared/Xcode/Plug-ins目录

#### Alcatraz安装

-   作用：管理xcode插件
-   安装：命令行执行：curl -fsSL https://raw.github.com/supermarin/Alcatraz/master/Scripts/install.sh | sh
-   删除：rm -rf ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins/Alcatraz.xcplugin
-   快捷键 command + shift + 9
github地址：https://github.com/supermarin/Alcatraz

#### 推荐插件

1.  KSImageNamed
    -  Xcode资源文件在代码中添加只能感应，例如： [UIImage imageNamed: 会出现项目中的资源文件的智能感应

2.  OMColorSense
    -  Xcode 代码中可以通过选择颜色生成uicolor代码
    -  使用:先随便写个颜色，然后点击颜色行，改行的右上角会出现色快，点击可以选择颜色。或点击Xcode导航中的Edit-》insert color

3.  VVDocumenter-Xcode
    -   Xcode 按三次斜杠（///）后自动生成方法的注释

4.  fuzzyAutocomplete ，hou或是AutoresizeMask-for-Xcode
    -   加强版只能感应，只是模糊匹配,必装！

5.  SCXcodeMiniMap
    -   类似Sublime Text 右侧的迷你预览图

6.  XToDo
    -   代办列表管理
    -   支持//TODO: //FIXME: //!!!: //???: 快捷键分别是 ： control + shift + T ,control + shift + X ,control + shift + ! ,control + shift + Q
    -   打开list 快捷键control + T

7.  injectionforxcode
    -   说明：动态修改app中的样式而不需要重新编译
    -   教程：http://nonomori.farbox.com/post/injection-plugin-for-xcode
    -   快捷键：control = ：更新代码

8.  XAlign
    -   说明：自动对齐代码
    -   快捷键：command+shift+X

9.  Code Pilot
    -   xcode查找文件插件
    -   快捷键：command+shift+X,建议替换为control+X

10. CocoaPods
    -   cocoaPods插件

11. Peckham
    -   自动import头文件

12. Dash for Xcode
    -   xcode文档插件

## 最后

感谢收看，如果对大家有帮助，请[github上follow和star](https://github.com/coolnameismy)，本文发布在[刘彦玮的技术博客](http://liuyanwei.jumppo.com/)，转载请注明出处