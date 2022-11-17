const strats = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    //{} {created:function(){}} => {created:[fn]}
    //{created:[fn]} {created:function(){}} => {created:[fn.fn]}
    if (c) {
      if (p) {
        return p.concat(c); // 如果儿子有,父亲有,父亲一定是个数组
      } else {
        return [c]; //儿子有,父亲没有,将儿子包装成数组
      }
    } else {
      return p; //没有儿子直接用父亲
    }
  };
});
strats.components = function(parentVal,childVal){
  const res = Object.create(parentVal);
  if(childVal){
    for(let key in childVal){
      res[key] = childVal[key]; //返回的都是构造的对象 可以拿到原型上的属性,并且将儿子的都拷贝到自己身上
    }
  }
}
export function mergeOptions(parent, child) {
  const options = {};

  for (let key in parent) {
    //循环老的
    mergeField(key);
  }
  for (let key in child) {
    //循环新的
    if (!parent.hasOwnProperty(key)) {
      //老的中没有再合并
      mergeField(key);
    }
  }
  function mergeField(key) {
    //策略模式 用策略模式减少if / else

    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key]; //优先使用child
    }
  }
  return options;
}
