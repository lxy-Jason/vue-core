//重写数组中的部分方法

let oldArrayProto = Array.prototype //获取数组原型

//newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]
methods.forEach(method => {
  newArrayProto[method] = function (...args) {//重写数组方法

    const result = oldArrayProto[method].call(this, ...args)  //内部调用原来的方法   函数的劫持 

    //对新增的数据再次进行劫持
    let inserted
    let ob = this.__ob__ //this是在vm上使用arr.push中的arr
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break;
    }
    if(inserted){ //inserted是一个数组
      //新增的内容再次观测
      ob.observeArray(inserted)
    }
    return result
  }
})