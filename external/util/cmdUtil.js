const inquirer = require('inquirer')

const cmdUtil = {
    async getEnv(){
        const {NODE_ENV} = process.env

        if(!NODE_ENV){
            const questionAry = []
            questionAry.push({
                type: 'list',
                name: 'NODE_ENV',
                message: 'what is the NODE_ENV?',
                choices: ['testing', 'production','development'],

            })
            const answer = await inquirer.prompt(questionAry)
            process.env.NODE_ENV = answer.NODE_ENV
        }
        return process.env.NODE_ENV
    }
}

Object.freeze(cmdUtil)

module.exports = cmdUtil
