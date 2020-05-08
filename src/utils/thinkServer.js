const path = require('path')
const { spawn } = require('child_process');
const __dist_path = process.env.NODE_ENV=='development'?path.join(path.dirname(require('module').globalPaths[0]),path.dirname(path.dirname(__dirname)),'app'):path.dirname(__dirname);

export const thinkServer = {
  isrun:false,
  sp:null,
  start:(callback) => {
    if(thinkServer.sp===null)thinkServer.sp = spawn('node', [process.env.NODE_ENV=='development'?'development.js':'production.js'],{cwd:__dist_path});
    thinkServer.isrun = true
    thinkServer.sp.stdout.on('data',(data)=>{
      callback(data)
    });
    thinkServer.sp.stderr.on('data', (data) => {
      callback(data)
    });
    thinkServer.sp.on('error',(err)=>{
      callback(err)
    });
    thinkServer.sp.on('close', () => {
      thinkServer.sp.kill()
      thinkServer.sp = null
    });
  },
  stop:()=>{
    if(thinkServer.sp!=null){
      thinkServer.isrun = false
      thinkServer.sp.kill()
    }
  }
};

export default thinkServer