let id = 0

class Dep{
  constructor(){
    this.id = id++ 
    //属性的dep需要收集watcher
    this.subs = []
  }
  depend(){
    //这里不应该放重复的watcher
    // this.subs.push(Dep.target) 这样写会重复

    Dep.target.addDep(this); //让watcher记住dep

    //dep和watcher是一个多对多的关系(一个属性可以在多个组件中使用dep -> 多个Watcher)
    //一个组件中由多个属性组成(一个watcher对应多个dep)
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(){
    this.subs.forEach(watcher => watcher.update()) //告诉watcher要更新
  }
}
Dep.target = null;
export default Dep;