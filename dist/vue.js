(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配开始标签

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配结束标签

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
  // 第一个分组是key  value是分组3,4,5中的一个,对应"",'',和没用引号三种情况   分组二是等号

  var startTagClose = /^\s*(\/?)>/; //匹配自闭合标签和开始标签的结束

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素的

    var currentParent; //指向栈中的最后一个

    var root; //根节点
    //最终需要转化成一颗抽象语法树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); //创建节点

      if (!root) {
        //如果是空树
        root = node;
      }

      if (currentParent) {
        //前面有节点,为父节点
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node); //入栈

      currentParent = node; //currentParent为栈顶的节点
    }

    function chars(text) {
      //文本直接放入当前的节点
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop(); //出栈

      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n); //前面匹配到的内容删除掉
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //删除匹配到的内容
        //如果不是开始标签的结束,就一直匹配下去 (匹配的是属性)

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; //不是开始标签
    }

    while (html) {
      //如果textEnd为0 说明是一个开始标签
      //如果不为0 说明是一个结束标签
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); //开始标签的匹配结果

        if (startTagMatch) {
          //解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]); //匹配到结束标签

          advance(endTagMatch[0].length);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //标签内文本内容

        if (text) {
          chars(text);
          advance(text.length); //解析到的文本
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ''; //{name,value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //对style属性的特殊处理
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); //a:b,c:d, 最后还有一个逗号
    }

    return "{".concat(str.slice(0, -1), "}"); //删掉最后一个逗号  这里返回了一个字符串
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{}}中的变量

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      //文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //匹配的位置

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    //1.将template 转化成ast语法树
    var ast = parseHTML(template); //2.生成render方法(render方法执行后返回的结果是虚拟DOM)
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

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}"); //这里是为了方便name,age这些变量取值

    var render = new Function(code); //  根据代码生成render函数
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

    return render;
  }

  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created"];
  LIFECYCLE.forEach(function (hook) {
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
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      //循环老的
      mergeField(key);
    }

    for (var _key in child) {
      //循环新的
      if (!parent.hasOwnProperty(_key)) {
        //老的中没有再合并
        mergeField(_key);
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

  function initGlobalAPI(Vue) {
    //静态属性
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 将用户选项和全局options进行合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; //属性的dep需要收集watcher

      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //这里不应该放重复的watcher
        // this.subs.push(Dep.target) 这样写会重复
        Dep.target.addDep(this); //让watcher记住dep
        //dep和watcher是一个多对多的关系(一个属性可以在多个组件中使用dep -> 多个Watcher)
        //一个组件中由多个属性组成(一个watcher对应多个dep)
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); //告诉watcher要更新
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    //不同组件有不同watcher
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options;

      if (typeof exprOrFn === "string") {
        this.getter = function () {
          return vm[exprOrFn]; //这里读取到的也是一个函数
        };
      } else {
        this.getter = exprOrFn; //getter意味着调用这个函数可以发生取值操作
      }

      this.deps = []; //后续实现计算属性和一些清理工作需要使用到

      this.depsId = new Set(); //去重

      this.lazy = options.lazy;
      this.dirty = this.lazy; // 缓存值

      this.vm = vm;
      this.cb = cb;
      this.user = options.user; //标识是不是用户自己的watcher

      this.value = this.lazy ? undefined : this.get();
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        //一个组件对应多个属性,重复的属性不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id); // 让dep记住watcher

          dep.addSub(this);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); //获取到用户函数的返回值,并且标识为脏

        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); //静态属性

        var value = this.getter.call(this.vm); // 会去vm上取值

        popTarget(); //清空 

        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          //如果是计算属性,watcher上会有dirty
          //当依赖更新时,标记计算属性为脏值
          this.dirty = true;
        } else {
          // this.get() //重新渲染
          queueWatcher(this); //把当前的Watcher的暂存起来
          // console.log('update');
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get(); //渲染的时候用的是最新的vm来渲染

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false; //防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; //不管update执行多少次,但是最终只执行一个刷新操作

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    //最后一起更新
    waiting = false;
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); //按照顺序依次执行
  } //nextTick没有直接使用某个api 而是采用(优雅降级)的方式
  // 内部先采用promise,但ie不兼容,所以接着考虑 MutationObserver(h5的api) 还不行就是ie专用的setImmediate 最后是用setTimeout


  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb); //维护nextTick中的callback方法

    if (!waiting) {
      timerFunc();
      waiting = true;
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步任务

      var textNode = document.createTextNode(1); //创建一个文本节点

      observer.observe(textNode, {
        //监控这个文本节点
        characterData: true //监控的内容是文本的值

      });

      timerFunc = function timerFunc() {
        textNode.textContent = 2; //这里修改文本节点的值,前面的监控就会发现,从而调用回调函数,达到异步调用flushCallbacks的目的
      };
    } else if (setImmediate) {
      timerFunc = function timerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFunc = function timerFunc() {
        setTimeout(flushCallbacks);
      };
    }
  } //需要给每个属性增加一个dep,目的是收集Watcher

  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === "string") {
      vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来,后续如果修改了属性,方便获取

      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        return vnode.el.appendChild(createElm(child));
      });
    } else {
      //没有标签是文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } //比较属性

  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //老的属性中有,新的没有,就要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      //老的样式中有,新的没有就删除
      if (!newStyles[key]) {
        el.style[key] = "";
      }
    }

    for (var _key in oldProps) {
      //老的属性中有
      if (!props[_key]) {
        //新的没有就删除
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      //用新的覆盖老的
      if (_key2 === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  } //比较vnode

  function patch(oldVnode, vnode) {
    //初渲染判断
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      var elm = oldVnode; //获取真实元素

      var parentElm = elm.parentNode; //拿到父元素

      var newElm = createElm(vnode); // console.log(newElm);//新节点

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
      var _el = createElm(vnode);

      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    } //文本的情况


    var el = vnode.el = oldVnode.el; //复用老节点的元素

    if (!oldVnode.tag) {
      //没有tag属性说明是文本
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text; //用新的文本覆盖老的

        console.log(el.textContent, 1);
      }
    } //是标签 要比较标签的属性


    patchProps(el, oldVnode.data, vnode.data); //比较子节点,两种可能,一方有子节点一方没有,双方都有

    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];

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
  } //将children转成真实dom然后添加在el中


  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    // console.log(el,oldChildren,newChildren);
    //vue2采用双指针的方式
    //重点在于当一个头指针超过尾指针之后,循环结束
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1; //双指针对应的dom节点

    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map; //映射表
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } //双方只有有一方头指针超过尾指针就停止循环
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

        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //将头指针指向的元素插入到尾指针指向的元素的下一个节点的前面(其实就是尾指针指向元素的后面)

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else {
        //乱序比对
        // 根据老的列表做一个映射关系,用新的去找,找到则移动,找不到就添加,最后多余的删除
        var moveIndex = map[newStartVnode.key]; //如果拿到则说明是我要移动的索引

        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点复用

          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined; //表示这个节点已经移动
          // 比对属性和子节点

          patchVnode(moveVnode, newStartVnode);
        } else {
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el); //新添加的节点放在老的头指针指向的节点的前面
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    } //新的多了,添加新元素


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); //这里可能向前追加也可能向后追加
        //看下一个元素是否存在,存在说明是中途插入,不存在说明是末尾追加

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // el.appendChild(childEl);

        console.log(anchor);
        el.insertBefore(childEl, anchor); //anchor为null,这里的作用就相当于appendChild;
      }
    } //老的多了,删除旧元素


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldStartIndex; _i++) {
        if (oldChildren[_i]) {
          var _childEl = oldChildren[_i].el; //拿到要删除的旧节点的el,el中是真实dom

          el.removeChild(_childEl);
        }
      }
    }
  }

  function initLifeCycle() {
    Vue.prototype._update = function (vnode) {
      //将vnode转换成真实dom
      // console.log(vnode);//虚拟dom
      var vm = this;
      var el = vm.$el;
      var prevVnode = vm._vnode;
      vm._vnode = vnode; //把组件第一次产生的虚拟节点保存到_vnode的上面

      if (prevVnode) {
        //之前渲染过了
        vm.$el = patch(prevVnode, vnode);
      } else {
        //第一次渲染 
        // console.log(el);
        //patch既有初始化的功能,又有更新的功能
        vm.$el = patch(el, vnode);
      }
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      //当渲染的时候会去实例中取值,我们可以将属性和视图绑定在一起
      return this.$options.render.call(this); //通过ast语法转义后生成的render方法
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; //将真实dom,#app挂载在vm上
    //1.调用render方法产生虚拟dom
    // vm._update(vm._render());// 就是vm.$options.render()

    var updateComponet = function updateComponet() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponet, true); //true表示渲染过程
  }
  function callHook(vm, hook) {
    //调用钩子函数
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }
  /**
   * vue的核心流程
   * 1.创造响应式数据
   * 2.模板转化成ast语法树
   * 3.将ast语法树转换成render函数生成虚拟dom
   * 4.后面数据更新时,只执行render函数,不需要再次执行ast转化的过程
   * 5.根据生成的虚拟dom创造真实dom
   */

  //重写数组中的部分方法
  var oldArrayProto = Array.prototype; //获取数组原型
  //newArrayProto.__proto__ = oldArrayProto

  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //重写数组方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法   函数的劫持 
      //对新增的数据再次进行劫持


      var inserted;
      var ob = this.__ob__; //this是在vm上使用arr.push中的arr

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        //inserted是一个数组
        //新增的内容再次观测
        ob.observeArray(inserted);
      } //数组改变,通知对应的Watcher实现更新逻辑


      ob.dep.notify();
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //这个data可能是array和object
      //给每个对象都增加收集功能
      this.dep = new Dep(); //Object,definePrototype只能劫持已经存在的属性

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //不可枚举

      }); // data.__ob__ = this //把Observer放在data上
      //给数据加上一个标识,如果有__ob__则说明这个属性被观测过

      if (Array.isArray(data)) {
        //重写数组中的方法 7个变异方法 可以修改数组本身
        //需要保留数组的原有特性,并且重写部分方法
        data.__proto__ = newArrayProto;
        this.observeArray(data); //如果数组中是对象可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环对象 对属性依次劫持
        //"重新定义" 属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }(); //多次嵌套递归性能差,不存在的属性监控不到,存在的属性要重写方法 所以vue3用proxy还是好


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        //如果还是数组
        dependArray(current); //递归收集依赖
      }
    }
  }

  function defineReactive(target, key, value) {
    //闭包 属性劫持 
    //value可能还是对象
    var childOb = observe(value); //childOb.dep用来收集依赖

    var dep = new Dep(); //每个属性都有一个Dep

    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          //静态变量就一个
          dep.depend(); //添加watcher

          console.log();

          if (childOb) {
            childOb.dep.depend(); //让数组和对象本身也进行依赖收集

            if (Array.isArray(value)) {
              //如果是数组
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
        dep.notify(); //通知更新
      }
    });
  }
  function observe(data) {
    //对对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return;
    } //如果一个对象被劫持过了,就不需要再劫持


    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    } //要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; //获取所有选项

    if (opts.data) {
      //data选项
      initData(vm);
    }

    if (opts.computed) {
      //计算属性
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key]; //字符串 数组 函数三种可能还有对象,暂不考虑

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    //字符串   函数
    if (typeof handler === "string") {
      handler = vm[handler]; //这里得到一个函数？

      console.log(handler);
    }

    return vm.$watch(key, handler);
  }

  function initData(vm) {
    var data = vm.$options.data; //data可能是函数和对象

    data = typeof data === "function" ? data.call(vm) : data; //对数据进行劫持  vue2里采用了一个api defineProperty

    observe(data);
    vm._data = data; //将返回的对象放在_data上
    // 将vm._data 用vm来代理

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      //要查vm.name
      get: function get() {
        return vm[target][key]; //实际去查vm._data.name
      },
      set: function set(newData) {
        vm[target][key] = newData;
      }
    });
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //将计算属性watcher保存到vm上
    // console.log(computed);

    for (var key in computed) {
      var userDef = computed[key]; //我们需要监控计算属性中get的变化

      var fn = typeof userDef === "function" ? userDef : userDef.get;
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get;
    var setter = userDef.set || function () {}; // console.log(getter);
    // console.log(setter);
    //可以通过实例


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    //需要检测是否要执行这个getter
    return function () {
      var watcher = this._computedWatchers[key]; //获取到对应属性的watcher

      if (watcher.dirty) {
        //如果是脏的就去执行用户传入的函数
        watcher.evaluate(); //求值后dirty为false,下次就不再求值
      }

      if (Dep.target) {
        //计算属性出栈之后,还有渲染watcher,应该让计算属性watcher里的属性去收集上一层watcher
        watcher.depend();
      }

      return watcher.value; //最后是返回watcher上的值
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; //watch底层都是调用这个api

    Vue.prototype.$watch = function (exprOrFn, cb) {
      // console.log(exprOrFn,cb,options);
      //exprOrFn有两种可能值,字符串和函数
      //firstname的值变化了,直接执行cb函数
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    //给Vue增加init方法
    Vue.prototype._init = function (options) {
      //初始化操作
      var vm = this; //$options 将用户选项配置到实例上
      //我们定义的全局指令和过滤器...都会挂载在实例上

      vm.$options = mergeOptions(this.constructor.options, options); //初始化之前

      callHook(vm, 'beforeCreate'); //初始化状态

      initState(vm); //之后

      callHook(vm, 'created');

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        //
        var template;

        if (!ops.template && el) {
          //没写template,采用外部的template
          template = el.outerHTML; //拿el当模板
        } else {
          template = ops.template;
        } //对模板进行编译


        if (template) {
          var render = compileToFunction(template);
          ops.render = render;
        }
      } // console.log(ops.render); //最终是为了得到render方法


      mountComponent(vm, el); //组件的挂载
    };
  }

  function Vue(options) {
    //options就是用户的选项
    this._init(options);
  }

  initMixin(Vue); //扩展了init方法

  initLifeCycle(); //vm._update  vm._render

  initGlobalAPI(Vue); //全局api的实现

  initStateMixin(Vue); //实现nextTick $watch

  return Vue;

}));
//# sourceMappingURL=vue.js.map
