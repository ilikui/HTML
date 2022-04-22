# Web基础教程

---
- [Web基础教程](#web基础教程)
    - [HTML 简介](#html-简介)
    - [HTML编辑器](#html编辑器)
    - [HTML基础](#html基础)
    - [HTML元素](#html元素)
      - [HTML元素语法](#html元素语法)
      - [嵌套的 HTML 元素](#嵌套的-html-元素)
        - [HTML文档实例](#html文档实例)
      - [HTML 实例解释](#html-实例解释)
      - [不要忘记结束标签](#不要忘记结束标签)
      - [空的 HTML 元素](#空的-html-元素)
      - [HTML 提示：使用小写标签](#html-提示使用小写标签)
    - [HTML属性](#html属性)
      - [HTML属性](#html属性-1)
      - [HTML实例](#html实例)
    - [HTML标题](#html标题)
    - [HTML段落](#html段落)
    - [HTML格式](#html格式)
    - [HTML格式化](#html格式化)
    - [HTML引用](#html引用)
    - [HTML计算机代码](#html计算机代码)
    - [HTML注释](#html注释)
    - [HTML CSS](#html-css)
    - [HTML 链接](#html-链接)
    - [HTML图像](#html图像)
    - [HTML 表格](#html-表格)
    - [HTML列表](#html列表)
    - [HTML 块](#html-块)
    - [HTML 类](#html-类)
    - [HTML 布局](#html-布局)
    - [HTML响应式设计](#html响应式设计)
    - [HTML 框架](#html-框架)
    - [HTML内联框架](#html内联框架)
    - [HTML 背景](#html-背景)
    - [HTML 脚本](#html-脚本)
    - [HTML 头部](#html-头部)
    - [HTML 实体](#html-实体)
    - [HTML URL](#html-url)
    - [HTML URL编码](#html-url编码)
    - [HTML Web服务器](#html-web服务器)
    - [HTML 颜色](#html-颜色)
    - [HTML 颜色名](#html-颜色名)
    - [HTML文档类型](#html文档类型)
- [css教程](#css教程)
- [JavaScript教程](#javascript教程)


### HTML 简介

`HTML是用来描述网页的一种语言`

* HTML指的是超文本标记语言（**H**yper **T**ext  **M**arkup **L**anguage）
* HTML不是一种编程语言，而是一种**标记语言**（markup language）
* 标记语言是一套**标记标签**（markup tag）
* HTML使是**标记标签** 来描述网页  



### HTML编辑器

HTML编辑器工具有很多，推荐如下

* [Notepad](https://notepad-plus-plus.org/)    下载地址—>[<a href="https://notepad-plus-plus.org/download/v7.6.2.html" target="_blank">Notepad</a>](https://notepad-plus-plus.org/download/v7.6.2.html)

* <a href="https://www.adobe.com/cn/products/cs6/dreamweaver.html" target="_blank">Dreamweaver CS6</a>

* <a href="https://www.sublimetext.com/" target="_blank">Subline Text</a>

* <a href="https://www.editplus.com/" target="_blank">EditPlus</a> 下载地址 —><a href="https://www.editplus.com/download.html" target="_blank">EditPlus</a>

  ​	

### HTML基础

1. HTML标题

   * 演示地址—–><a href="https://www.likui.co/HTML/HTML/CH1/title.html" target="_blank">HTML标题</a>
   * 源文件

   ```html
   <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
   <html>
       <head>
       <meta http-equiv="Content-Type" content="text/html; charset=gb2312">
       <title>这个HTML标题</title>
       </head>
       <body>
           <h1>这是一级标题</h1>
           <h2>这是二级标题</h2>
           <h3>这是三级标题</h3>
           <h4>这是四级标题</h4>
           <h5>这是五级标题</h5>
           <h6>这是六级标题</h6>
       </body>
   </html>
   ```

2. HTML段落

   * 演示地址——><a href="https://www.likui.co/HTML/HTML/CH1/passage.html" target="_blank">段落标签</a>
   * 源文件

   ```html
   <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
   <html>
       <head>
       <meta http-equiv="Content-Type" content="text/html; charset=gb2312">
       <title>这个是段落标签</title>
       </head>
   
       <body>
           <p>这是一个段落！</p>
       </body>
   </html>
   ```

3. HTML链接

   * 演示地址——><a href="https://www.likui.co/HTML/HTML/CH1/link.html" target="_blank">链接标签</a>
   * 源文件

   ```html
   <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
   <html>
       <head>
       <meta http-equiv="Content-Type" content="text/html; charset=gb2312">
       <title>链接标签</title>
       </head>
   
       <body>
        <a href="http://www.yueya.info">月牙博客</a>
       </body>
   </html>
   
   ```

   

4. HTML图像

   * 演示地址—–><a href="https://www.likui.co/HTML/HTML/CH1/image.html" target="_blank">Img标签</a>

   * `img`标签属性

   * 源文件

   ```html
   <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
   <html>
   	<head>
   	<base href="https://www.likui.co/HTML/Images/" />
   	<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
   	<title>图片属性</title>
   	</head>
   	<body>
   	<img src="FirstSegment/html.jpg"/>
   	</body>
   </html>
   ```

   

### HTML元素

`HTML元素指的是从开始标签（start tag）到结束标签(end tag)的所有代码`

| 开始标签                           | 元素内容            | 结束标签 |
| ---------------------------------- | ------------------- | -------- |
| `<p>`                              | This is a paragraph | `</p>`   |
| `<a href="https://www.baidu.com">` | This is a link      | `<a/>`   |

#### HTML元素语法

* HTML元素以开始标签开始
* HTML元素以技术标签结束
* 元素的内容都是开始标签和结束标签之间的内容
* 某些HTML元素具有空内容
* 大多数HTML元素可拥有属性

#### 嵌套的 HTML 元素

`大多数HTML元素可以嵌套`

##### HTML文档实例

``` html
<html>
    <body>
     <p>This is my first paragraph.</p>   
    </body>
</html>
```



#### HTML 实例解释

* `<p>元素`
* `<body>元素`

#### 不要忘记结束标签

#### 空的 HTML 元素

#### HTML 提示：使用小写标签

### HTML属性

#### HTML属性

> HTML=标签可以拥有**属性**。属性提供了有关HTML元素的更多信息。属性总是在HTML元素的**开始标签**中规定。

#### HTML实例

```html
<a href="http://www.yueya.info">This is a link</a>
```

> HTML 标题（Heading）是通过<h1> - <h6> 标签来定义的。

### HTML标题

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML标题</title>
</head>
<body>

    <h1>一级标题</h1>
    <h2>二级标题</h2>
    <h3>三级标题</h3>
    <h4>四级标题</h4>
    <h5>五级标题</h5>
    <h6>六级标题</h6>
    
</body>
</html>

```



### HTML段落

### HTML格式

### HTML格式化

### HTML引用

### HTML计算机代码

### HTML注释

### HTML CSS

### HTML 链接

### HTML图像

### HTML 表格

### HTML列表

### HTML 块

### HTML 类

### HTML 布局

### HTML响应式设计

###  HTML 框架

### HTML内联框架

### HTML 背景

### HTML 脚本

### HTML 头部

### HTML 实体

### HTML URL

### HTML URL编码

### HTML Web服务器

### HTML 颜色

### HTML 颜色名

###  HTML文档类型



# css教程

#  JavaScript教程























- <a href="https://www.likui.co/" target="_blank">关于我</a>

- <a href="http://www.w3school.com.cn/h.asp" target="_blank">W3CSchool</a>

- <a href="https://www.likui.co/HTML/" target="_blank">HTML</a>

  

  
