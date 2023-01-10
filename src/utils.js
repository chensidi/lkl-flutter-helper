const fs = require('fs')
const { resolve } = require('path')

function isFileExist(path) {
  console.log(`已存在该路径${path}`)
  return fs.existsSync(path)
}

function existsubDir(path) {
  console.log(path)
  const dirs = fs.readdirSync(path)
  const res = dirs.find(dir => {
    const isDir = fs.statSync(resolve(path, dir)).isDirectory()
    if (isDir) {
      return true
    }
  })
  return !!res
}

function mkFile(path, content) {
  if (isFileExist(path)) return
  fs.writeFileSync(
    path,
    content
  )
}

module.exports = {
  isFileExist,
  existsubDir,
  mkFile
}