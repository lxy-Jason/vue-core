import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

function Vue(options) {
  //options就是用户的选项
  this._init(options);
}

initMixin(Vue); //扩展了init方法
initLifeCycle(Vue); //vm._update  vm._render
initGlobalAPI(Vue); //全局api的实现
initStateMixin(Vue); //实现nextTick $watch

// ---测试代码
let render1 = compileToFunction(`<ul  style="color:red">
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
</ul>`);
let vm1 = new Vue({
  data: { name: "zf" },
});
let prevVonde = render1.call(vm1);
let el = createElm(prevVonde);
document.body.appendChild(el);

let render2 = compileToFunction(`<ul style="color:red;background:blue" >
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
  <li key="d">d</li>
  <li key="e">e</li>
</ul>`);
let vm2 = new Vue({
  data: { name: "zf" },
});
let nextVonde = render2.call(vm2);

setTimeout(() => {
  patch(prevVonde, nextVonde);
}, 1000);

export default Vue;
