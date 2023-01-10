/* 
  1. 生成页面文件模板
  2. 生成logic数据模板
  3. 注入路由？
*/

const fs = require('fs')
const { resolve, join } = require('path')
const { prompt } = require('inquirer')
const ejs = require('ejs')
const { isFileExist, existsubDir, mkFile } = require('../src/utils')

module.exports = async () => {
  const createNew = await askAction()
  if (createNew) {
    await createPageDir()
  } else {
    await choosePageDir()
  }
  console.log('创建完成')
}

// 新建页面文件夹
async function createPageDir() {
  const modelPath = await chooseViewModel()
  const { pageName } = await prompt([
    {
      name: 'pageName',
      message: '请输入新建页面文件名',
      default: 'NewPage',
      type: 'input'
    }
  ])
  const pagePath = resolve(modelPath, pageName)
  if (isFileExist(pagePath)) return
  fs.mkdirSync(pagePath)
  await createPage(pageName, pagePath)
  await createLogic(pageName, pagePath)
}



// 新建页面文件
async function createPage(pageName, path) {
  const tempPage = fs.readFileSync(resolve(__dirname, '../template/temp_view.ejs'), 'utf-8')
  const pageContent = ejs.render(tempPage, { pageName })
  mkFile(
    resolve(path, `${pageName}_view.dart`),
    pageContent.toString()
  )
}

// 新建页面对应logic文件
async function createLogic(logicName, path) {
  const tempLogic = fs.readFileSync(resolve(__dirname, '../template/temp_logic.ejs'), 'utf-8')
  const logicContent = ejs.render(tempLogic, { logicName })
  mkFile(
    resolve(path, `${logicName}_logic.dart`),
    logicContent.toString()
  )
}

// 选择已有文件夹进行创建
async function choosePageDir() {
  const pagePath = await chooseViewModel()
  const { pageName } = await prompt([
    {
      name: 'pageName',
      message: '请输入新建页面文件名',
      default: 'NewPage',
      type: 'input'
    }
  ])

  await createPage(pageName, pagePath)
  await createLogic(pageName, pagePath)
}


async function chooseViewModel() {
  const viewRootPath = resolve(process.cwd(), 'lib/ui')
  return await deepChooseDir(viewRootPath)
}

// 递归选择文件夹
async function deepChooseDir(path) {
  const curPath = resolve(path)
  const dirs = fs.readdirSync(curPath)
  const dirList = []
  dirs.forEach(dir => {
    const isDir = fs.statSync(resolve(curPath, dir)).isDirectory()
    if (isDir) {
      dirList.push({
        name: dir,
        value: resolve(curPath, dir)
      })
    }
  })
  const { dirName } = await prompt([
    {
      name: 'dirName',
      type: 'list',
      choices: dirList,
      message: '请选择你的目标文件夹'
    }
  ])
  
  const hasSubDir = existsubDir(resolve(curPath, dirName))
  const { inHere } = await prompt([
    {
      name: 'inHere',
      type: 'confirm',
      message: hasSubDir ? '是否在已选择的目录下创建，还是继续选择该目录下的子目录？' : '直接在该目录下创建？',
      default: true
    }
  ])
  if (inHere) { // 直接在此处创建
    return dirName
  } else { // 继续选择目录
    if (!hasSubDir) return dirName
    const res = deepChooseDir(dirName)
    return res
  }
}

async function askAction() {
  const res = await prompt([
    { 
      name: 'createNew',
      message: '新建 | 选择 一个文件模块',
      type: 'list',
      choices: [
        { name: '新建一个文件模块', value: true },
        { name: '选择一个文件模块', value: false },
      ]
    }
  ])
  return res.createNew
}