/* 
import { resolve } from './../node_modules/@types/node/dns.d';
  打包相关命令集合
*/

const child_process = require('child_process')
const { resolve } = require('path')
const shell = require('shelljs')
const fs = require('fs')
const dayjs = require('dayjs')
const ncp = require("copy-paste");

let useTime = 0

module.exports = ({ vsit, canary, production, name }) => {
  // ncp.copy('some text', function () {
  //   // complete...
  // })
  // return
  if (vsit) { // 测试环境
    // return execBuildCmd(['run','build:android:vsit'])
    execOriginCmd('main_vsit.dart', 'vist')
    return intoLog({vsit, canary, production}, name)
  }
  if (canary) {
    // return execBuildCmd(['run','build:android:canary'])
    execOriginCmd('main_canary.dart', 'canary')
    return intoLog({vsit, canary, production}, name)
  }
  if (production) {
    // return execBuildCmd(['run','build:android'])
    execOriginCmd('main.dart', 'prod')
    return intoLog({vsit, canary, production}, name)
  }
}

function execBuildCmd(cmd) {
  child_process.spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', [...cmd], {
    'cwd': process.cwd(),
    'stdio': 'inherit',
  })
}

function execOriginCmd(entry, env) {
  const startTime = Date.now()
  shell.exec(`flutter build apk lib/${entry}`, {
    'async': false
  })
  useTime = (Date.now() - startTime) / 1000
  openBuildDir()
  saveApk()
}

function openBuildDir() {
  child_process.exec(`start "" "${resolve(process.cwd(), 'build/app/outputs/flutter-apk')}"`)
}

function getBuildInfo({ vsit, canary, production }) {
  const user = child_process.execSync('git config user.name')
  const commitInfo = child_process.execSync('git log -1 --decorate=short --no-merges --oneline')
  const commitTime = child_process.execSync('git log --pretty=format:“%cd” -1')
  const buildTime = new Date().toLocaleString()

  const buildInfo = {
    '构建者': user.toString(),
    '最近提交信息': commitInfo.toString(),
    '提交时间': commitTime.toString(),
    '构建时间': buildTime,
    '构建环境': vsit ? '测试环境' : (
      canary ? '验证环境' : '生产环境'
    ),
    '构建耗时': `${useTime} 秒`
  }

  return buildInfo
}

function intoLog({ vsit, canary, production }, name) {
  const logPath = resolve(process.cwd(), './buildLog.json')
  if (!fs.existsSync(logPath)) {
    fs.cpSync(
      resolve(__dirname, '../template/buildLog.json'),
      logPath
    )
  }
  const json = require(logPath)
  const readApk = fs.createReadStream(resolve(process.cwd(), 'build/app/outputs/flutter-apk/app-release.apk'))
  let len = 0
  readApk.on('data', (chunk) => {
    len += chunk.length
  })
  readApk.on('end', () => {
    Object.assign(json.logList, [
      {
        ...getBuildInfo({ vsit, canary, production }),
        '产物大小': Math.ceil(len / 1024 / 1024) + ' M'
      },
      ...json.logList,
    ])
    fs.writeFileSync(logPath, JSON.stringify(json, null, 2))
    renameApk(
      vsit ? 'vsit' : (canary ? 'canary' : production ? 'prod' : ''),
      name
    )
  })
}

// 保存apk副本
function saveApk() {
  const day = dayjs().format('YYYY-MM-DD HH.mm')
  const apk = resolve(process.cwd(), 'build/app/outputs/flutter-apk/app-release.apk')
  const apkBuildDir = resolve('D:\\flutter-apk')
  if (!fs.existsSync(apkBuildDir)) {
    fs.mkdirSync(apkBuildDir)
  }
  fs.cpSync(apk, resolve(
    apkBuildDir,
    day + '.apk'
  ))
}

// 根据构建环境重命名
function renameApk(env, name) {
  const apkPath = resolve(process.cwd(), 'build/app/outputs/flutter-apk/app-release.apk')
  const rename = name ? resolve(process.cwd(), `build/app/outputs/flutter-apk/${name}.apk`) : resolve(process.cwd(), `build/app/outputs/flutter-apk/app-release-${env}.apk`)
  fs.renameSync(apkPath, rename)
}