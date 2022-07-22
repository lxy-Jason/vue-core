/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/compiler.js":
/*!*************************!*\
  !*** ./src/compiler.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Compiler)
/* harmony export */ });
/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ "./src/watcher.js");


class Compiler{
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
            new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](attrValue,this.context,newValue => {
              node.textContent = newValue;
            })
            break;
          case "model" :
            new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](attrValue,this.context,newValue=>{
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
      new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](exp,this.context,(newValue) => {
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


/***/ }),

/***/ "./src/dep.js":
/*!********************!*\
  !*** ./src/dep.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dep)
/* harmony export */ });
class Dep{
  constructor(){
    //存放所有Watcher
    this.subs = {};
  }

  addSub(target) {
    this.subs[target.uid] = target;
  }
  notify() {
    for(let uid in this.subs) {
      this.subs[uid].update()
    }
  }
}

/***/ }),

/***/ "./src/observer.js":
/*!*************************!*\
  !*** ./src/observer.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Observer)
/* harmony export */ });
/* harmony import */ var _dep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dep */ "./src/dep.js");


class Observer {
  constructor(data){
    //数据转存
    this.data = data;
    //遍历对象完成所有数据的劫持
    this.walk(data)
  }
  /**
   * 遍历对象
   * @param {*} data 
   */
  walk(data){
    if(!data || typeof data !== 'object'){
      return ;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data,key,data[key]) 
    })
  }
  /**
   * 动态设置响应式数据
   * @param {*} data 
   * @param {*} key 
   * @param {*} value 
   */
  defineReactive(data,key,value) {
    let dep = new _dep__WEBPACK_IMPORTED_MODULE_0__["default"]();
    Object.defineProperty(data,key,{
      enumerable:true,
      configurable:false,//不可再配置
      get:()=>{
        _dep__WEBPACK_IMPORTED_MODULE_0__["default"].target && dep.addSub(_dep__WEBPACK_IMPORTED_MODULE_0__["default"].target);
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
}

/***/ }),

/***/ "./src/watcher.js":
/*!************************!*\
  !*** ./src/watcher.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Watcher)
/* harmony export */ });
/* harmony import */ var _dep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dep */ "./src/dep.js");


var $uid = 0;
class Watcher {
  constructor(exp,scope,cb){
    this.exp = exp;
    this.scope = scope;
    this.cb = cb;
    this.uid = $uid++;
    this.update();
  }
  /**
   * 计算表达式
   */
  get() {
    _dep__WEBPACK_IMPORTED_MODULE_0__["default"].target = this;
    let newValue = Watcher.computeExpression(this.exp,this.scope);
    _dep__WEBPACK_IMPORTED_MODULE_0__["default"].target = null;
    return newValue;
  };
  /**
   * 完成回调函数的调用
   */
  update() {
    let newValue = this.get();
    this.cb && this.cb(newValue);
  }

  static computeExpression(exp,scope) {
    //创建函数
    //把scoped当做作用域
    //函数内部使用with来指定作用域
    //执行函数,得到表达式的值
    let fn = new Function("scope","with(scope){return " + exp + "}");
    return fn(scope)
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _compiler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compiler */ "./src/compiler.js");
/* harmony import */ var _observer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./observer */ "./src/observer.js");



