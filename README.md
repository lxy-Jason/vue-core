# 参考vue实现的简单MVVM框架

>姓名:李湘粤 学校:湖南文理学院 
>专业:信息管理与信息系统 大二 QQ :1627962483

### 实现数据劫持,发布订阅模式及双向绑定

```
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
```

### 发布订阅模式

```
  get() {
    Dep.target = this;
    let newValue = Watcher.computeExpression(this.exp,this.scope);
    Dep.target = null;
    return newValue;
  };
  addSub(target) {
    this.subs[target.uid] = target;
  }
  notify() {
    for(let uid in this.subs) {
      this.subs[uid].update()
    }
  }
  update() {
    let newValue = this.get();
    this.cb && this.cb(newValue);
  }
```
### v-model数据双向绑定
```
new Watcher(attrValue,this.context,newValue=>{
  node.value = newValue;
})
node.addEventListener("input",e => {
  that.context[attrValue] = e.target.value;
})
```

### 实现数据单向绑定:v-text
```
new Watcher(attrValue,this.context,newValue => {
  node.textContent = newValue;
})
```
### 实现数据单向绑定:插值表达式
```
compilerTextNode(node){
    let text = node.textContent.trim();
    if(text) {
      //把test字符串,转换成表达式
      let exp = this.parseTextExp(text);
      //添加订阅者,计算表达式的值
      new Watcher(exp,this.context,(newValue) => {
        node.textContent = newValue;
      })
      // 当表达式依赖的数据发生变化时
      //1.重新计算表达式的值
      //2.node.textContent给最新的值
      //完成Model -> View的响应式
    }
  }
  /**
   * 将文本转成表达式
   * @param {*} text 
   * @returns 
   */
  parseTextExp(text){
    //匹配插值表达式正则
    let regText = /\{\{(.+?)\}\}/g;
    //分割插值表达式前后内容
    let pices = text.split(regText)
    //拿到插值表达式里的值
    let matches = text.match(regText);
    //表达式数组
    let tokens = [];
    pices.forEach(item => {
      if(item) {
        if(matches && matches.indexOf("{{" + item + "}}") > -1){ 
          tokens.push("(" + item + ")");
        }
        else {
          tokens.push("`" + item + "`")
        }
      };
    })
    return tokens.join("+")
  }
}
```

### 实现数据代理

```
 _proxyData(data){
    Object.keys(data).forEach(key => {
      Object.defineProperty(this,key,{
        set(newValue){
          data[key] = newValue;
        },
        get(){
          return data[key]
        }
      })
    })
  }

  _proxyMethods(methods){
    if(methods && typeof methods === 'object'){
      Object.keys(methods).forEach(key => {
        this[key] = methods[key]
      })
    }
  }
}
```

