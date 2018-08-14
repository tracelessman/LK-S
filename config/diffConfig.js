//config in this file varies from users and occations ,or includes credential information that should not be added
// to version control
const diffConfig = {
    db:{
        username:"",
        password:""
    },
    sshInfo:{
        username:"",
        password:""
    }
}


Object.freeze(diffConfig)

module.exports = diffConfig
