import Vue from 'vue'
import axios from 'axios'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
import store from './store'
import mysql from 'mysql';
import pythonExec from '../utils/pythonExec'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.mysql = Vue.prototype.$mysql = mysql
Vue.config.productionTip = false
Vue.prototype.$pythonExec = pythonExec
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
