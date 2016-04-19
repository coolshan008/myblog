---
title: centos7 架设OpenConnect Server
date: 2016-04-20 01:14:58
tags:
- 折腾
- VPN
---
由于学习上的需要，最近开始折腾起了科学上网之方。首选为ss，但是ios上的应用已经被下架，只能自己移植一份了。目前仍在学习，为了解燃眉之急，在各路找资料折腾起openConnect的架设方法。总的来说这方面资料还是挺容易找到的,但是有一个比较坑爹的地方在于通过证书登录服务器的配置方法。

### 系统要求
Centos7(libgnutls-dev等依赖库在6.x等系统中版本过低，如果选用的话需要花大量时间用与解决这方面的问题，因此不是必须的话推荐你使用7）。

#### 步骤
**1.一键安装脚本传送门：**[安装脚本](https://github.com/travislee8964/Ocserv-install-script-for-CentOS-RHEL-7)

使用这个脚本真的感觉自己是傻瓜（我很自豪的说之前在centos6配置的时候自己折腾了一波），使用这个脚本可能遇到的一个问题是关于系统的防火墙的。我使用的VPS由于服务商的原因，系统防火墙处于异常关闭状态。而这个脚本要求运行时firewalld 或 iptables必须有一个正常运行，这样才能配置系统的路由表及端口的开放。查资料可知centos从7.0开始默认防火墙服务为firewalld，也可以关闭firewalld选择使用旧版的iptables（系统没有，请yum install iptables自行安装，更换服务方法具体方法请自行google)。我的firewalld出了问题，因此我选用了Iptables。

**2.安装完成后，如果你觉得愿意每次通过密码连接vpn的话，后面的内容不需要看啦。根据服务器配置使用app即可**


**3.证书登录：**

  - 先准备好certtool命令
```shell
$ mkdir certificates
$ cd certificates
```

  - CA模板，创建ca.tmpl，按需填写，这里的cn和organization可以随便填。

```
cn = "Your CA name" 
organization = "Your fancy name" 
serial = 1 
expiration_days = 3650
ca 
signing_key 
cert_signing_key 
crl_signing_key
```

  - CA密钥
```shell
$ certtool --generate-privkey --outfile ca-key.pem
```

  - CA证书
```shell
$ certtool --generate-self-signed --load-privkey ca-key.pem --template ca.tmpl --outfile ca-cert.pem
```

**同理用CA签名生成服务器证书:**

  - 先创建server.tmpl模板。这里的cn项必须对应你最终提供服务的hostname或IP，否则AnyConnect客户端将无法正确导入证书。
```
cn = "Your hostname or IP" 
organization = "Your fancy name" 
expiration_days = 3650
signing_key 
encryption_key
tls_www_server
```
  - Server密钥
```shell
$ certtool --generate-privkey --outfile server-key.pem
```

  - Server证书
```shell
$ certtool --generate-certificate --load-privkey server-key.pem --load-ca-certificate ca-cert.pem --load-ca-privkey ca-key.pem --template server.tmpl --outfile server-cert.pem
```

  - 将CA，Server证书与密钥复制到以下文件夹
```shell
$ sudo cp ca-cert.pem /usr/local/etc/ocserv/ca-cert.pem
$ sudo cp server-cert.pem /usr/local/etc/ocserv/server-cert.pem
$ sudo cp server-key.pem /usr/local/etc/ocserv/server-key.pem
```

**用户证书：**

  - 创建user.tmpl
```
cn = "random name"
unit = "random name"
uid = "2.5.4.3"
expiration_days = 365
signing_key
tls_www_client
```
> **非常重要：一定要加上uid项，很多很多教程都没有，结果我走了很多弯路**

  - User密钥
```shell
$ certtool --generate-privkey --outfile user-key.pem
```

  - User证书
```shell
$ certtool --generate-certificate --load-privkey user-key.pem --load-ca-certificate ca-cert.pem --load-ca-privkey ca-key.pem --template user.tmpl --outfile user-cert.pem
```

  - 然后要将证书和密钥转为PKCS12的格式。
```shell
openssl pkcs12 -export -inkey user-key.pem -in user-cert.pem -certfile ca-cert.pem -out client.user.p12
```

注意这里用openssl代替certtool生成客户端证书，使用certtool生成的证书导入iOS会出错。

然后我们要通过URL将user.p12文件导入AnyConnect，具体位置在诊断标签页的证书栏目下。如果你的服务器已经有Nginx/Apache服务，只要传到一个可以访问的URL路径下即可。然后使用邮件发送到ios设备上，下载附件安装证书即可。


**接下来配置ocserv的配置文件：**
```shell
$ sudo vim /usr/local/etc/ocserv/ocserv.conf
```
  - 改以下内容：
```
# 改为证书登陆，注释掉原来的登陆模式
auth = "certificate"
```
  - 添加
```
ca-cert=/usr/local/etc/ocserv/ca-cert.pem  
到server-key=/usr/local/etc/ocserv/server-key.pem下面
将cert-user-oid的值改为2.5.4.3
```

**4.安装ios应用anyconnect，然后根据你的服务器配置设置信息，选择使用刚才安装的证书登录即可番茄。**