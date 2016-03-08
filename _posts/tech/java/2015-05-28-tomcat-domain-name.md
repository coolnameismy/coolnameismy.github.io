---
layout: post
title: tomcat部署绑定多个域名
category: 技术
tags: tomcat
keywords: tomcat 
description:
---

#####  1:设置域名解析 ：过程省略

#####  2:打开tomcat\conf 下的server.xml

#####  3: 配置80端口，并增加host代码段

找到原来connector的位置，修改port</br>
````
<Connector port="80" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="7443" />
````

找到原来host的结束符，添加内容，name换成你自己的域名，appBase对于tomcat下webapps/ROOT/PlantAssistantApi路径。注意，**多了一级ROOT路径**
</br>
````
    <Host name="plantassistantapi.jumppo.com"  appBase="webapps/PlantAssistantApi"  unpackWARs="true" autoDeploy="true" />
````

##### 4:若添加多个域名，可以添加多个Host段落