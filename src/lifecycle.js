import Vue from ".";
import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来,后续如果修改了属性,方便获取

    patchProps(vnode.el, data)

    children.forEach(child => vnode.el.appendChild(createElm(child)))
  }
  else {//没有标签是文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    }
    else {
      el.setAttribute(key, props[key])
    }

  }
}

function patch(oldVnode, vnode) {
  //初渲染判断
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const elm = oldVnode //获取真实元素

    const parentElm = elm.parentNode;//拿到父元素
    let newElm = createElm(vnode)
    // console.log(newElm);//新节点
    parentElm.insertBefore(newElm, elm.nextSibling);//放在老元素的下一个元素之前
    parentElm.removeChild(elm);//删除老节点
    return newElm
  }
  else {//diff算法

  }
}

export function initLifeCycle() {
  Vue.prototype._update = function (vnode) {//将vnode转换成真实dom
    // console.log(vnode);//虚拟dom

    const vm = this;
    const el = vm.$el;
    // console.log(el);
    //patch既有初始化的功能,又有更新的功能
    vm.$el = patch(el, vnode);

  }
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
  Vue.prototype._render = function () {
    //当渲染的时候会去实例中取值,我们可以将属性和视图绑定在一起
    return this.$options.render.call(this);//通过ast语法转义后生成的render方法
  }
}

export function mountComponent(vm, el) {
  vm.$el = el //将真实dom,#app挂载在vm上
  //1.调用render方法产生虚拟dom
  // vm._update(vm._render());// 就是vm.$options.render()
  const updateComponet = () => {
    vm._update(vm._render())
  }
  const watcher= new Watcher(vm,updateComponet,true) //true表示渲染过程
  console.log(watcher);
}
export function callHook(vm,hook){ //调用钩子函数

  const handlers = vm.$options[hook];
  if(handlers) {
    handlers.forEach(handler => handler.call(vm))
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