class Vue {
  constructor(options){
    //获取元素dom对象
    this.$el = document.querySelector(options.el)
    //转存数据
    this.$data = options.data || {}
    //数据代理
    this._proxyData(this.$data);
    // 函数代理
    this._proxyMethods(options.methods)
    //数据劫持
    new _observer__WEBPACK_IMPORTED_MODULE_1__["default"](this.$data)
    //模板编译
    new _compiler__WEBPACK_IMPORTED_MODULE_0__["default"](this)
  }
  /**
   * 数据代理
   * @param {*} data 
   */
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
window.Vue = Vue
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNQQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tdnZtLy4vc3JjL2NvbXBpbGVyLmpzIiwid2VicGFjazovL212dm0vLi9zcmMvZGVwLmpzIiwid2VicGFjazovL212dm0vLi9zcmMvb2JzZXJ2ZXIuanMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy93YXRjaGVyLmpzIiwid2VicGFjazovL212dm0vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXZ2bS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbXZ2bS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL212dm0vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXYXRjaGVyIGZyb20gXCIuL3dhdGNoZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVye1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRleHQpe1xyXG4gICAgdGhpcy4kZWwgPSBjb250ZXh0LiRlbDtcclxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICBpZih0aGlzLiRlbCl7XHJcbiAgICAgIC8v5oqK5Y6f5aeL55qEZG9t6L2s5o2i5oiQ5paH5qGj54mH5q61XHJcbiAgICAgIHRoaXMuJGZyYWdtZW50ID0gdGhpcy5ub2RlVG9GcmFnbWVudCh0aGlzLiRlbClcclxuICAgICAgLy/mqKHmnb/nvJbor5FcclxuICAgICAgdGhpcy5jb21waWxlcih0aGlzLiRmcmFnbWVudClcclxuICAgICAgLy/miormlofmoaPniYfmrrXmt7vliqDliLDpobXpnaLkuK1cclxuICAgICAgdGhpcy4kZWwuYXBwZW5kQ2hpbGQodGhpcy4kZnJhZ21lbnQpXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIOaKiuaJgOacieWFg+e0oOi9rOS4uuaWh+aho+eJh+autVxyXG4gICAqIEBwYXJhbSB7Kn0gbm9kZSBcclxuICAgKi9cclxuICBub2RlVG9GcmFnbWVudChub2RlKXtcclxuICAgIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIGlmKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgIG5vZGUuY2hpbGROb2Rlcy5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAvL+W/veeVpeazqOmHiuWSjOaNouihjFxyXG4gICAgICAgIGlmKCF0aGlzLmlnb3JhYmxlKGNoaWxkKSl7XHJcbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyYWdtZW50XHJcbiAgfSBcclxuICAvKipcclxuICAgKiDliKTmlq3mmK/kuI3mmK/ooqvlv73nlaXnmoToioLngrlcclxuICAgKiBAcGFyYW0geyp9IG5vZGUgXHJcbiAgICogQHJldHVybnMgXHJcbiAgICovXHJcbiAgaWdvcmFibGUobm9kZSl7XHJcbiAgICB2YXIgcmVnID0gL15bXFx0XFxuXFxyXSsvO1xyXG4gICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gOCl7IC8v5Yy56YWN55qE5piv5rOo6YeKXHJcbiAgICAgIHJldHVybiB0cnVlICBcclxuICAgIH1cclxuICAgIGVsc2UgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyl7XHJcbiAgICAgIHJldHVybiByZWcudGVzdChub2RlLnRleHRDb250ZW50KVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gIH1cclxuICAvKipcclxuICAgKiDmqKHmnb/nvJbor5FcclxuICAgKiBAcGFyYW0geyp9IG5vZGUgXHJcbiAgICovXHJcbiAgY29tcGlsZXIobm9kZSl7XHJcbiAgICBpZihub2RlLmNoaWxkTm9kZXMgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICBub2RlLmNoaWxkTm9kZXMuZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgaWYoY2hpbGQubm9kZVR5cGUgPT09IDEpe1xyXG4gICAgICAgICAgLy/lvZNub2RlVHlwZeS4ujHml7bmmK/lhYPntKDoioLngrks5Li6M+aXtuaYr+aWh+acrOiKgueCuVxyXG4gICAgICAgICAgdGhpcy5jb21waWxlckVsZW1lbnROb2RlKGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGNoaWxkLm5vZGVUeXBlID09PSAzKXtcclxuICAgICAgICAgIHRoaXMuY29tcGlsZXJUZXh0Tm9kZShjaGlsZClcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIOe8luivkeWFg+e0oOiKgueCuVxyXG4gICAqIEBwYXJhbSB7Kn0gbm9kZSBcclxuICAgKi9cclxuICBjb21waWxlckVsZW1lbnROb2RlKG5vZGUpe1xyXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgLy90b2RvIOWujOaIkOWxnuaAp+eahOe8luivkVxyXG4gICAgbGV0IGF0dHJzID0gWy4uLm5vZGUuYXR0cmlidXRlc107XHJcbiAgICBhdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xyXG4gICAgICBsZXQge25hbWU6YXR0ck5hbWUsdmFsdWU6YXR0clZhbHVlfSA9IGF0dHI7XHJcbiAgICAgIC8v5bGe5oCnXHJcbiAgICAgIGlmKGF0dHJOYW1lLmluZGV4T2YoXCJ2LVwiKSA9PT0gMCkge1xyXG4gICAgICAgIGxldCBkaXJOYW1lID0gYXR0ck5hbWUuc2xpY2UoMik7XHJcbiAgICAgICAgc3dpdGNoIChkaXJOYW1lKXtcclxuICAgICAgICAgIGNhc2UgXCJ0ZXh0XCIgOlxyXG4gICAgICAgICAgICBuZXcgV2F0Y2hlcihhdHRyVmFsdWUsdGhpcy5jb250ZXh0LG5ld1ZhbHVlID0+IHtcclxuICAgICAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcIm1vZGVsXCIgOlxyXG4gICAgICAgICAgICBuZXcgV2F0Y2hlcihhdHRyVmFsdWUsdGhpcy5jb250ZXh0LG5ld1ZhbHVlPT57XHJcbiAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLGUgPT4ge1xyXG4gICAgICAgICAgICAgIHRoYXQuY29udGV4dFthdHRyVmFsdWVdID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvL+S6i+S7tlxyXG4gICAgICBpZihhdHRyTmFtZS5pbmRleE9mKFwiQFwiKSA9PT0gMCkge1xyXG4gICAgICAgIHRoaXMuY29tcGlsZXJNZXRob2RzKHRoaXMuY29udGV4dCxub2RlLGF0dHJOYW1lLGF0dHJWYWx1ZSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIHRoaXMuY29tcGlsZXIobm9kZSkgLy/pgJLlvZJcclxuICB9XHJcbiAgLyoqXHJcbiAgICog5Ye95pWw57yW6K+RXHJcbiAgICogQHBhcmFtIHsqfSBzY29wZSBcclxuICAgKiBAcGFyYW0geyp9IG5vZGUgXHJcbiAgICogQHBhcmFtIHsqfSBhdHRyTmFtZSBcclxuICAgKiBAcGFyYW0geyp9IGF0dHJWYWx1ZSBcclxuICAgKi9cclxuIGNvbXBpbGVyTWV0aG9kcyhzY29wZSxub2RlLGF0dHJOYW1lLGF0dHJWYWx1ZSl7XHJcbiAgLy/ojrflj5bnsbvlnotcclxuICBsZXQgdHlwZSA9IGF0dHJOYW1lLnNsaWNlKDEpO1xyXG4gIGxldCBmbiA9IHNjb3BlW2F0dHJWYWx1ZV07XHJcbiAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsZm4uYmluZChzY29wZSkpXHJcbiB9IFxyXG4gIC8qKlxyXG4gICAqIOe8luivkeaWh+acrOiKgueCuVxyXG4gICAqIEBwYXJhbSB7Kn0gbm9kZSBcclxuICAgKi9cclxuICBjb21waWxlclRleHROb2RlKG5vZGUpe1xyXG4gICAgbGV0IHRleHQgPSBub2RlLnRleHRDb250ZW50LnRyaW0oKTtcclxuICAgIGlmKHRleHQpIHtcclxuICAgICAgLy/miop0ZXN05a2X56ym5LiyLOi9rOaNouaIkOihqOi+vuW8j1xyXG4gICAgICBsZXQgZXhwID0gdGhpcy5wYXJzZVRleHRFeHAodGV4dCk7XHJcbiAgICAgIC8v5re75Yqg6K6i6ZiF6ICFLOiuoeeul+ihqOi+vuW8j+eahOWAvFxyXG4gICAgICBuZXcgV2F0Y2hlcihleHAsdGhpcy5jb250ZXh0LChuZXdWYWx1ZSkgPT4ge1xyXG4gICAgICAgIG5vZGUudGV4dENvbnRlbnQgPSBuZXdWYWx1ZTtcclxuICAgICAgfSlcclxuICAgICAgLy8g5b2T6KGo6L6+5byP5L6d6LWW55qE5pWw5o2u5Y+R55Sf5Y+Y5YyW5pe2XHJcbiAgICAgIC8vMS7ph43mlrDorqHnrpfooajovr7lvI/nmoTlgLxcclxuICAgICAgLy8yLm5vZGUudGV4dENvbnRlbnTnu5nmnIDmlrDnmoTlgLxcclxuICAgICAgLy/ljbPlj6/lrozmiJBNb2RlbCAtPiBWaWV355qE5ZON5bqU5byPXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIOWwhuaWh+acrOi9rOaIkOihqOi+vuW8j1xyXG4gICAqIEBwYXJhbSB7Kn0gdGV4dCBcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwYXJzZVRleHRFeHAodGV4dCl7XHJcbiAgICAvL+WMuemFjeaPkuWAvOihqOi+vuW8j+ato+WImVxyXG4gICAgbGV0IHJlZ1RleHQgPSAvXFx7XFx7KC4rPylcXH1cXH0vZztcclxuICAgIC8v5YiG5Ymy5o+S5YC86KGo6L6+5byP5YmN5ZCO5YaF5a65XHJcbiAgICBsZXQgcGljZXMgPSB0ZXh0LnNwbGl0KHJlZ1RleHQpXHJcbiAgICAvL+aLv+WIsOaPkuWAvOihqOi+vuW8j+mHjOeahOWAvFxyXG4gICAgbGV0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlZ1RleHQpO1xyXG4gICAgLy/ooajovr7lvI/mlbDnu4RcclxuICAgIGxldCB0b2tlbnMgPSBbXTtcclxuICAgIHBpY2VzLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGlmKGl0ZW0pIHtcclxuICAgICAgICBpZihtYXRjaGVzICYmIG1hdGNoZXMuaW5kZXhPZihcInt7XCIgKyBpdGVtICsgXCJ9fVwiKSA+IC0xKXsgXHJcbiAgICAgICAgICB0b2tlbnMucHVzaChcIihcIiArIGl0ZW0gKyBcIilcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdG9rZW5zLnB1c2goXCJgXCIgKyBpdGVtICsgXCJgXCIpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSlcclxuICAgIHJldHVybiB0b2tlbnMuam9pbihcIitcIilcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVwe1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAvL+WtmOaUvuaJgOaciVdhdGNoZXJcclxuICAgIHRoaXMuc3VicyA9IHt9O1xyXG4gIH1cclxuXHJcbiAgYWRkU3ViKHRhcmdldCkge1xyXG4gICAgdGhpcy5zdWJzW3RhcmdldC51aWRdID0gdGFyZ2V0O1xyXG4gIH1cclxuICBub3RpZnkoKSB7XHJcbiAgICBmb3IobGV0IHVpZCBpbiB0aGlzLnN1YnMpIHtcclxuICAgICAgdGhpcy5zdWJzW3VpZF0udXBkYXRlKClcclxuICAgIH1cclxuICB9XHJcbn0iLCJpbXBvcnQgRGVwIGZyb20gXCIuL2RlcFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JzZXJ2ZXIge1xyXG4gIGNvbnN0cnVjdG9yKGRhdGEpe1xyXG4gICAgLy/mlbDmja7ovazlrZhcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAvL+mBjeWOhuWvueixoeWujOaIkOaJgOacieaVsOaNrueahOWKq+aMgVxyXG4gICAgdGhpcy53YWxrKGRhdGEpXHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIOmBjeWOhuWvueixoVxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBcclxuICAgKi9cclxuICB3YWxrKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09ICdvYmplY3QnKXtcclxuICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgdGhpcy5kZWZpbmVSZWFjdGl2ZShkYXRhLGtleSxkYXRhW2tleV0pIFxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqXHJcbiAgICog5Yqo5oCB6K6+572u5ZON5bqU5byP5pWw5o2uXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFxyXG4gICAqIEBwYXJhbSB7Kn0ga2V5IFxyXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgXHJcbiAgICovXHJcbiAgZGVmaW5lUmVhY3RpdmUoZGF0YSxrZXksdmFsdWUpIHtcclxuICAgIGxldCBkZXAgPSBuZXcgRGVwKCk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSxrZXkse1xyXG4gICAgICBlbnVtZXJhYmxlOnRydWUsXHJcbiAgICAgIGNvbmZpZ3VyYWJsZTpmYWxzZSwvL+S4jeWPr+WGjemFjee9rlxyXG4gICAgICBnZXQ6KCk9PntcclxuICAgICAgICBEZXAudGFyZ2V0ICYmIGRlcC5hZGRTdWIoRGVwLnRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICB9LFxyXG4gICAgICBzZXQ6IG5ld1ZhbHVlID0+e1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQnKTtcclxuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgICAgIC8v6Kem5Y+RVmlld+mhtemdoueahOabtOaWsFxyXG4gICAgICAgIGRlcC5ub3RpZnkoKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgdGhpcy53YWxrKHZhbHVlKVxyXG4gIH1cclxufSIsImltcG9ydCBEZXAgZnJvbSBcIi4vZGVwXCI7XHJcblxyXG52YXIgJHVpZCA9IDA7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXIge1xyXG4gIGNvbnN0cnVjdG9yKGV4cCxzY29wZSxjYil7XHJcbiAgICB0aGlzLmV4cCA9IGV4cDtcclxuICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcclxuICAgIHRoaXMuY2IgPSBjYjtcclxuICAgIHRoaXMudWlkID0gJHVpZCsrO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICog6K6h566X6KGo6L6+5byPXHJcbiAgICovXHJcbiAgZ2V0KCkge1xyXG4gICAgRGVwLnRhcmdldCA9IHRoaXM7XHJcbiAgICBsZXQgbmV3VmFsdWUgPSBXYXRjaGVyLmNvbXB1dGVFeHByZXNzaW9uKHRoaXMuZXhwLHRoaXMuc2NvcGUpO1xyXG4gICAgRGVwLnRhcmdldCA9IG51bGw7XHJcbiAgICByZXR1cm4gbmV3VmFsdWU7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiDlrozmiJDlm57osIPlh73mlbDnmoTosIPnlKhcclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICBsZXQgbmV3VmFsdWUgPSB0aGlzLmdldCgpO1xyXG4gICAgdGhpcy5jYiAmJiB0aGlzLmNiKG5ld1ZhbHVlKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBjb21wdXRlRXhwcmVzc2lvbihleHAsc2NvcGUpIHtcclxuICAgIC8v5Yib5bu65Ye95pWwXHJcbiAgICAvL+aKinNjb3BlZOW9k+WBmuS9nOeUqOWfn1xyXG4gICAgLy/lh73mlbDlhoXpg6jkvb/nlKh3aXRo5p2l5oyH5a6a5L2c55So5Z+fXHJcbiAgICAvL+aJp+ihjOWHveaVsCzlvpfliLDooajovr7lvI/nmoTlgLxcclxuICAgIGxldCBmbiA9IG5ldyBGdW5jdGlvbihcInNjb3BlXCIsXCJ3aXRoKHNjb3BlKXtyZXR1cm4gXCIgKyBleHAgKyBcIn1cIik7XHJcbiAgICByZXR1cm4gZm4oc2NvcGUpXHJcbiAgfVxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIlxyXG5pbXBvcnQgT2JzZXJ2ZXIgZnJvbSBcIi4vb2JzZXJ2ZXJcIlxyXG5cclxuY2xhc3MgVnVlIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKXtcclxuICAgIC8v6I635Y+W5YWD57SgZG9t5a+56LGhXHJcbiAgICB0aGlzLiRlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5lbClcclxuICAgIC8v6L2s5a2Y5pWw5o2uXHJcbiAgICB0aGlzLiRkYXRhID0gb3B0aW9ucy5kYXRhIHx8IHt9XHJcbiAgICAvL+aVsOaNruS7o+eQhlxyXG4gICAgdGhpcy5fcHJveHlEYXRhKHRoaXMuJGRhdGEpO1xyXG4gICAgLy8g5Ye95pWw5Luj55CGXHJcbiAgICB0aGlzLl9wcm94eU1ldGhvZHMob3B0aW9ucy5tZXRob2RzKVxyXG4gICAgLy/mlbDmja7liqvmjIFcclxuICAgIG5ldyBPYnNlcnZlcih0aGlzLiRkYXRhKVxyXG4gICAgLy/mqKHmnb/nvJbor5FcclxuICAgIG5ldyBDb21waWxlcih0aGlzKVxyXG4gIH1cclxuICAvKipcclxuICAgKiDmlbDmja7ku6PnkIZcclxuICAgKiBAcGFyYW0geyp9IGRhdGEgXHJcbiAgICovXHJcbiAgX3Byb3h5RGF0YShkYXRhKXtcclxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsa2V5LHtcclxuICAgICAgICBzZXQobmV3VmFsdWUpe1xyXG4gICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXQoKXtcclxuICAgICAgICAgIHJldHVybiBkYXRhW2tleV1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgX3Byb3h5TWV0aG9kcyhtZXRob2RzKXtcclxuICAgIGlmKG1ldGhvZHMgJiYgdHlwZW9mIG1ldGhvZHMgPT09ICdvYmplY3QnKXtcclxuICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgIHRoaXNba2V5XSA9IG1ldGhvZHNba2V5XVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG53aW5kb3cuVnVlID0gVnVlIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9