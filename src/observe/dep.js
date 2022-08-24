let id = 0

class Dep{
  constructor(){
    this.id = id++ 
    //属性的dep需要收集watcher
    this.subs = []
  }
  depend(){
    this.subs.push(Dep.target)
  }
}
Dep.target = null;
export default Dep;