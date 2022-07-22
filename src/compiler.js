import Watcher from "./watcher";

export default class Compiler{
  constructor(context){
    this.$el = context.$el;
    this.context = context;
    if(this.$el){
      //把原始的dom转换成文档片段
      this.$fragment = this.nodeToFragment(this.$el)
      //模板编译
      this.compiler(this.$fragment)
      //把文档片段添加到页面中
      this.$el.appendChild(this.$fragment)
    }
  }
  /**
   * 把所有元素转为文档片段
   * @param {*} node 
   */
  nodeToFragment(node){
    let fragment = document.createDocumentFragment();
    if(node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        //忽略注释和换行
        if(!this.igorable(child)){
          fragment.appendChild(child);
        }
      })
    }
    return fragment
  } 
  /**
   * 判断是不是被忽略的节点
   * @param {*} node 
   * @returns 
   */
  igorable(node){
    var reg = /^[\t\n\r]+/;
    if(node.nodeType === 8){ //匹配的是注释
      return true  
    }
    else if(node.nodeType === 3){
      return reg.test(node.textContent)
    }
    else{
      return false
    }

  }
  /**
   * 模板编译
   * @param {*} node 
   */
  compiler(node){
    if(node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if(child.nodeType === 1){
          //当nodeType为1时是元素节点,为3时是文本节点
          this.compilerElementNode(child)
        }
        else if(child.nodeType === 3){
          this.compilerTextNode(child)
        }
      })
    }
  }
  /**
   * 编译元素节点
   * @param {*} node 
   */
  compilerElementNode(node){
    let that = this;
    //todo 完成属性的编译
    let attrs = [...node.attributes];
    attrs.forEach(attr => {
      let {name:attrName,value:attrValue} = attr;
      //属性
      if(attrName.indexOf("v-") === 0) {
        let dirName = attrName.slice(2);
        switch (dirName){
          case "text" :
            new Watcher(attrValue,this.context,newValue => {
              node.textContent = newValue;
            })
            break;
          case "model" :
            new Watcher(attrValue,this.context,newValue=>{
              node.value = newValue;
            })
            node.addEventListener("input",e => {
              that.context[attrValue] = e.target.value;
            })
            break;
        }
      }
      //事件
      if(attrName.indexOf("@") === 0) {
        this.compilerMethods(this.context,node,attrName,attrValue)
      }
    })
    this.compiler(node) //递归
  }
  /**
   * 函数编译
   * @param {*} scope 
   * @param {*} node 
   * @param {*} attrName 
   * @param {*} attrValue 
   */
 compilerMethods(scope,node,attrName,attrValue){
  //获取类型
  let type = attrName.slice(1);
  let fn = scope[attrValue];
  node.addEventListener(type,fn.bind(scope))
 } 
  /**
   * 编译文本节点
   * @param {*} node 
   */
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
      //即可完成Model -> View的响应式
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
