import {initMixin} from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'

function Vue(options){ //options就是用户的选项
  this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)//扩展了init方法
initLifeCycle(Vue)

//静态属性
Vue.options = {}
Vue.mixin = function(mixin){
  // 将用户选项和全局options进行合并
  this.options = mergeOptions(this.options,mixin)
  return this
}

export default Vue