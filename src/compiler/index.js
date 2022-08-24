import parseHTML from "./parse";

function genProps(attrs) {
  let str = ''//{name,value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') { //对style属性的特殊处理
      let obj = {};
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':');
        obj[key] = value;
      })
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`//a:b,c:d, 最后还有一个逗号
  }
  return `{${str.slice(0, -1)}}` //删掉最后一个逗号  这里返回了一个字符串
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配{{}}中的变量

function gen(node) {
  if (node.type === 1) {
    return codegen(node)
  }
  else {
    //文本
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }
    else {
      let tokens = []
      let match;
      defaultTagRE.lastIndex = 0
      let lastIndex = 0
      while (match = defaultTagRE.exec(text)) {
        let index = match.index;//匹配的位置
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
  return children.map(child => gen(child)).join(',')
}
function codegen(ast) {
  let children = genChildren(ast.children)
  let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`)
  return code
}

export function compileToFunction(template) {
  //1.将template 转化成ast语法树
  let ast = parseHTML(template)
  //2.生成render方法(render方法执行后返回的结果是虚拟DOM)
  // console.log(ast);
  // console.log(codegen(ast));
  /**
   * 
      _c('div'),{id:"app",class:"nb",style:{"color":" red"," font-size":"16px"}},
      _c('div'),{style:{"color":"blue"}},_v(_s(name)+"hello"+_s(age)+"hello")
    ,
      _c('br'),null,
      _c('span'),null,_v(_s(age))
   */
  let code = codegen(ast)

  code = `with(this){return ${code}}` //这里是为了方便name,age这些变量取值
  let render = new Function(code) //  根据代码生成render函数
  // console.dir(render.toString());
  /** 
   * function anonymous() { 
      with(this){return 
            _c('div'),{id:"app",class:"nb",style:{"color":" red"," font-size":"16px"}},
            _c('div'),{style:{"color":"blue"}},_v(_s(name)+"hello"+_s(age)+"hello")
          ,
            _c('br'),null,
            _c('span'),null,_v(_s(age))
      }
    }
   */
  return render
}