import { app, BrowserWindow, ipcMain } from 'electron'
const path = require('path')

let swin;
let win;
let url = '';
let filepath = '';
let loading = false;
let ipcMessage = {};
let sti = null
let timeout = 0;
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  win = new BrowserWindow({
    width: 1240,
    height: 960,
    autoHideMenuBar:true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.openDevTools()

  win.loadURL(winURL)

  win.on('closed', () => {
    win = null
  })

  if(!swin){
    createSwindow();
  }
}

function createSwindow(){
  swin = new BrowserWindow({
    closable:false,
    show: false
  })

  //监听url打开成功并保存网页
  swin.webContents.on('did-finish-load', async () => {
    swin.webContents.savePage(filepath, 'HTMLOnly').then(() => {
      ipcMessage = {code:0,message:'success'};
      loading = false;
    }).catch(err => {
      ipcMessage = {code:403,message:err.message}
      loading = false;
    })
  })

  //监听url打开结果失败
  swin.webContents.on('did-fail-load', async () => {
    ipcMessage = {code:407,message:'网页加载失败'}
    loading = false;
  })

  swin.on('close',()=>{
    swin = null;
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('downloadurl',(event, arg)=>{
  win.webContents.downloadURL(arg)
})

//接收ipc消息,打开url
ipcMain.on('openurl', (event, arg) => {
  try {
    win.setClosable(false);
    var jsons = JSON.parse(arg);
    if(!jsons['url'] || !jsons['filepath']){
      event.reply('openfinish', JSON.stringify({code:401,message:'param require',data:jsons}))
      win.setClosable(true);
      return;
    }
    //设置变量
    filepath = jsons['filepath'];
    url = jsons['url'];
    //检查保存目录
    if(!mkdirs(path.dirname(filepath))){
      event.reply('openfinish', JSON.stringify({code:500,message:'文件夹创建失败'}))
      win.setClosable(true);
      return;
    }
    //检查url
    if(url.indexOf('http')!==0){
      event.reply('openfinish', JSON.stringify({code:405,message:'url地址不正确'}))
      win.setClosable(true);
      return;
    }
    if(!swin){
      event.reply('openfinish', JSON.stringify({code:301,message:'准备中,请稍后'}))
      win.setClosable(true);
      return;
    }
    if(loading){
      event.reply('openfinish', JSON.stringify({code:302,message:'等待上一个执行完毕,请稍后'}))
      win.setClosable(true);
      return;
    }
    loading = true;
    //加载网页
    swin.loadURL(url)
    //定时监听是否保存完毕则返回消息
    sti = setInterval(function(){
      if(!loading){
        clearInterval(sti);
        sti = null;
        event.reply('openfinish',JSON.stringify(ipcMessage));
        win.setClosable(true);
        timeout = 0;
        return
      }
      if(timeout>=100){
        clearInterval(sti);
        sti = null;
        loading = false;
        event.reply('openfinish',JSON.stringify({code:305,message:'Request timeout 20 seconds'}));
        win.setClosable(true);
        timeout = 0;
        return;
      }
      timeout++;
    },200);
  } catch(e) {
    //错误返回
    event.reply('openfinish', JSON.stringify({code:402,message:e.message}))
    win.setClosable(true);
  }
})

//递归创建目录
function mkdirs(dirpath){
  if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
    return true;
  } else {
    if (mkdirs(path.dirname(dirpath))) {
      fs.mkdirSync(dirpath);
      return true;
    }
  }
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
