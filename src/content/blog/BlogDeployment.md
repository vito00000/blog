---
title: '个人博客部署'
description: '快速部署并使用属于自己的博客'
pubDate: 'January 25 2025'
heroImage: '/117092881_p2.webp'
pinned: true
---

> 概述

使用Astro框架快速搭建静态个人博客，并部署到cloudflare中。

> 环境说明

## 注册并登录到cloudflare

进入[cloudflare官网](https://dash.cloudflare.com/login)注册并登录cloudflare账号。

## 注册并登录到github

进入[github官网](https://github.com/)注册并登录github账号。

## 使用vscode制作自己的博客

进入[vscode官网](https://code.visualstudio.com/)下载vscode。

## 下载并安装Node.js

进入[Node.js](https://nodejs.cn/)下载Node.js。

> 搭建个人博客

## 使用模板

在[astro的主题页面](https://astro.build/themes)挑选要使用的模板，点击该模板的`get start`按钮即可进入对应的github仓库中，使用`git clone`将代码拷贝到本地。在代码文件夹打开cmd，输入以下指令安装运行需要的环境。

```md
npm install
```
## 修改博客

然后使用vscode打开代码文件夹即可对模板进行修改，一般模板会在README.md等文件中说明使用方法，后续修改只需看懂帖子内文字、图片、布局等的格式写法，就能在不写代码的情况下制作新的帖子。

## 本地调试

修改好后可以在vscode的终端输入以下指令：

```md
npm run dev
```
然后就可以在本地浏览器的`http://localhost:4321`访问博客了。（在终端按Ctrl+C即可停止运行）

## 上传github

在github新建一个空仓库，点击`Add file`按钮，将代码文件（如下图）上传到github中。

![上传文件到github](/togithub.webp)

## 后续修改

每当在本地修改好博客后，都可通过在代码文件打开cmd输入以下指令更新到github：

检查本地更改

```md
git status
```
添加所有更改到暂存区

```md
git add .
```
提交更改

```md
git commit -m "本次的提交信息"
```
推送更改到github

```md
git push origin main
```

> 部署到cloudflare

## 部署

在cloudflare中新建pages。

![创建pages](/PagesCreate.avif)

将github中的代码导入。

![导入代码](/pagestogit.avif)

填写你的网站名称，选择Astro框架。

![pages设置](/CloudflareCreateSet.webp)

点击`Save and Deploy`后出现以下情况，则部署成功，可以访问对应的站点查看个人博客

![pages部署成功](/PagesCreateSuccess.avif)

## 域名

如果你有自己的域名，则可以在cloudflare中进行DNS解析并使用，如果没有可以先到阿里云等平台注册自己的域名（注册需要实名和备案）。

![域名解析](/AddDomain.webp)

在注册域名的平台修改DNS解析为cloudflare提供的。

![修改DNS](/DNSSet.webp)

## 后续修改

在将修改后的代码上传到github后，cloudflare会自动配置，更新网站。

修改后用浏览器打开网站，发现有些图片没有发生变化，这个问题通常是由于浏览器缓存导致的。浏览器会缓存资源（如图片、CSS、JS 文件等），以提高加载速度，因此当更新了网站的图片或其他资源时，浏览器可能仍然显示缓存中的旧版本。在 Chrome 中，可以按 `Ctrl + F5` 或 `Shift + F5` 强制刷新页面，忽略缓存并加载最新的资源。