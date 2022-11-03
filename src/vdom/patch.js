//生成真实dom
export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来,后续如果修改了属性,方便获取

    patchProps(vnode.el, data)

    children.forEach(child => vnode.el.appendChild(createElm(child)))
  }
  else {//没有标签是文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
//比较属性
export function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    }
    else {
      el.setAttribute(key, props[key])
    }

  }
}
//比较vnode
export function patch(oldVnode, vnode) {
  //初渲染判断
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const elm = oldVnode //获取真实元素

    const parentElm = elm.parentNode;//拿到父元素
    let newElm = createElm(vnode)
    // console.log(newElm);//新节点
    parentElm.insertBefore(newElm, elm.nextSibling);//放在老元素的下一个元素之前
    parentElm.removeChild(elm);//删除老节点
    return newElm
  }
  else {//diff算法
    
  }
}