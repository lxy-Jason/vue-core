import { initGlobalAPI } from './globalAPI'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'

function Vue(options) { //options就是用户的选项
  this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)//扩展了init方法
initLifeCycle(Vue)

initGlobalAPI(Vue)

export default Vue