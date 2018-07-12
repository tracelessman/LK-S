
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const fse = require('fs-extra')
const path = require('path');
const uuidV4 = require('uuid/v4')
const config = require("../config")
const util = require('../util')

const option = {
    ...config.db,
    mainDatabase:'LK_S',
    metaDatabase:"LK_S_META"
}

module.exports = {
    mainDbPromise:util.setDb(option)
}

