import { isSameVnode } from ".";

//生成真实dom
export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来,后续如果修改了属性,方便获取

    patchProps(vnode.el, {}, data);

    children.forEach((child) => vnode.el.appendChild(createElm(child)));
  } else {
    //没有标签是文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
//比较属性
export function patchProps(el, oldProps = {}, props = {}) {
  //老的属性中有,新的没有,就要删除老的
  let oldStyles = oldProps.style || {};
  let newStyles = props.style || {};
  for (let key in oldStyles) {
    //老的样式中有,新的没有就删除
    if (!newStyles[key]) {
      el.style[key] = "";
    }
  }
  for (let key in oldProps) {
    //老的属性中有
    if (!props[key]) {
      //新的没有就删除
      el.removeAttribute(key);
    }
  }

  for (let key in props) {
    //用新的覆盖老的
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
//比较vnode
export function patch(oldVnode, vnode) {
  //初渲染判断
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const elm = oldVnode; //获取真实元素

    const parentElm = elm.parentNode; //拿到父元素
    let newElm = createElm(vnode);
    // console.log(newElm);//新节点
    parentElm.insertBefore(newElm, elm.nextSibling); //放在老元素的下一个元素之前
    parentElm.removeChild(elm); //删除老节点
    return newElm;
  } else {
    //diff算法
    //1.两个节点不是同一个节点,直接删除老的换上新的
    //2.两个节点是同一个节点(判断tag和key) 比较两个节点的属性是否有差异
    //复用老的节点,将差异的属性更换
    //3.节点比较完毕就需要比较子元素
    return patchVnode(oldVnode, vnode);
  }
}
function patchVnode(oldVnode, vnode) {
  if (!isSameVnode(oldVnode, vnode)) {
    //不同直接用老节点的父节点替换该节点
    let el = createElm(vnode);
    oldVnode.el.parentNode.replaceChild(el, oldVnode.el);
    return el;
  }
  //文本的情况
  let el = (vnode.el = oldVnode.el); //复用老节点的元素
  if (!oldVnode.tag) {
    //没有tag属性说明是文本
    if (oldVnode.text !== vnode.text) { 
      el.textContent = vnode.text; //用新的文本覆盖老的
      console.log(el.textContent,1);
    }
  }
  //是标签 要比较标签的属性
  patchProps(el, oldVnode.data, vnode.data);
  //比较子节点,两种可能,一方有子节点一方没有,双方都有
  let oldChildren = oldVnode.children || [];
  let newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    //完整的diff算法
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    //没有老的只有新的,只需要添加
    mountChildren(el, newChildren);
    return el;
  } else if (oldChildren.length > 0) {
    //新的没有,老的有,就要删除
    el.innerHTML = ""; //直接清空
  }
  return el;
}
//将children转成真实dom然后添加在el中
function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}
function updateChildren(el, oldChildren, newChildren) {
  // console.log(el,oldChildren,newChildren);
  //vue2采用双指针的方式
  //重点在于当一个头指针超过尾指针之后,循环结束
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;
  //双指针对应的dom节点
  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map; //映射表
  }
  let map = makeIndexByKey(oldChildren);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    }
    //双方只有有一方头指针超过尾指针就停止循环
    //比较开头节点
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      //头头
      patchVnode(oldStartVnode, newStartVnode); //如果是相同节点就递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      //尾尾
      //比较结束节点
      patchVnode(oldEndVnode, newEndVnode); //如果是相同节点就递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      //交叉比对 abcd -> dabc
      //头尾
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将尾节点放到最前面
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      //尾头
      patchVnode(oldStartVnode, newEndVnode); //两个参数的位置要注意
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      //将头指针指向的元素插入到尾指针指向的元素的下一个节点的前面(其实就是尾指针指向元素的后面)
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      //乱序比对
      // 根据老的列表做一个映射关系,用新的去找,找到则移动,找不到就添加,最后多余的删除
      let moveIndex = map[newStartVnode.key]; //如果拿到则说明是我要移动的索引
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点复用
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; //表示这个节点已经移动
        // 比对属性和子节点
        patchVnode(moveVnode, newStartVnode);
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el); //新添加的节点放在老的头指针指向的节点的前面
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  //新的多了,添加新元素
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      //这里可能向前追加也可能向后追加
      //看下一个元素是否存在,存在说明是中途插入,不存在说明是末尾追加
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      // el.appendChild(childEl);
      console.log(anchor);
      el.insertBefore(childEl, anchor); //anchor为null,这里的作用就相当于appendChild;
    }
  }
  //老的多了,删除旧元素
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldStartIndex; i++) {
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el; //拿到要删除的旧节点的el,el中是真实dom
        el.removeChild(childEl);
      }
    }
  }
}
