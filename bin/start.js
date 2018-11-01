const childProcess = require('child_process')
const path = require('path')
const rootPath = path.resolve(__dirname, '../')
childProcess.execSync(`npx nuxt start`, {
  cwd: rootPath
})
