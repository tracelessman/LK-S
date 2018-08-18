//config in this file varies from users and occations ,or includes credential information that should not be added
// to version control
const diffConfig = {

    sshInfo:{
        username:"root",
        password:"abc@147258369"
    }
}


Object.freeze(diffConfig)

module.exports = diffConfig
