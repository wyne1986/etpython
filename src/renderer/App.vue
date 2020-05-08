<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>Header</h1>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>
        <h1>Created By Wyne, QQ:366659539, Wechat:wyne1986</h1>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
  const path = require('path');
  import thinkServer from '../utils/thinkServer'
  export default {
    name: 'wspider',
    mounted(){
      //启动thinkjs
      thinkServer.start((data)=>{
        console.log(data.toString('utf-8'))
      })
    }
  }
</script>

<style>
  html,body,*{
    padding:0;margin:0;outline:none;font-size:17px;
  }
  .el-header, .el-footer {
    background-color: #38b0ff;
    color: #333;
    text-align: center;
    line-height: 60px;
    display:block;
    position:fixed;
    width:100%;
    z-indx:99999;
  }
  .el-header {
    top:0;
  }
  .el-footer {
    bottom:0;
  }
  .el-main {
    height:100%;
    display:block;
    width:100%;
    margin:60px 0;
    padding:0 !important;
  }
</style>
