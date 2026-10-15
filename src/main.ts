/** Vue 入口：Hash 路由适配 Pages，没有服务器 rewrite 也能刷新详情链接。 */
import {createApp} from 'vue';
import {createRouter,createWebHashHistory} from 'vue-router';
import App from './App.vue';
import './style.css';
const router=createRouter({history:createWebHashHistory(import.meta.env.BASE_URL),routes:[
 {path:'/',component:{template:'<span />'}},{path:'/volcano/:id',component:{template:'<span />'}}]});
createApp(App).use(router).mount('#app');
