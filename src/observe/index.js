import { newArrayProto } from "./array"
import Dep from './dep'
class Observer {
  constructor(data) {
    //这个data可能是array和object
    //给每个对象都增加收集功能
    this.dep = new Dep()

    //Object,definePrototype只能劫持已经存在的属性
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false//不可枚举
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
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}
//多次嵌套递归性能差,不存在的属性监控不到,存在的属性要重写方法 所以vue3用proxy还是好
function dependArray(value){
  for(let i = 0; i < value.length; i++){
    let current = value[i]
    current.__ob__ && current.__ob__.dep.depend()
    if(Array.isArray(current)){ //如果还是数组
      dependArray(current) //递归收集依赖
    }
  }
}

export function defineReactive(target, key, value) { //闭包 属性劫持 
  //value可能还是对象
  let childOb = observe(value) //childOb.dep用来收集依赖
  let dep = new Dep(); //每个属性都有一个Dep
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) { //静态变量就一个
        dep.depend() //添加watcher
        console.log();

        if(childOb){
          childOb.dep.depend(); //让数组和对象本身也进行依赖收集

          if(Array.isArray(value)){//如果是数组
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      value = newValue
      dep.notify(); //通知更新
    }
  })
}

export function observe(data) {
  //对对象进行劫持
  if (typeof data !== 'object' || data === null) {
    return
  }

  //如果一个对象被劫持过了,就不需要再劫持
  if (data.__ob__ instanceof Observer) {
    return data.__ob__
  }
  //要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断


  return new Observer(data)
}