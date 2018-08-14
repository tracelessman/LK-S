const ssh = require('node-ssh')
const {NODE_ENV} = process.env
const inquirer = require('inquirer')
const path = require('path')
const rootPath = path.resolve(__dirname,'../')



const questionAry = []

if(!NODE_ENV){
    questionAry.push({
        type: 'list',
        name: 'NODE_ENV',
        message: 'what is the NODE_ENV?',
        choices: ['testing', 'production'],

    })
}

(async()=>{
     const answer = await inquirer.prompt(questionAry)
     process.env.NODE_ENV = answer.NODE_ENV
     const config = require(path.resolve(rootPath,'config'))

    console.log(config)

})()
