import Vue from ".";
import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";

export function initLifeCycle() {
  Vue.prototype._update = function (vnode) {
    //将vnode转换成真实dom
    // console.log(vnode);//虚拟dom
    const vm = this;
    const el = vm.$el;
    const prevVnode = vm._vnode;
    vm._vnode = vnode; //把组件第一次产生的虚拟节点保存到_vnode的上面
    if (prevVnode) {
      //之前渲染过了
      vm.$el = patch(prevVnode,vnode);  
    } else {//第一次渲染 
      // console.log(el);
      //patch既有初始化的功能,又有更新的功能
      vm.$el = patch(el, vnode);
    }
  };
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
  Vue.prototype._render = function () {
    //当渲染的时候会去实例中取值,我们可以将属性和视图绑定在一起
    return this.$options.render.call(this); //通过ast语法转义后生成的render方法
  };
}

export function mountComponent(vm, el) {
  vm.$el = el; //将真实dom,#app挂载在vm上
  //1.调用render方法产生虚拟dom
  // vm._update(vm._render());// 就是vm.$options.render()
  const updateComponet = () => {
    vm._update(vm._render());
  };
  const watcher = new Watcher(vm, updateComponet, true); //true表示渲染过程
}
export function callHook(vm, hook) {
  //调用钩子函数

  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
/**
 * vue的核心流程
 * 1.创造响应式数据
 * 2.模板转化成ast语法树
 * 3.将ast语法树转换成render函数生成虚拟dom
 * 4.后面数据更新时,只执行render函数,不需要再次执行ast转化的过程
 * 5.根据生成的虚拟dom创造真实dom
 */
