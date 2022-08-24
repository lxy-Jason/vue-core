import Dep from "./dep";

let id = 0

class Watcher{ //不同组件有不同watcher
  constructor(vm,fn,options){
    this.id = id++
    this.renderWatcher = options
    this.getter = fn; //getter意味着调用这个函数可以发生取值操作

    this.get()
  }
  get(){
    Dep.target = this; //静态属性
    this.getter(); // 会去vm上取值
    Dep.target = null; //清空 
  }
}
//需要给每个属性增加一个dep,目的是收集Watcher
export default Watcher