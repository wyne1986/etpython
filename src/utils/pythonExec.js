const elementui = require('element-ui')
const path = require('path')
const { spawn } = require('child_process');
const __dist_path = process.env.NODE_ENV=='development'?path.join(path.dirname(require('module').globalPaths[0]),path.dirname(path.dirname(__dirname)),'app'):path.dirname(__dirname);

export const pythonExec = (pyfile,callback,pycommand) => {
  const sp = spawn(pycommand||'python', [pyfile],{cwd:path.join(__dist_path,'python')});
  sp.stdout.on('data',(data)=>{
    callback(data)
  })
  sp.stderr.on('data', (data) => {
    elementui.Message({
      type:'error',
      message:data,
      duration:0,showClose:true
    })
  });
  sp.on('error',(err)=>{
    elementui.Message({
      type:'error',
      message:err.message,
      duration:0,showClose:true
    })
  })
  sp.on('close', () => {
    sp.kill()
  });
}

export default pythonExec