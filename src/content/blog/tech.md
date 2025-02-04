---
title: '服务器迁移'
description: '将网站从原服务器上迁移到新服务器'
pubDate: 'February 4 2025'
heroImage: 'https://imagedelivery.net/6gszw1iux5BH0bnwjXECTQ/fc027225-c8ad-4d9b-6fb7-bb10eb990b00/small'
pinned: true
---

> 以下是本人作为小白在服务器迁移时总结的步骤

## 环境说明

windows11自带的最新版`WSL`上运行的Linux操作系统（默认为Ubuntu）

## 登录到服务器

使用密钥文件连接到目标服务器

```md
ssh -i ~/.ssh/key.pem username@ip
```

注意`key.pem`修改为你的密钥文件名，`username`修改为连接使用的用户名，`ip`修改为连接的服务器ip。

或使用密码连接到目标服务器

```md
ssh username@ip
```
注意`username`修改为连接使用的用户名，`ip`修改为连接的服务器ip,输入指令后提示输入密码，输入即可（输入的密码不会显示）。

## 配置服务器环境

php环境配置可以通过LNMP一键安装包进行下载安装

```md
wget http://soft.lnmp.com/lnmp/lnmp2.1.tar.gz -O lnmp2.1.tar.gz && tar zxf lnmp2.1.tar.gz && cd lnmp2.1 && ./install.sh lnmp
```

下载时遇到权限问题切换root用户

```md
sudo -i
```

安装完成后检查服务是否成功运行
（以下指令分别检查MySQL服务状态、Nginx 服务状态、PHP-FPM 服务状态）

```md
sudo systemctl status mysql

sudo systemctl status nginx

sudo systemctl status php-fpm
```

## 添加虚拟主机

一般情况下每个虚拟主机就是一个网站，网站一般通过域名进行访问。

```md
lnmp vhost add
```
运行后会出现一些提示，根据需求选择即可。

![虚拟主机设置](/vhost.avif)

## 服务器间文件传输

在原服务器中压缩网站代码所在的文件夹

```md
tar -czvf archive_name.tar.gz /path/to/directory
```
注意`archive_name`修改为压缩后压缩包的名字，`/path/to/directory`修改为文件夹路径。

将压缩包传输到新的服务器

```md
scp -i /path/to/private-key.pem /path/to/local-backup-file.tar.gz username@remote-ip:/path/to/remote/directory/
```
注意`/path/to/private-key.pem`修改为目标服务器的密钥文件，`/path/to/archive_name.tar.gz`修改为需要传输的压缩包，`username`修改为连接使用的用户名，`remote-ip`修改为连接的服务器ip，`/path/to/remote/directory/`修改为要保存到新服务器中的位置。

在新服务器中解压网站的文件夹

解压网站文件到指定目录（一般在/home/wwwroot/里可以看到添加虚拟主机时创建的文件夹，请将文件压缩到这里）


```md
tar -xzvf /path/to/archive_name.tar.gz -C /path/to/new/directory/
```
注意`/path/to/archive_name.tar.gz`修改为传输来的压缩包，`/path/to/new/directory`修改为新创建的目录。

创建新目录（如果不存在的话）
```md
mkdir -p /path/to/new/directory
```
注意`/path/to/new/directory`修改为要创建的目录。

## 数据库迁移

在原服务器中将数据库导出为 SQL 文件

```md
mysqldump -u username -p database_name > /path/to/destination/database_name.sql
```
注意`username`修改为数据库用户名，`database_name`修改为需要迁移的数据库，`/path/to/destination/database_name.sql`修改为SQL文件要保存位置和名称。

将SQL文件传输到新服务器，操作见上：服务器间文件传输。

在新服务器上创建数据库（如果尚未创建）

```md
mysql -u username -p -e "CREATE DATABASE database_name;"
```
注意`username`修改为数据库用户名，`CREATE DATABASE database_name`修改为数据库名称。

通过 mysql 命令将导出的 SQL 文件导入到目标服务器上的数据库中。

```md
mysql -u username -p database_name < /path/to/database_name.sql
```
注意`username`修改为数据库用户名，`database_name`修改为数据库名称，`/path/to/database_name.sql`修改为传输的原数据库SQL文件。

## 验证运行情况

验证网站能在新服务器上成功运行

修改本地的 hosts 文件（临时修改 DNS 解析）

找到本地的 hosts 文件。

```md
Linux/Unix/macOS：/etc/hosts
Windows：C:\Windows\System32\drivers\etc\hosts
```
打开 hosts 文件并添加以下内容

```md
new_server_ip    yourdomain.com
```
注意`new_server_ip`修改为新服务器的ip，`yourdomain.com`修改为要迁移的网站

保存文件并关闭，现在，在浏览器中访问 yourdomain.com 时，它会指向指定的新服务器 IP 地址，而不是原服务器。可以验证新服务器上的网站是否正常运行。这种方式只是针对本地的修改，不会影响其他用户。当验证完网站后，可以恢复 hosts 文件到原始状态。

## 数据备份

将原服务器中的数据做好备份（保存到自己的电脑，在自己的WSL上输入以下指令）

```md
scp -i /path/to/your/private-key.pem username@remote-ip:/path/to/remote/file /mnt/c/Users/Administrator/Desktop
Desktop
```
注意`/path/to/your/private-key.pem`修改为服务器的密钥，`username`修改为连接使用的用户名，`remote-ip`修改为连接的服务器ip，`/path/to/remote/file`修改为要备份的文件，`/mnt/c/Users/Administrator/Desktop`是保存到本地桌面，可修改为其他位置。