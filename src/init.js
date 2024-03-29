import { compileToFunction } from "./compiler"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./utils"

export function initMixin(Vue){ //给Vue增加init方法
  Vue.prototype._init = function(options){
    //初始化操作
    const vm = this
    //$options 将用户选项配置到实例上
    //我们定义的全局指令和过滤器...都会挂载在实例上
    vm.$options = mergeOptions(this.constructor.options,options)
    
    //初始化之前
    callHook(vm,'beforeCreate')
    //初始化状态
    initState(vm)
    //之后
    callHook(vm,'created')

    if(options.el){
      vm.$mount(options.el) //实现数据的挂载
    }
  }
  Vue.prototype.$mount = function(el){
    const vm = this
    el = document.querySelector(el)
    let ops = vm.$options
    if(!ops.render){ //
      let template
      if(!ops.template && el){ //没写template,采用外部的template
        template = el.outerHTML //拿el当模板
      }
      else{
        template = ops.template
      }
      //对模板进行编译
      if(template){
        const render = compileToFunction(template)
        ops.render = render
      }
    }
    // console.log(ops.render); //最终是为了得到render方法
    mountComponent(vm,el);//组件的挂载
  }
}
