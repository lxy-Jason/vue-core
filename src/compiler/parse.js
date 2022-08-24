const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配开始标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配结束标签

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/  //匹配属性
// 第一个分组是key  value是分组3,4,5中的一个,对应"",'',和没用引号三种情况   分组二是等号

const startTagClose = /^\s*(\/?)>/  //匹配自闭合标签和开始标签的结束


function parseHTML(html) {

  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];//用于存放元素的
  let currentParent;//指向栈中的最后一个
  let root; //根节点

  //最终需要转化成一颗抽象语法树

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  function start(tag, attrs) {
    let node = createASTElement(tag, attrs) //创建节点
    if (!root) {//如果是空树
      root = node
    }
    if (currentParent) { //前面有节点,为父节点
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node) //入栈
    currentParent = node //currentParent为栈顶的节点
  }
  function chars(text) { //文本直接放入当前的节点
    text = text.replace(/\s/g, '')
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  function end(tag) {
    stack.pop();//出栈
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n) //前面匹配到的内容删除掉
  }
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length) //删除匹配到的内容
      //如果不是开始标签的结束,就一直匹配下去 (匹配的是属性)
      let attr, end
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
      }
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false //不是开始标签

  }
  while (html) {
    //如果textEnd为0 说明是一个开始标签
    //如果不为0 说明是一个结束标签
    let textEnd = html.indexOf('<')

    if (textEnd === 0) {
      const startTagMatch = parseStartTag() //开始标签的匹配结果

      if (startTagMatch) {
        //解析到的开始标签
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1])
        //匹配到结束标签
        advance(endTagMatch[0].length)
        continue
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd) //标签内文本内容
      if (text) {
        chars(text)
        advance(text.length) //解析到的文本
      }
    }
  }
  return root
}
export default parseHTML