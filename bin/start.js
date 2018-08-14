const childProcess = require('child_process')
childProcess.execSync(`npm run start:${process.env.NODE_ENV}`)
