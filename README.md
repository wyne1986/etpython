# etpython = Electron + Thinkjs + Python

## Electron + Vue + Thinkjs + Python的开发框架

* 本框架所用到的依赖框架: electron8.2.1 , vue2 , thinkjs3.2.11 , Python版本根据当前系统版本环境而来

* 由于将electron-vue的electron版本更新了到了8.2.1，因此你需要先全局安装对应版本的electron、nsis、winCodeSign及下载他们的缓存包。

* windows打包环境需要electron-builder的nsis-3.0.3.2，nsis-resources-3.3.0，winCodeSign-2.4.0。electron的electron-v8.2.1-win32-ia32.zip

* 如需运行python代码，请先确认系统内已安装代码对应版本的python环境。

## 整合该框架的缘由:

* electron的savePage可以像浏览器一样打开运行js并生成网页并保存。解决了python抓取网页目标时,可能由于网页内容加密或其他原因导致无法获取所见内容。

* electron使用H5和vue进行界面开发，开发效率和美观度比python界面开发高许多。

* 总的来说,结合了node和python的各自优势，同时加入了thinkjs可以做web服务端和定时任务器，使Electron的web服务和网络通信开发也简化了。