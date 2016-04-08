


##  优化命令

使用alias命令可以缩短我们的命令行

````
alias weather='curl -4 wttr.in'
````

这样输入weather就可以查看到当前的天气了，但是有个问题，我们想查看别的地方天气时候，需要带一个参数，如何设置alias带参数呢？

alias本身是不支持参数的，但是可以利用function实现alias参数功能，看一个简单的例子：

````
blah='function _blah(){ echo "First: $1"; echo "Second: $2"; };_blah'
````

输入就blah a b ，就可以打印出输出的参数了，那么我们来改一下weather的alias，改成

````
weather='function _weather(){ curl -4 wttr.in/"$1";};_weather'
````

我们在试一下 `weather nanjing` ，返回效果，可以看到，参数起作用了~


##  参考链接

-[https://davidwalsh.name/get-weather-command-link](https://davidwalsh.name/get-weather-command-line)
