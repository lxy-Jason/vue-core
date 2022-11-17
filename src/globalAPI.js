import {mergeOptions} from './utils'

export function initGlobalAPI(Vue) {
  //静态属性
  Vue.options = {}
  Vue.mixin = function (mixin) {
    // 将用户选项和全局options进行合并
    this.options = mergeOptions(this.options, mixin)
    return this
  }
  //可以手动创造组件进行挂载
  Vue.extend = function(options){ //就是根据用户的参数返回一个构造函数而已
    function Sub(options = {}){ //最终使用一个组件就是new 一个实例
      this._init(options); //默认对子类进行初始化操作
    }
    Sub.prototype = Object.create(Vue.prototype); //寄生式继承?
    Sub.prototype.constructor = Sub;
    //将用户传递的参数和全局的Vue.options合并
    Sub.options = mergeOptions(Vue.options,options);
    return Sub
  }
  Vue.options.components = {}; //全局的指令
  Vue.component = function(id,definition){
    //如果definition已经是一个函数,说明用户自己调用过Vue.extend
    definition = typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition
    console.log(Vue.options.components);
  }
}