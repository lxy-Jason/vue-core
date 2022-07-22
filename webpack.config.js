const path = require("path")

module.exports = {
  mode:'development',
  devtool:'inline-cheap-source-map',
  entry:path.resolve(__dirname,"./src/index.js"),
  output:{
    path:path.resolve(__dirname,'dist'),
    filename:'vue.js'
  },
  
}