---
layout: post
title: css选择器的用法
category: web前端
tags: css,html
description: css选择器参考
---

#  css选择器
> css选择器用好了可以减少需要js的代码，css选择器也很容易记，和jquery差不多，能用css解决的尽可能用css，少用js


1 基础选择器

- (*） ：匹配任何元素
- (element) ： 元素选择器
- (.class) ：id选择器
- (#id) ：id选择器


2 组合选择器

- (空格) ：匹配所有后代
- (,） ：css规则匹配多个对象时，用逗号分隔
- (>) ：匹配直接子元素
- (+) ：匹配元素后面的相邻兄弟元素
- (~) ：匹配所有元素后面的兄弟元素

2 组合选择器

- (空格) ：匹配所有后代
- (,） ：css规则匹配多个对象时，用逗号分隔
- (>) ：匹配直接子元素
- (+) ：匹配元素后面的相邻兄弟元素
- (~) ：匹配所有的兄弟元素


3 ccs 2.1 伪类

- E:(first-child，first-line,first-letter) ：分别匹配元素的第一个元素、第一行、第一个字母
- E:(before） ：前一个字母
- E:(after) ：后一个字母
- E:(link) ：匹配所有未被点击的元素
- E:(vistied) ：匹配所有被点击过的元素
- E:(hover) ：鼠标悬停样式
- E:(active) ：已点击但未释放的元素
- E:(focus) ：获得焦点的元素
- E:(lang(c)) ：匹配lang=c的元素，这个比较少用，可以用于多语言的页面，去选择一些特点的元素，lang属性也不一定要写在html中间，可以写在任意的元素中

- E[attr] ：根据E元素的attr属性名称匹配
- E[attr==val] ：根据E元素的attr属性的val匹配
- E[attr ~=val] ：根据E元素的attr属性值包含val匹配
- E[attr != val] ：根据E元素的attr属值以val开头
- E[attr] ：根据E元素的attr属性名称匹配
- E[attr] ：根据E元素的attr属性名称匹配



4 ccs 3 增加的伪类

- E:root ：匹配根元素 就是html元素
- E:nth-child(n) ：前n个元素
- E:nth-last-child(n) ：倒数第n个元素
- E:only-child ：匹配只有一个子元素的元素
- E:empty ：匹配没有子元素的元素
- E:not(e) 匹配不符合的元素  :not(p) {  }
- E:target ：特定id被点击后的效果

- E:enabled 匹配激活的元素
- E:disabled 匹配禁用的的元素
- E:checked ：匹配radio和checkbox选中的元素
- E:selection ：匹配当前选中的元素