#!/usr/bin/env node

const { program } = require('commander')

// 添加api一套文件模板
program
  .command('addApi')
  .option('-i, --i <char>')
  .action(async ({ i }) => {
    require('./addApi')()
  })

// 添加api一套文件模板
program
  .command('addPage')
  .option('-i, --i <char>')
  .action(async ({ i }) => {
    require('./addPage')()
  })

// 打包相关
program
  .command('build')
  .option('-V, --vsit')
  .option('-C, --canary')
  .option('-P, --production')
  .option('-N, --name <char>', '打包后重命名')
  .action(async ({ vsit, canary, production, name }) => {
    require('./build')({ vsit, canary, production, name })
  })

// 添加配置package.json命令
program
  .command('addScripts')
  .action(async () => {
    require('./addScripts')()
  })

program.parse(process.argv)