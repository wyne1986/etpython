<template>
    <div id="wrapper">
    </div>
</template>
<script>
    const path = require('path')

  export default {
    name: 'index',
    data(){
      return {
      }
    },
    mounted(){
      let _this = this;
      this.$pythonExec('test/hello.py',(res)=>{
        _this.$msgbox({
          title:'JSON Data From Python: test/hello.py',
          message:res
        })
      })
    },
    methods:{

    },
    watch:{

    }
  }
</script>
<style>

</style>