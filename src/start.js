import { observe } from "./observe/index"

export function initState(vm) {
  const opts = vm.$options //获取所有选项
  if (opts.data) {
    initDate(vm)
  }
}
function initDate(vm) {
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