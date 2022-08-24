
import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
//rollup可以导出一个对象 作为打包的配置文件
export default {
  input:'./src/index.js', //入口
  output:{
    file:'./dist/vue.js', //出口
    name:'Vue',
    format:'umd',//esm es6模块 commonjs模块 iife自执行函数 umd(兼容commonjs,iife,adm)
    sourcemap:true,//希望可以调试源代码
  },
  plugins:[
    babel({
      exclude:'node_modules/**',//排出node_modules里的所有文件
    }),
    resolve()
  ]
}