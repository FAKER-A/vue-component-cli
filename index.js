#!/usr/bin/env node
const program = require('commander')
const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const validateComponentName = require('validate-npm-package-name')

const gitRepo = {
  base: 'direct:git@github.com:FAKER-A/webpack-starter-vue-lib.git'
} 

program
  .version('0.0.1')
  .option('-i, init <componentName>', 'input component name')
program.parse(process.argv)

if(program.init) {
  initTemplateDefault()
}

async function initTemplateDefault() {
  const componentName = program.init
  console.log(chalk.bold.cyan("vueComponent: ") + 'will creating a new vue component starter')
  const spinner = ora('download template......').start()
  try {
    await checkName(componentName)
    await downloadTemplate(gitRepo.base, componentName)
    await changeTemplate(componentName)
    spinner.clear()
    console.log(chalk.green('template download completed'))
    console.log(chalk.bold.cyan("vueComponent: ") + 'a new vue component starter is created')
    console.log(chalk.green(`cd ${componentName} && npm install or cd ${componentName} && yarn`))
    process.exit(1)
  } catch (error) {
    spinner.clear()
    console.log(chalk.red(error))
    process.exit(1)
  }
}

function checkName(componentName) {
  return new Promise((resolve, reject) => {
    fs.readdir(process.cwd(), (err, data) => {
      if(err) {
        return reject(err)
      }
      if(data.includes(componentName)) {
        return reject(new Error(`${componentName} already exists!`))
      }
      const validationResult = validateComponentName(componentName);
      if (!validationResult.validForNewPackages) {
        return reject(new Error(`
          Could not create a component called ${componentName} because of npm naming restrictions!
        `))
      }
      resolve()
    })
  })
}

function downloadTemplate(gitUrl,componentName) {
  return new Promise((resolve, reject) => {
    download(gitUrl, path.resolve(process.cwd(), componentName), { clone:true }, function(err) {
      if(err) {
        return reject(err)
      }
      resolve()
    })
  })
}
function changeTemplate(componentName) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(process.cwd(), componentName, 'package.json'), 'utf8', (err, data) => {
      if(err) {
        return reject(err) 
      }
      let packageData = JSON.parse(data)
      packageData.name = componentName
      fs.writeFile(path.resolve(process.cwd(), componentName, 'package.json'), JSON.stringify(packageData, null, 2), 'utf8', (err, data) => {
        if(err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}