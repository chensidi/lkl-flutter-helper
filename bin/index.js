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
  .action(async ({ vsit, canary, production }) => {
    require('./build')({ vsit, canary, production })
  })

// 添加配置package.json命令
program
  .command('addScripts')
  .action(async () => {
    require('./addScripts')()
  })

program.parse(process.argv)