<template>
  <div id="wrapper">
    <el-row>
      <el-col :span="24" class="tcenter">
        Url Resources Setting
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card" v-model="tab">
          <el-tab-pane label="Text" name="text" :disabled="running!=0">
            <el-input
                    type="textarea"
                    :rows="5"
                    placeholder="zuozishu http://www.zuozishu.com"
                    v-model="text">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="Mysql" name="mysql" :disabled="running!=0">
            <el-row>
              <el-col :span="8">
                <el-input placeholder="Host Address" v-model="mysql_setting.host">
                  <template slot="prepend">Host</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input placeholder="Port" v-model="mysql_setting.port">
                  <template slot="prepend">Port</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input placeholder="Database" v-model="mysql_setting.database">
                  <template slot="prepend">Database</template>
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input placeholder="User" v-model="mysql_setting.user">
                  <template slot="prepend">User</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input type="password" placeholder="Password" v-model="mysql_setting.password">
                  <template slot="prepend">Password</template>
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input placeholder="TableName" v-model="mysql_use.table_name">
                  <template slot="prepend">TableName</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input placeholder="FileName in Column" v-model="mysql_use.file_column_name">
                  <template slot="prepend">FileName in Column</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input placeholder="URL in Column" v-model="mysql_use.url_column_name">
                  <template slot="prepend">URL in Column</template>
                </el-input>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="ParseHtml" name="parsehtml" :disabled="running!=0">
            <el-row>
              <el-col :span="12">
                RegExpType:
                <el-select v-model="parseType" placeholder="匹配方式">
                  <el-option
                          v-for="item in parseOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-input placeholder="parse RegExp like <a([^>]+)>" v-model="parseExp">
                  <template slot="prepend">RegExp</template>
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-input placeholder="File Ext" v-model="parseExt">
                  <template slot="prepend">FileExt</template>
                </el-input>
              </el-col>
              <el-col :span="10">
                <el-button @click="selectParseDir" round icon="el-icon-folder-opened" class="sdir">{{parsePath}}</el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="success" @click="getFiles" v-if="running==0" round>getFiles</el-button>
                <el-button type="danger" @click="stop" v-if="running==1" round>stopScan</el-button>
                <el-badge :value="pindex+`/`+parseFiles.length" v-if="parseFiles.length>0" class="item">
                  <el-button type="warning" @click="controlParse(running==1&&parseData.length>0?2:1)" v-if="parseFiles.length>0" round>{{running==1&&parseData.length>0?'Pause':'Start'}}</el-button>
                </el-badge>
                <el-button type="warning" @click="controlParse(0)" v-if="parseFiles.length>0 && parseData.length>0 && running==2" round>Stop</el-button>
                <el-button type="primary" @click="exportParse" v-if="parseData.length>0" :disabled="running==1" round>Export</el-button>
                <el-button type="danger" @click="clearParse" v-if="parseFiles.length>0" :disabled="running==1" round>Clear</el-button>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-row v-if="tabtype.indexOf(tab)!=-1">
      <el-col :span="8">
        <el-badge :value="dindex+`/`+datas.length" class="item">
          <el-button type="success" @click="start" round>{{['Start','Pause','Continue'][running]}}</el-button>
        </el-badge>
        <el-button type="warning" @click="stop" round v-if="running>0">Stop</el-button>
        <el-button type="info" @click="clear" round v-if="running==0">Clear</el-button>
      </el-col>
      <el-col :span="12">
          <el-button @click="selectDir" round icon="el-icon-folder-opened" class="sdir">{{save_path}}</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="openDir" round>OpenDir</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="tcenter">Result</el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="rtable" v-if="tab!='parsehtml'">
        <table style="width:100%;">
          <thead>
          <tr>
            <th width="10%">FileName</th>
            <th width="40%">Url</th>
            <th width="10%">Status</th>
            <th width="20%">Message</th>
            <th width="20%">Time</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item,index) in results" v-if="index>=(page-1)*pageCount && index-((page-1)*pageCount)<pageCount">
            <td>{{item.filename}}</td>
            <td>{{item.url}}</td>
            <td>{{item.status}}</td>
            <td>{{item.message}}</td>
            <td>{{item.time}}</td>
          </tr>
          </tbody>
          <tfoot>
          <el-pagination
                  small background
                  layout="prev, pager, next, jumper, total"
                  @current-change="rpageChange"
                  :page-size="pageCount"
                  :total="results.length">
          </el-pagination>
          </tfoot>
        </table>
      </el-col>
      <el-col :span="24" class="rtable" v-if="tab=='parsehtml'">
        <table style="width:100%;">
          <tbody>
          <tr v-for="(item,index) in parseData" v-if="index>=(page-1)*pageCount && index-((page-1)*pageCount)<pageCount">
            <td v-for="it in item">{{it}}</td>
          </tr>
          </tbody>
          <tfoot>
          <el-pagination
                  small background
                  layout="prev, pager, next, jumper, total"
                  @current-change="rpageChange"
                  :page-size="pageCount"
                  :total="parseData.length">
          </el-pagination>
          </tfoot>
        </table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  const path = require('path');
  const fs = require('fs');
  const xlsx = require('node-xlsx');
  const nodeExcel = require('excel-export');
  let text = '';
  export default {
    name: 'index',
    data(){
      return {
        tab: 'text',
        running: 0,
        domain: '',
        selecting: false,
        text: '',
        pageCount:10,
        page:1,
        parseExp:'<a class="title_lk" title="[^"]*" href="([^"]+)"[^>]*>',
        parseExt:'html',
        parseFiles:[],
        parseData:[],
        parseType:2,
        parseOptions:[
          {label:'Single',value:1},
          {label:'Multi',value:2}
        ],
        parsePath: path.join(__dist_path, 'tmp'),
        save_path: path.join(__dist_path, 'tmp'),
        tabtype: ['text', 'mysql'],
        mysql_setting: {
          host: '127.0.0.1',
          port: '3306',
          user: 'root',
          password: 'root',
          database: 'msa'
        },
        mysql_use: {
          table_name: 'msa_notice',
          url_column_name: 'url',
          file_column_name: 'id'
        },
        datas: [],
        search: '',
        results: [],
        dindex: 0,
        pindex:0
      }
    },
    mounted(){
      var _this = this;
      this.$electron.ipcRenderer.on('openfinish',(event,arg) => {
        var args = JSON.parse(arg)
        if(_this.running==0){
          _this.$message({
            message: 'Program has been Stop',
            type: 'error'
          });
          return
        }
        if(_this.running==2){
          _this.$message({
            message: 'Program has been Pause',
            type: 'warning'
          });
          return
        }
        if(args.code>500){
          _this.$message({
            message: args.message,
            type: 'error'
          });
          return
        }
        if(args.code>400){
          _this.$message({
            message: args.message,
            type: 'warning'
          });
        }
        if(args.code>300){
          _this.$message({
            message: args.message,
            type: 'warning'
          });
          setTimeout(function(){
            _this.sendurl();
          },1000)
          return
        }
        _this.results.unshift({filename:_this.datas[_this.dindex].filename,url:_this.datas[_this.dindex].url,status:args.code,message:args.message,time:new Date().toLocaleTimeString()});
        _this.dindex++;
        if(_this.dindex>=_this.datas.length){
          _this.running = 0;
          _this.dindex = 0;
          _this.datas = [];
          _this.$message({
            message: 'Url Sources Finished',
            type: 'success'
          });
          return
        }
        _this.sendurl();
      })
    },
    methods: {
      start(){
        var _this = this;
        if(this.running != 0){
          this.running = 3-this.running;
          if(this.running==1)this.sendurl();
          return;
        }
        switch(_this.tab){
          case 'text':
            text = _this.text;
            if(!(/(https?:\/\/[^\s\t]+[\s\t]*[^\r\n]*[\r\n]*)+/ig).test(text)){
              _this.$message({
                message: 'Text Valid Fail, Text must be "Filename+(space)+URL+(Enter)',
                type: 'error'
              });
              return;
            }
            _this.splitText()
            _this.running = 1;
            break;
          case 'mysql':
            this.running = 1;
            _this.mysql();
            break;
          default:
            this.running = 0;
            _this.$message({
              message: 'Data Setting Type not exists,only supports ["text","mysql"]',
              type: 'error'
            });
            break;
        }
      },
      stop(){
        this.running = 0;
        this.dindex = 0;
        this.datas = [];
        this.results = [];
        this.parseFiles = [];
      },
      clear(){
        if(this.running==0){
          this.datas = [];
          this.results = [];
        }
      },
      sendurl(){
        var _this = this;
        var urlarr = _this.datas[_this.dindex].url.split('/');
        _this.domain = urlarr[2].replace(/\./ig,'_');
        var fname = _this.datas[_this.dindex].filename ? _this.datas[_this.dindex].filename : (urlarr[urlarr.length-1] == ''?urlarr[urlarr.length-2]+'.html':urlarr[urlarr.length-1].substr(urlarr[urlarr.length-1].lastIndexOf('.'))+'.html')
        urlarr.splice(0,3)
        urlarr[urlarr.length-1] == '' ? urlarr.splice(-2,2) : urlarr.splice(-1,1)
        var filepaths = path.join(_this.save_path,_this.domain)
        for(var u in urlarr){
          filepaths = path.join(filepaths,urlarr[u]);
        }
        filepaths = path.join(filepaths,fname)
        _this.datas[_this.dindex].filename = fname;
        this.$electron.ipcRenderer.send('openurl',JSON.stringify({url:_this.datas[_this.dindex].url,filepath:filepaths}));
      },
      openDir(){
        var _this = this;
        if(!this.mkdirs(_this.save_path)){
          _this.$message({
            message: 'Open Directory Error',
            type: 'error'
          });
          return;
        }
        if(!fs.existsSync(path.join(_this.save_path,'readme.wspd'))){
          fs.writeFileSync(path.join(_this.save_path,'readme.wspd'),'web spider open directory, need use this file');
        }
        this.$electron.remote.shell.showItemInFolder(path.join(_this.save_path,'readme.wspd'));
      },
      selectDir(){
        var _this = this;
        if(!_this.selecting){
          _this.selecting = true;
          var dpaths = this.$electron.remote.dialog.showOpenDialogSync({ properties: ['openDirectory'] })
          _this.selecting = false;
          if(dpaths){
            _this.save_path = dpaths[0];
          }
        }
      },
      selectParseDir(){
        var _this = this;
        if(!_this.selecting){
          _this.selecting = true;
          var dpaths = this.$electron.remote.dialog.showOpenDialogSync({ properties: ['openDirectory'] })
          _this.selecting = false;
          if(dpaths){
            _this.parsePath = dpaths[0];
          }
        }
      },
      getFiles(dirpath){
        var _this = this;
        this.parseData = [];
        if(typeof dirpath != 'string')_this.parseFiles = [];
        var nowpath = typeof dirpath == 'string' ? dirpath : _this.parsePath;
        _this.running = 1;
        fs.readdir(nowpath,function(err,files) {
          if (err) {
            _this.$message({
              message: err.message,
              type: 'error'
            });
            return;
          }
          files.some((filename)=>{
            if(_this.parseFiles.length>=200){
              _this.$message({
                message: 'Files List Limited 200',
                type: 'warning'
              });
              _this.running = 0;
              return true;
            }
            var stats = fs.statSync(path.join(nowpath, filename))
            if (stats.isFile()) {
              var filearr = filename.split('.');
              if(filearr[filearr.length-1]==_this.parseExt){
                _this.parseFiles.push(path.join(nowpath, filename));
              }
            } else if (stats.isDirectory()) {
              _this.getFiles(path.join(nowpath, filename))
            }
          })
        })
      },
      clearParse(){
        this.running = 0;
        this.parseFiles = [];
        this.parseData = [];
        this.pindex = 0;
      },
      controlParse(r){
        this.running = r || 0
        if(this.running == 1){
          this.startParse()
        }
        if(this.running == 0){
          this.pindex = 0
        }
      },
      startParse(){
        var _this = this;
        if(this.running==0){
          this.pindex = 0
          _this.$message({
            message:'Parse has Stoped',
            type:'warning'
          })
          return
        }
        if(this.running==2){
          _this.$message({
            message:'Parse has Pause',
            type:'warning'
          })
          return
        }
        if(this.pindex == this.parseFiles.length){
          this.running = 0;
          this.pindex = 0;
          _this.$message({
            message:'Parse Files Finished',
            type:'success'
          })
          return;
        }
        var reg = new RegExp(this.parseExp,'ig');
        var data = fs.readFileSync(_this.parseFiles[_this.pindex],'utf-8');
        var data = data.replace(/[\r\n]+/ig,'');
        var parseText = data;
        var res = [];
        while(true){
          var parseRes = reg.exec(parseText);
          if(parseRes == null) break;
          parseText = data.substr(parseRes[0].length)
          delete(parseRes.index)
          delete(parseRes.input)
          delete(parseRes.groups)
          parseRes.splice(0,1);
          res.push(parseRes);
          if(parseRes.length==1)parseRes = parseRes[0];
          if(_this.parseType==1)break;
          if(_this.parseData.length>0){
            if(res[0].length<_this.parseData[0].length){
              for(var pd in _this.parseData[0]){
                if(!res[0][pd]) res[0][pd] = ''
              }
            }
          }
          _this.parseData.push(res[0]);
        }
        _this.pindex++;
        setTimeout(()=>{
          _this.startParse();
        },5);
      },
      exportParse(){
        var res = this.arr2excel([],this.parseData,'parseHtml');
        if(res !== false){
          this.$electron.ipcRenderer.send('downloadurl',res.file);
        }
      },
      mysql(){
        var _this = this;
        var connection = this.$mysql.createConnection(_this.mysql_setting);
        connection.connect();
        connection.query('SELECT '+_this.mysql_use.file_column_name+' AS filename,'+_this.mysql_use.url_column_name+' AS url FROM '+_this.mysql_use.table_name, function (err,result) {
          if(err){
            _this.$message({
              message: 'Mysql Connect Error:'+err.message,
              type: 'error'
            });
            _this.running = 0;
            return;
          }
          _this.datas = result;
          _this.sendurl();
        });
      },
      splitText(){
        var _this = this;
        var res = text.split('\n');
        for(var r in res){
          var rege = (/(https?:\/\/.+)[\s\t]*([^\r\n]*)?[\r\n]*/ig).exec(res[r])
          if(rege==null) continue;
          _this.datas.push({url:rege[1],filename:rege[2]?rege[2]:false})
        }
        _this.sendurl();
      },
      rpageChange(p){
        this.page = p;
      },
      mkdirs(dirpath){
        if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
          return true;
        } else {
          if (this.mkdirs(path.dirname(dirpath))) {
            fs.mkdirSync(dirpath);
            return true;
          }
        }
      },
      arr2excel(head,data,filename){
        if(data.length<=0){
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
        if(head.length<=0){
          head = [];
          for(var d in data[0]){
            head.push({type:'string',caption:'string',column:d});
          }
        }
        for(var du in data[0]){
          if(typeof data[data.length-1][du] == 'undefined'){
            data[data.length-1][du] = ''
          }
        }
        var excel = {
          cols:head,
          rows:data
        }
        let result = nodeExcel.execute(excel);
        var dt = new Date();
        var dtx = dt.getFullYear()+''+(dt.getMonth()+1)+dt.getDate()+dt.getHours()+dt.getMinutes()+dt.getSeconds()
        var repath = '/excel/' + dtx + '/'; //文件相对路径
        var rootpath = __dist_path+'/export';
        var dirpath = rootpath + repath;
        var fname = filename ? filename+'_'+dtx : 'export_'+dtx;
        if(fname.indexOf('.xls')<0) fname += '.xlsx';
        if(!fs.existsSync(dirpath) || !fs.statSync(dirpath).isDirectory()){
          this.mkdirs(dirpath);
        }
        fs.writeFileSync(dirpath+fname,result,{encoding:'binary'}); //保存导出数据到文件
        return {name:fname,path:repath+fname,file:dirpath+fname}; //返回文件名称name和网络路径path以及本地路径file
      }
    },
    watch:{

    }
  }
</script>
<style>
  .tcenter {
    text-align:center;
  }
  .rtable {
    height:400px;
    text-align:center;
    overflow-y:auto;
  }
  .rtable td{
    border:1px solid grey;
    padding:3px;
  }
  .sdir {
    max-width:90%;
    overflow-x:hidden;
  }
  tr:nth-child(even){
    background-color:#EEE;
  }
</style>
