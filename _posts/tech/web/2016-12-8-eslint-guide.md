---
layout: post
title: ESLint使用
category: web前端
---


ESLint是一个QA工具，用来避免低级错误和统一代码的风格。
 
常用的类似代码检测工具有4个，JSLint、JSHint、JSCS、ESLint，其中ESLint比较好的一个（ [原因可以看这篇文章分析](http://zhenhua-lee.github.io/tools/linter.html) ）


## 常用命令

`npm install -g eslint`

`eslint --init`

`eslint [options] [file|dir|glob]*`

举例：

````
eslint file1.js file2.js
eslint lib/**
eslint . --ext .js --ext .js2
eslint -c ~/my-eslint.json file.js
eslint -o ./test/test.html
eslint --max-warnings 10 file.js
````

[options详细参考](http://eslint.cn/docs/user-guide/command-line-interface)
 
 

## 快速上手试一试

我们init时选择 use a popular style guide => google style, 然后安装一下google style到全局，否则会报错

` npm install -g eslint-config-google `

先写一个测试的index.js文件，测试一下验证
 
````js
	var a = "sadas"
	var b = "sadas";
	var c = 'sada';
	var c = a;
````

执行： `eslint index.js` 

出现验证结果：

````
/Users/xuanyan.lyw/foo/ESLint/foo/index.js
  1:1   error  Unexpected var, use let or const instead  no-var
  1:9   error  Strings must use singlequote              quotes
  1:16  error  Missing semicolon                         semi
  2:1   error  Unexpected var, use let or const instead  no-var
  2:5   error  'b' is assigned a value but never used    no-unused-vars
  2:9   error  Strings must use singlequote              quotes
  4:1   error  Unexpected var, use let or const instead  no-var
  4:5   error  'c' is assigned a value but never used    no-unused-vars
  6:1   error  Unexpected var, use let or const instead  no-var

✖ 9 problems (9 errors, 0 warnings)
````

可以看出每个错误的大致出错问题 ，大概是，

- es6语法尽量推荐使用let代替var去申明变量，var和let在作用域有些微差别，容易导致那一察觉的bug。 
- string规范使用双引号而不要用单引号
- 每一句语句不能省略分号
- 变量定义未使用

[google js 推荐规范](https://google.github.io/styleguide/jsguide.html)

## 配置

#### 获取预置配置

ESLint预置了几个验证规则，google，airbnb等待，在配置文件中使用 

````
module.exports = {
    "extends": "google"
};
````

如果指定文件，可以使用下面这种方式

````
 "extends": [
        "./node_modules/coding-standard/eslintDefaults.js",
        "./node_modules/coding-standard/.eslintrc-es6",
        "./node_modules/coding-standard/.eslintrc-jsx"
    ],
````

demo中我们使用了google风格，可以在路径 node_modules/eslint-config-google/index 看到eslint的配置，我们截取一段如下：

````json
 	'padded-blocks': [2, 'never'],
    'quote-props': [2, 'consistent'],
    'quotes': [2, 'single', {allowTemplateLiterals: true}],
    'require-jsdoc': [2, {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
      },
    }],
    'semi-spacing': 2,
    'semi': 2,
````

#### 警告级别

- "off" 或 0 - 关闭规则
- "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
- "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)

例如： `'quotes': [2, 'never'], ` 就是这个错误会表示为warn



## 通过注释灵活改变一些规则

比如我们现在把代码修改成

````js
var a = "sadas"
/* eslint-disable */
var b = "sadas";
var c = 'sada';
var c = a;
````

这样，从第三行开始所有问题都不会再有错误信息，执行`eslint index.js` 后的信息

````
  2:1   error  Unexpected var, use let or const instead  no-var
  2:9   error  Strings must use singlequote              quotes
  2:16  error  Missing semicolon                         semi
✖ 3 problems (3 errors, 0 warnings)
````

可以看到，结果如我们预期

如果恢复错误，可以使用 /* eslint-enable */，我们把源码改成

````js
/* eslint-disable */
var a = "sadas"
var b = "sadas";
var c = 'sada';
/* eslint-enable */
var c = a;
````

这样，，只会最后一行才会有错误信息，此外还可以设置禁止和启用的具体规则

注释的规则可以使用 ` /* */ 或 // `  作用域分别是整个文件注释和单行

## 检查规则

规则主要分为 可能的错误检查，最佳实践，变量检查，node和commonjs检查，风格，es6,过期和移除的方法检查， [完整的检查规则详细内容点击这里](http://eslint.cn/docs/rules/) 

下一篇我们试试一起去自定义规则


## 引用和推荐阅读

- [ESLint中文网](http://eslint.cn/)
- [ESLint官网](http://eslint.org/)
- [google js 推荐规范](https://google.github.io/styleguide/jsguide.html)