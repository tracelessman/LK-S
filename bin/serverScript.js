const {CliUtil} = require('@ys/collection')
const {killPort} = CliUtil

killPort(3000, 3001, 4000, 4001)
