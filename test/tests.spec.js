var expect = chai.expect
describe('测试mvvm',()=>{
  let vm = new Vue({
    data:{
      msg:'hello world'
    }
  })
  it('测试options',()=>{
    expect(vm.$data).to.be.contain({msg:'hello world'})
    
  })
})