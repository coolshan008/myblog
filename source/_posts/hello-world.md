---
title: 这是一块碑
---

####闲话
之前使用动态博客，没过多久就迷上了静态博客。拜倒在markdown的简单粗暴上。
借着新浪云开始剥削的契机，同时借着鹅厂云1月包月VPS的春风，赶紧又弄了个新博客。立此碑。


####关于http服务的端口
默认的端口是80,由于系统的限制，各路框架都不能选用这个端口。于是催生了一系列改iptables的方案。此法过于粗暴，**我不喜欢**。其实nginx能够很好的通过端口代理解决这个问题。配置如下：

```
http{
	server{
		location /{
			proxy_pass http://localhost:yourpost;
		}
	}
}

events{
	worker_connections 1024;
}
```
然后就能通过80端口访问你指定的端口了。

#####nginx重启的小问题
把nginx进程杀死后，pid丢失，下次重启Nginx,无法通过-s reload开启服务。
解决方案：
> ginx -s reload is only used to tell a running nginx process to reload its config. After a stop, you don't have a running nginx process to send a signal to. Just run nginx (possibly with a -c /path/to/config/file)


~~**我就是那种第一篇hello,world都要加内容谨言boy+小菜机。**~~