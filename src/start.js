import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

export function initState(vm) {
  const opts = vm.$options //获取所有选项
  if (opts.data) { //data选项
    initData(vm)
  }
  if (opts.computed) {//计算属性
    initComputed(vm)
  }
}
function initData(vm) {
  let data = vm.$options.data //data可能是函数和对象
  data = typeof data === 'function' ? data.call(vm) : data

  //对数据进行劫持  vue2里采用了一个api defineProperty
  observe(data)

  vm._data = data //将返回的对象放在_data上

  // 将vm._data 用vm来代理
  for (let key in data) {
    proxy(vm, '_data', key)
  }
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, { //要查vm.name
    get() {
      return vm[target][key] //实际去查vm._data.name
    },
    set(newData) {
      vm[target][key] = newData
    }
  })
}
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = vm._computedWatchers = {}; //将计算属性watcher保存到vm上
  // console.log(computed);
  for (let key in computed) {
    let userDef = computed[key]
    //我们需要监控计算属性中get的变化
    let fn = typeof userDef === 'function' ? userDef : userDef.get
    watchers[key] = new Watcher(vm, fn, { lazy: true })

    defineComputed(vm, key, userDef)
  }
}
function defineComputed(target, key, userDef) {
  // const getter = typeof userDef === 'function' ? userDef : userDef.get;
  const setter = userDef.set || (() => { })
  // console.log(getter);
  // console.log(setter);

  //可以通过实例
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}
function createComputedGetter(key) { //需要检测是否要执行这个getter
  return function () {
    const watcher = this._computedWatchers[key]; //获取到对应属性的watcher 
    if(watcher.dirty){
      //如果是脏的就去执行用户传入的函数
      watcher.evaluate();//求值后dirty为false,下次就不再求值
    }
    if(Dep.target){ //计算属性出栈之后,还有渲染watcher,应该让计算属性watcher里的属性去收集上一层watcher
      watcher.depend()
    }
    return watcher.value;//最后是返回watcher上的值
  }
}