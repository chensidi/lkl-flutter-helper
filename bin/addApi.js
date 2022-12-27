/* 
  model 层
  1. 是否有model， 没有则创建
  2. 选择要新建api_model的位置
  3. 新增api对应dart文件

  api 层
  1. 检测api是否存在，没有则创建
  2. 建立对应api的dart文件
  3. api地址添加到net/http_api.dart下

*/

const fs = require('fs')
const { resolve, join } = require('path')
const { prompt } = require('inquirer')
const ejs = require('ejs')

module.exports = async function addApi() {
  if (!isModelExist()) {
    createModel()
  }
  const createNew = await askAction()
  if (createNew) {
    await createNewModel()
  } else {
    await chooseSubModel()
  }

  if (!isApiExist()) {
    createApi()
  }
  await createApiFile()
  console.log('创建完成')
}

function isModelExist() {
  const path = resolve(process.cwd(), 'lib/model')
  return fs.existsSync(path)
}

function createModel() {
  const path = resolve(process.cwd(), 'lib/model')
  fs.mkdirSync(path)
}

async function askAction() {
  const res = await prompt([
    { 
      name: 'createNew',
      message: '新建 | 选择 一个存放的子model',
      type: 'list',
      choices: [
        { name: '新建一个子model', value: true },
        { name: '选择一个子model', value: false },
      ]
    }
  ])
  return res.createNew
}

// 创建新的子model
async function createNewModel() {
  const res = await prompt([
    { 
      name: 'modelName',
      message: '输入子model的文件夹名称',
      type: 'input',
      default: 'subModel'
    }
  ])
  const { modelName } = res
  // 判断输入的子model是否存在

  const subModelPath = resolve(process.cwd(), 'lib/model', modelName)
  fs.mkdirSync(subModelPath)
  createDemoDart(subModelPath, modelName)
}

// 子model中写入样板dart
function createDemoDart(path, modelName) {
  const demoPath = resolve(path, `${modelName}.dart`)
  const demeClass = 
  `class ${modelName} {

  }`
  fs.writeFileSync(demoPath, demeClass)
}

// 选择model子目录并创建对应demo.dart
async function chooseSubModel() {
  const modelPath = resolve(process.cwd(), 'lib/model')
  const subModel = fs.readdirSync(modelPath)
  const res = await prompt([
    {
      name: 'subModelName',
      type: 'list',
      message: '选择一个存放model的子目录',
      choices: subModel.map(model => ({
        name: model,
        value: model
      }))
    },
    {
      name: 'dartName',
      type: 'input',
      message: '新建model的文件名?',
    }
  ])
  const { subModelName, dartName } = res
  const subModelPath = resolve(process.cwd(), 'lib/model', subModelName)
  createDemoDart(subModelPath, dartName)
}

function isApiExist() {
  const path = resolve(process.cwd(), 'lib/api')
  return fs.existsSync(path)
} 

function createApi() {
  const path = resolve(process.cwd(), 'lib/api')
  fs.mkdirSync(path)
}

async function createApiFile() {
  const { apiName, apiUrl } = await prompt([
    {
      type: 'input',
      name: 'apiName',
      message: '请输入新建api文件名',
    },
    {
      type: 'input',
      name: 'apiUrl',
      message: '请输入新建api的url地址',
    }
  ])
  const apiFilePath = resolve(process.cwd(), 'lib/api', `${apiName}.dart`)
  const demoContent = fs.readFileSync(resolve(__dirname, '../template/temp_api.ejs'), { encoding: 'utf-8' })
  const renderStr = ejs.render(demoContent, { api: apiName})
  fs.writeFileSync(apiFilePath, renderStr)
  appendApiUrl(apiName, apiUrl)
}

// 追加apiUrl地址到http_api.dart
function appendApiUrl(apiProp, url) {
  const apiPath = resolve(process.cwd(), 'lib/net/http_api.dart')
  const preApi = fs.readFileSync(
    apiPath
  ).toString('utf-8')
  const nowApi = preApi.replace(/(\B)(?=\})/g, `  static const String ${apiProp} = '${url}';\n`)
  fs.writeFileSync(apiPath, nowApi)
}