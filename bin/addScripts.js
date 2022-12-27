/* 
  package.json 添加脚本命令
  1. package.json 原本存在，则添加scripts字段
  2. 不存在直接拷贝模板文件
*/

const { resolve } = require('path')
const fs = require('fs')

module.exports = () => {
  if (isPackageExist()) {
    addScripts()
  } else {
    fs.copyFileSync(
      resolve(__dirname, '../template/temp.json'),
      resolve(process.cwd(), 'package.json')
    )
  }
  console.log('脚本添加完成')
}

function isPackageExist() {
  const packagePath = resolve(process.cwd(), 'package.json')
  return fs.existsSync(packagePath)
}

function addScripts() {
  const preScripts = require(resolve(process.cwd(), 'package.json'))
  const tempScripts = require(resolve(__dirname, '../template/temp.json'))
  Object.assign(preScripts, {
    scripts: {
      ...preScripts.scripts,
      ...tempScripts.scripts,
    }
  })
  fs.writeFileSync(
    resolve(process.cwd(), 'package.json'),
    JSON.stringify(preScripts, null, 2)
  )
}