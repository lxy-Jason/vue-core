import Dep from "./dep";

export default class Observer {
  constructor(data){
    //数据转存
    this.data = data;
    //遍历对象完成所有数据的劫持
    this.walk(data)
  }
  /**
   * 遍历对象
   * @param {*} data 
   */
  walk(data){
    if(!data || typeof data !== 'object'){
      return ;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data,key,data[key]) 
    })
  }
  /**
   * 动态设置响应式数据
   * @param {*} data 
   * @param {*} key 
   * @param {*} value 
   */
  defineReactive(data,key,value) {
    let dep = new Dep();
    Object.defineProperty(data,key,{
      enumerable:true,
      configurable:false,//不可再配置
      get:()=>{
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: newValue =>{
        console.log('set');
        value = newValue;
        //触发View页面的更新
        dep.notify()
      }
    })
    this.walk(value)
  }
}