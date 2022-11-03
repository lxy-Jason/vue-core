import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

function Vue(options) {
  //options就是用户的选项
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;

initMixin(Vue); //扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);

//watch底层都是调用这个api
Vue.prototype.$watch = function (exprOrFn, cb) {
  // console.log(exprOrFn,cb,options);
  //exprOrFn有两种可能值,字符串和函数

  //firstname的值变化了,直接执行cb函数
  new Watcher(this,exprOrFn,{user:true},cb)
};

export default Vue;
