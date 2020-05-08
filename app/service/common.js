const fs = require('fs');
const xlsx = require('node-xlsx');
const path = require('path');
const nodeExcel = require('excel-export');
import axios from 'axios';
import qs from "qs";
const FormData = require('form-data');
const pinyin = require('pinyin');

module.exports = class extends think.Service {
    //获取毫秒级时间戳
    mtime(){
        return new Date().valueOf();
    }
    //获取秒级时间戳
    time(){
        return Math.floor(this.mtime()/1000);
    }
    //获取当前时间字符串,format为格式化,mtime为当前毫秒级时间戳
    date(format,mtime){
        if(!mtime) mtime = this.mtime();
        if(!format) format = 'yyyy-MM-dd hh:mm:ss';
        var dt = new Date(mtime);
        var args = {
            "M+": dt.getMonth() + 1,
            "d+": dt.getDate(),
            "h+": dt.getHours(),
            "m+": dt.getMinutes(),
            "s+": dt.getSeconds(),
            "q+": Math.floor((dt.getMonth() + 3) / 3),  //quarter
            "S": dt.getMilliseconds()
        };
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var i in args) {
            var n = args[i];
            if (new RegExp("(" + i + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
        }
        return format;
    }
    //上传文件,fileobj为上传文件对象this.file('filename'),dir为文件类型名称如:file,image,mp4等,abpath相对根目录的绝对路径,替代dir生成路径(非必传)
    async upload(fileobj,dir,abpath){
        let _this = this;
        return new Promise((resolve, reject) => {
            if(think.isEmpty(fileobj) || !fileobj.size){
                reject(new Error('缺少上传文件'));
                return;
            }
            try{
                var config = think.config('upload');
                var dirname = typeof dir == 'string' ? dir : config.dir;
                var repath = abpath ? abpath : '/static/upload/' + dirname + '/' + _this.date('yyyyMMdd') + '/'; //文件相对路径
                var rootpath = think.ROOT_PATH+'/www'; //文件上传根目录
                var dirpath = rootpath + repath; //文件上传目录路径
                if(Math.ceil(fileobj.size/1024)>parseInt(config.size)){
                    reject(new Error('文件限制大小为:'+parseInt(config.size)+'KB'));
                    return;
                }
                var typearr = config.type.split(',');
                var extarr = fileobj.name.split('.');
                var ext = extarr[extarr.length-1]; //文件后缀名
                if(typearr.filter(v => ext === v).length <= 0){
                    reject(new Error('文件类型仅允许:'+config.type));
                    return;
                }
                var newname = _this.date('hhmmssS') + parseInt(Math.random()*8999+1000) + '.' + ext; //文件新名字
                if(!fs.existsSync(dirpath) || !fs.statSync(dirpath).isDirectory()){
                    _this.mkdirs(dirpath);
                }
                fs.copyFileSync(fileobj.path,dirpath+newname); //复制文件到路径
                resolve({path:repath+newname,name:newname,size:fileobj.size,ext:ext,oname:fileobj.name});
            }catch(err){
                reject(err);
            }
        });
    }
    //递归创建目录
    mkdirs(dirpath){
        if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
            return true;
        } else {
            if (this.mkdirs(path.dirname(dirpath))) {
                fs.mkdirSync(dirpath);
                return true;
            }
        }
    }
    //解析excel文件为多维数组
    async excel2arr(filepath){
        return new Promise((resolve, reject) => {
            try {
                var arr = filepath.split('.');
                if(['xls','xlsx'].filter(v => arr[arr.length-1] === v).length <= 0){
                    reject(new Error('传入文件类型错误'+arr[arr.length-1]+',后缀应为xls,xlsx'));
                }
                resolve(xlsx.parse(filepath));
            }catch(err){
                reject(err);
            }
        });
    }

    //将数组写入excel文件并返回保存路径
    async arr2excel(head,data,filename){
        if(think.isEmpty(head)){
            //throw new Error('导出excel错误:缺少表头head参数');
            return false;
        }
        for(var h in head){
            if(['string','number','bool'].filter(v => head[h]['type'] === v).length === 0){
                head[h]['type'] = 'string';
            }
            if(!head[h]['caption']){
                head[h]['caption'] = '';
            }
        }
        var excel = {
            cols:head,
            rows:data
        }
        let result = nodeExcel.execute(excel);
        var repath = '/static/upload/excel/' + this.date('yyyyMMdd') + '/'; //文件相对路径
        var rootpath = think.ROOT_PATH+'/www';
        var dirpath = rootpath + repath;
        var fname = filename ? filename+'_'+this.date('yyyyMMdd')+'_'+this.date('hhmmss') : 'export_'+this.date('yyyyMMdd')+'_'+this.date('hhmmss');
        if(fname.indexOf('.xls')<0) fname += '.xlsx';
        if(!fs.existsSync(dirpath) || !fs.statSync(dirpath).isDirectory()){
            this.mkdirs(dirpath);
        }
        fs.writeFileSync(dirpath+fname,result,{encoding:'binary'}); //保存导出数据到文件
        return {name:fname,path:repath+fname,file:dirpath+fname}; //返回文件名称name和网络路径path以及本地路径file
    }
    //下载网络文件,src网络文件地址,dir本地储存到/static/download/目录下的相对目录路径
    async downloadSrc(src,dir) {
        let _this = this;
        var srcarr = src.split('/');
        var dirs = dir || 'file';
        var urlpath = '/static/download/' + dirs + '/' + srcarr[srcarr.length-1];
        let localpath = think.ROOT_PATH+'/www' + urlpath;
        // 递归创建图片保存目录
        _this.mkdirs(path.dirname(localpath))
        axios.defaults.withCredentials = true;
        axios.defaults.timeout = 1800*1000;  //文件下载超时时间1800秒
        let result = false;
        console.log('------('+src+')文件下载中,请稍后...------');
        let usetime = 0;
        let downtime = setInterval(function(){
            process.stdout.write('.');
            usetime += 1;
        },1000);
        await axios({
            method: 'get',
            url: src,
            responseType:'arraybuffer'
        }).then(function(res) {
            clearInterval(downtime);
            if (res.status == 200) {
                result = _this.Arraybuffer2Buffer(res.data);
            }else{
                result = res.status;
            }
        }).catch(err=>{
            result = err.response.status;
        });
        if(result == false || typeof result == 'number') return result;
        await fs.writeFileSync(localpath, result,function(err){
            if(err) {
                result = false;
            }
        });
        if(result!==false){
            console.log('\r\n------('+src+')文件下载成功,用时'+usetime+'秒------');
        }
        return {urlpath:urlpath,localpath:localpath};
    }
    Arraybuffer2Buffer(arraybuffer) {
        var buf = new Buffer(arraybuffer.byteLength);
        var view = new Uint8Array(arraybuffer);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
  //正则匹配内容,html为网页字符串,reg1为匹配内容大区域表达式,reg2为匹配页码段表达式,reg3为分割逐条内容表达式
  reghtml(html,reg1,reg2,reg3){
    if(!html || !reg1 || !reg2 || !reg3) return false;
    var res1 = html.replace(/<\/?\s*br\s*\/?\s*>/g,'').replace(/[\r\n]/g,'').match(reg1);
    var res2 = html.replace(/<\/?\s*br\s*\/?\s*>/g,'').replace(/[\r\n]/g,'').match(reg2);
    if(think.isEmpty(res1) || think.isEmpty(res2)){
      return false;
    }
    var pages = res2[0].match(/\d+/);
    var res = res1[0].replace(/\s+[^<>]+>/img,'>').match(reg3);
    if(think.isEmpty(res)){
      return false;
    }
    return {pages:pages[0],data:res};
  }
  //正则匹配html里的table里的每一项并获取出来返回数组reg1为表格外标记,reg2为表格单项标记
  regtable(html,reg1,reg2){
    if(!html || !reg1 || !reg2) return false;
    var res1 = html.match(reg1);
    if(think.isEmpty(res1)){
      return false;
    }
    var res = res1[0].replace(/<\s*fo/ig,'').match(reg2);
    if(think.isEmpty(res)){
      return false;
    }
    return res;
  }
  //正则匹配html里的单项
  regone(html,reg){
    if(!html || !reg) return false;
    var res = html.match(reg);
    if(think.isEmpty(res)){
      return false;
    }
    return res;
  }
  regexec(html,reg){
    if(!html || !reg) return false;
    var res = reg.exec(html);
    if(think.isEmpty(res)){
      return false;
    }
    if(res.length < 1){
        return false;
    }
    return res;
  }
  async headers(refererc,contentTypec,cookiec){
    //获取首页设置返回的cookie
    var cookies = cookiec || await think.service('index').cookie(
      'https://cspur.msa.gov.cn/HsXyxtAppSm1/out/jsp/default.jsp',
      'cspur.msa.gov.cn'
    );

    var contentType = contentTypec || 'application/x-www-form-urlencoded; charset=UTF-8';
    var referer = refererc || 'https://cspur.msa.gov.cn/HsXyxtAppSm1/out/jsp/default.jsp';
    return {
      'Content-Type': contentType,   //请求类型
      'Host':'cspur.msa.gov.cn',
      'Origin':'https://cspur.msa.gov.cn',
      'Referer':referer,
      'Cookie': cookies.join('; ')
    };
  }
  //封装方法 获取url地址的cookie并缓存然后以数组形式返回,url地址,domain为缓存名,update是否强制更新
  async cookie(url,domain,update){
    var urlw = url || 'https://cspur.msa.gov.cn/HsXyxtAppSm1/out/jsp/default.jsp';
    var domainw = domain || urlw.split('/')[2];
    var ccstr = await think.cache(domainw);
    var cc = ccstr ? JSON.parse(ccstr) : [];
    var cookies = [];
    if(update || think.isEmpty(cc)){
      var result1 = await this.curl(
        urlw,
        null,
        'get'
      );
      if(result1===false) return [];
      cookies = result1.headers['set-cookie'];
    }
    if(!think.isEmpty(cookies)){
      for(var c in cookies){
        var cookie = cookies[c].split(';')[0];
        var ckarr = cookie.split('=');
        cc[ckarr[0]] = ckarr[1];
      }
    }
    var result = [];
    for(var ci in cc){
      result.push(ci+'='+cc[ci]);
    }
    await think.cache(domainw,JSON.stringify(cc));
    return result;
  }
  //封装方法 统一请求接口方法
  async curl(url,data,method,headers,responseType){
    var urlw = url || '';
    var methodw = method || 'get';
    var dataw = data || null;
    var headersw = headers || {};
    var responseTypew = responseType || '';
    var result = false;
    if(think.isEmpty(urlw)) return result;
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 10000;
    axios.defaults.headers = {
      ...headersw,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
    };
    if(methodw.toLowerCase() == 'post'){
      if(typeof dataw == 'object' && dataw != null){
        dataw = qs.stringify(dataw);
      }else if(typeof dataw == 'string'){
        try{
          dataw = JSON.parse(dataw);
        }catch(e){
          dataw = dataw;
        }
      }
    }
    await axios({
      method: methodw,
      url: urlw,
      data:dataw,
      responseType: responseTypew
    }).then(function(response) {
      result = response;
    }).catch(function(error){
      //throw Error(error);
      result = false;
    });
    return result;
  }
  async formcurl(url,data,responseType){
    let result = false;
    let formData = new FormData();
    for(var d in data){
      formData.append(d,data[d]);
    }
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 10000;
    await axios({
      method: 'post',
      url: url,
      data:formData,
      headers: formData.getHeaders(),
      responseType:responseType
    }).then(function (res) {
      result = res;
    }).catch(err => {
      console.log(err);
    })
    return result;
  }
  dot2date(str){
      if(!str || typeof str != 'string') return '';
      var arr = str.split('.');
      return (arr[2]+'-'+(arr[1].length>1?arr[1]:'0'+arr[1])+'-'+(arr[0].length>1?arr[0]:'0'+arr[0])).replace(' ','');
  }
  zh2py(text,isupper){
    var res = pinyin(text,{style: pinyin.STYLE_NORMAL});
    var result = ''
    for(var i=0;i<res.length;i++){
      result += res[i][0];
    }
    return isupper ? result : result.toUpperCase();
  }
};
