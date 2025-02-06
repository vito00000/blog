---
title: '服务器迁移2'
description: '使用docker迁移前后端分离网站'
pubDate: 'February 6 2025'
heroImage: '/117092881_p3.webp'
pinned: true
---

> 在WSL上使用docker迁移前后端分离的网站到新服务器

## 环境说明

windows11自带的最新版`WSL`上运行的Linux操作系统（默认为Ubuntu）。使用[Xftp 8](https://www.xshell.com/zh/xftp-download/)传输文件。如果服务器在国外，文件传输速度慢，可以使用[cloudflare](https://dash.cloudflare.com/)的R2。

## 服务器间传输文件（方案一：Xftp 8）

创建连接

打开Xftp，点击左上角新建会话，下面是两种连接到远程服务器的方式，选择适用的即可。

使用密码连接到目标服务器。

![Xftp密码登录到服务器](/passwordtoconnect.webp)

或使用密钥文件连接到目标服务器。

需要.pri格式的密钥文件，如果本地的密钥文件格式为.pem，可以通过PuTTYgen转换文件格式。首先下载[PuTTY](https://www.putty.org/),安装后点击桌面左下角开始，找到PuTTY文件夹，里面即可找到PuTTYgen。通过PuTTYgen转换密钥文件格式,点击load,选择文件时勾选All Files(*.*),找到并打开.pem密钥文件，提示成功如下图。

![打开.pem文件成功](/pemtoprisuccess.webp)

点击`Save private key`生成对应的.ppk文件，直接修改文件后缀为.pri即可。

![生成.ppk文件](/tosaveppk.webp)

打开Xftp并按照下图进行连接（密钥文件选择生成的.pri文件）。

![Xftp密钥文件登录到服务器](/passkeytoconnect.webp)

连接成功后即可在本地windows环境下，通过可视化图形界面的方式，拖动文件进行上传和下载。

## 服务器间传输文件（方案二：cloudflare）

下载Rclone。

```md
curl -O https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip rclone-current-linux-amd64.zip
cd rclone-*-linux-amd64
```

拷贝可执行文件到 /usr/bin 目录并设置权限。

```md
sudo cp rclone /usr/bin/
sudo chown root:root /usr/bin/rclone
sudo chmod 755 /usr/bin/rclone
```

安装手册页。

```md
sudo mkdir -p /usr/local/share/man/man1
sudo cp rclone.1 /usr/local/share/man/man1/
sudo mandb
```

然后通过 rclone version 命令查看是否安装成功。

```md
rclone version
```

进入cloudflare，创建存储桶和令牌，创建令牌时注意复制一份令牌值、访问密钥ID（access_key_id）、机密访问密钥（secret_access_key）、终端网址（endpoint），然后将令牌的权限改为对象读和写。

![使用r2传输文件](/r2tp.webp)

找到配置文件路径，然后编辑配置文件。

```md
sudo nano $(rclone config file)
```

将下面的配置信息填入，其中access_key_id，secret_access_key，endpoint改为之前复制的自己令牌的信息。

```md
[r2demo]
type = s3
provider = Cloudflare
access_key_id = abc123
secret_access_key = xyz456
endpoint = https://<accountid>.r2.cloudflarestorage.com
acl = private
```

输入以下指令列出指定存储桶内项目确认下是否配置成功。

```md
rclone tree r2demo:your_bucket_name
```
注意`your_bucket_name`修改为在cloudflare中创建的数据桶名。

配置成功就可以传输文件了。

```md
rclone copy /root/test r2demo:your_bucket_name/ -P --s3-no-check-bucket
```
注意`/root/test`修改为需要传输的文件或文件夹，`your_bucket_name`修改为在cloudflare中创建的数据桶名。

## docker部署

### 安装[docker](https://www.docker.com/)环境

验证docker是否安装好:

```md
sudo docker --version
```

### 前端部分

（1）将前端项目压缩包（package.json，.next，public，next.config.mjs，Dockerfile）解压，进入文件夹运行以下指令,创建一个名为event：1.1.1的镜像。

```md
docker build -t event:1.1.1 .
```
注意`event`修改为项目名，1.1.1是标签。

然后使用该镜像启动一个容器。

```md
docker run -d -p 8080:3000 event:1.1.1
```
注意`event`修改为项目名，`1.1.1`修改为对应的标签号。

-d：以分离模式运行容器（后台运行）

-p 8080:3000：将主机的 8080 端口映射到容器的 3000 端口。

在实现event.com重定向至www.event.com后，前端容器启动命令有所改变，请看下面。

（2）使用nginx代理及重定向，在opt/nginx目录下创建nginx.conf配置文件。

实现功能：

①把event.com的所有请求重定向到www.event.com。

②把所有到www.event.com的请求反向代理到前端容器 amazing_gould上的 3000 端口，这个名字可以在配置文件里改，相应的启动时就要对应指定前端容器的名。

配置文件：

```md
worker_processes  1;

events {//定义了全局事件配置
//每个工作进程可以处理的最大并发连接数。这决定了 Nginx 可以同时处理多少个客户端连接
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Redirect non-www to www
    server {//定义了一个服务器块，处理特定的请求
        listen 80;//在 80 端口监听传入的 HTTP 请求
        server_name event.com;//此服务器块处理请求头中的 Host 为 event.com 的请求。
//将请求永久重定向 (301) 到 https://www.event.com，并保留请求的 URI 部分（路径和查询参数）。
        return 301 https://www.event.com$request_uri;
    }

    # Server Block for www
    server {
        listen       80;
        server_name  www.event.com;
        
//定义了根路径 / 的处理逻辑，即所有以 www.event.com 开头的请求。
        location / {
//将请求转发到 Docker 容器 wonderful_ganguly 上的 3000 端口
            proxy_pass http://amazing_gould:3000;
//将客户端的 Host 头转发给后端服务。            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```
注意将`event`修改为网站名称，删除注释。

（3）启动前端容器命令变为:

```md
docker run -d --name amazing_gould -p 3000:3000 event:1.1.1
```
注意`event`修改为项目名，`1.1.1`修改为对应的标签号。

nginx容器运行命令:

```md
docker run -d --name nginx   -p 80:80   -v /opt/nginx/nginx.conf:/etc/nginx/nginx.conf:ro   --link 4624d030c34c:amazing_gould   nginx:latest
```
注意`4624d030c34c`修改为之前启动的容器id（可通过sudo docker ps查看）。

查看容器详情：

```md
docker ps -a | grep nginx
```
管道符 | 将前一个命令的输出作为输入传递给下一个命令。在这里，docker ps -a 的输出会被传递给 grep 命令。

grep 是一个用于搜索文本的命令，它会从输入中筛选出包含指定字符串的行。在这个例子中，grep nginx 会筛选出所有包含“nginx”字样的行。

### 后端部分

将后端项目的jar包传输到文件夹内，运行如下指令。

```md
docker build -t server:1.1.1 .

docker run -d -p 8080:8080 server:1.1.1
```

## 数据库迁移

### （1）从旧的服务器导出数据库文件

进入MySQL容器查看要导出的数据库。

```md
sudo docker exec -it mysql mysql -u root -p
```

使用 mysqldump 命令将数据库导出。

```md
docker exec -it mysql mysqldump -u root -p event > /home/event.sql 
```
注意`event`修改为要导出的数据库，`/home/event.sql`修改为要保存到的位置。

### （2）通过上面的服务器间传输文件方法传输sql文件到新服务器

### （3）将数据库文件迁移到新的服务器

在新服务器启动MySQL容器。

```md
sudo docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -d mysql:latest
```
注意将`password`修改为数据库密码。

将数据库备份文件 event.sql 复制到容器中。

```md
sudo docker cp event.sql mysql:/event.sql
```
注意将第一个`event.sql`修改为数据库备份文件位置。

进入MySQL容器。

```md
sudo docker exec -it mysql mysql -u root -p
```

创建对应的数据库。

```md
CREATE DATABASE event;
```
注意`event`修改为数据库名。

使用以下命令导入备份文件。

```md
sudo docker exec -i mysql mysql -u root -ppassword event < event.sql
```
注意`password`修改为数据库密码，导入后再到数据库检查是否成功即可。

## 验证运行情况

先找到本地的 hosts 文件。

```md
Linux/Unix/macOS：/etc/hosts
Windows：C:\Windows\System32\drivers\etc\hosts
```
再打开 hosts 文件并添加以下内容。

```md
new_server_ip    yourdomain.com
```
注意`new_server_ip`修改为新服务器的ip，`yourdomain.com`修改为要迁移的网站。

保存文件并关闭，现在，在浏览器中访问 yourdomain.com 时，它会指向指定的新服务器 IP 地址，而不是原服务器。可以验证新服务器上的网站是否正常运行。这种方式只是针对本地的修改，不会影响其他用户。当验证完网站后，可以恢复 hosts 文件到原始状态。

## 做好数据备份