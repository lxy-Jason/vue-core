import Dep, { popTarget, pushTarget } from "./dep";

let id = 0

class Watcher { //不同组件有不同watcher
  constructor(vm, exprOrFn, options,cb) {
    this.id = id++
    this.renderWatcher = options

    if(typeof exprOrFn === "string"){
      this.getter = function(){
        return vm[exprOrFn]; //这里读取到的也是一个函数
      }
    }
    else{
      this.getter = exprOrFn; //getter意味着调用这个函数可以发生取值操作
    }
    this.deps = [];//后续实现计算属性和一些清理工作需要使用到
    this.depsId = new Set() //去重
    this.lazy = options.lazy;
    this.dirty = this.lazy; // 缓存值
    this.vm = vm
    this.cb = cb;
    this.user = options.user; //标识是不是用户自己的watcher

    this.value = this.lazy ? undefined : this.get()
  }
  addDep(dep) {
    //一个组件对应多个属性,重复的属性不用记录
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      // 让dep记住watcher
      dep.addSub(this)
    }
  }
  evaluate() {
    this.value = this.get(); //获取到用户函数的返回值,并且标识为脏
    this.dirty = false
  }
  get() {
    pushTarget(this); //静态属性
    let value = this.getter.call(this.vm); // 会去vm上取值
    popTarget(); //清空 
    return value
  }
  depend(){
    let i = this.deps.length;
    while(i--){
      this.deps[i].depend() //让计算属性watcher也收集渲染watcher
    }
  }
  update() {
    if (this.lazy) {
      //如果是计算属性,watcher上会有dirty
      //当依赖更新时,标记计算属性为脏值
      this.dirty = true
    }
    else {
      // this.get() //重新渲染
      queueWatcher(this);//把当前的Watcher的暂存起来
      // console.log('update');
    }

  }
  run() {
    let oldValue = this.value;
    let newValue = this.get(); //渲染的时候用的是最新的vm来渲染
    if(this.user){
      this.cb.call(this.vm,newValue,oldValue);
    }

  }
}
let queue = []
let has = {}
let pending = false; //防抖

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)
  queue = []
  has = {}
  pending = false
  flushQueue.forEach(q => q.run())

}

function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    //不管update执行多少次,但是最终只执行一个刷新操作
    if (!pending) {
      nextTick(flushSchedulerQueue, 0)
      pending = true
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {//最后一起更新
  waiting = false;
  let cbs = callbacks.slice(0)
  callbacks = []
  cbs.forEach(cb => cb()) //按照顺序依次执行
}

//nextTick没有直接使用某个api 而是采用(优雅降级)的方式
// 内部先采用promise,但ie不兼容,所以接着考虑 MutationObserver(h5的api) 还不行就是ie专用的setImmediate 最后是用setTimeout
let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
}

export function nextTick(cb) {
  callbacks.push(cb) //维护nextTick中的callback方法
  if (!waiting) {
    timerFunc()
    waiting = true
  } else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks);//这里传入的回调是异步任务
    let textNode = document.createTextNode(1) //创建一个文本节点
    observer.observe(textNode, { //监控这个文本节点
      characterData: true //监控的内容是文本的值
    })
    timerFunc = () => {
      textNode.textContent = 2 //这里修改文本节点的值,前面的监控就会发现,从而调用回调函数,达到异步调用flushCallbacks的目的
    }
  }
  else if (setImmediate) {
    timerFunc = () => {
      setImmediate(flushCallbacks)
    }
  } else {
    timerFunc = () => {
      setTimeout(flushCallbacks)
    }
  }
}

//需要给每个属性增加一个dep,目的是收集Watcher
export default Watcher