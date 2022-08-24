import { newArrayProto } from "./array"
import Dep from './dep'
class Observer {
  constructor(data) {
    //Object,definePrototype只能劫持已经存在的属性
    Object.defineProperty(data,'__ob__',{
      value:this,
      enumerable:false//不可枚举
    })
    // data.__ob__ = this //把Observer放在data上
    //给数据加上一个标识,如果有__ob__则说明这个属性被观测过
    if (Array.isArray(data)) {
      //重写数组中的方法 7个变异方法 可以修改数组本身
      //需要保留数组的原有特性,并且重写部分方法
      data.__proto__ = newArrayProto

      this.observeArray(data) //如果数组中是对象可以监控到对象的变化
    }
    else {
      this.walk(data)
    }
  }
  walk(data) {
    //循环对象 对属性依次劫持
    //"重新定义" 属性
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  observeArray(data){
    data.forEach(item => observe(item))
  }
}

export function defineReactive(target, key, value) { //闭包 属性劫持 
  //value可能还是对象
  observe(value)
  let dep = new Dep(); //每个属性都有一个Dep
  Object.defineProperty(target, key, {
    get() {
      if(dep.target){
        dep.depend() //添加watcher
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      value = newValue
    }
  })
}

export function observe(data) {
  //对对象进行劫持
  if (typeof data !== 'object' || data === null) {
    return
  }
  
  //如果一个对象被劫持过了,就不需要再劫持
  if(data.__ob__ instanceof Observer){
    return data.__ob__
  }
  //要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断


  return new Observer(data)
}