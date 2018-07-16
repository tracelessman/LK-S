<template>
    <div>
        <Entry :content="content"/>
    </div>

</template>

<script>
import axios from '~/plugins/axios'
import Entry from '../components/Entry'
const frontState = require('../state/frontState')
const {httpPost} = require('../frontend/util')

export default {
  async asyncData () {

    // const content =  await new Promise(resolve=>{
    //       httpPost({
    //           url:"/api/orm/getOrm",
    //           successCb:(content)=>{
    //               resolve(content)
    //           }
    //       })
    //   })
    return {
        content:32
    }
  },
  head () {
    return {
      title: 'LK管理控制台'
    }
  },
    components:{
        Entry
    },
    methods:{

    },
    beforeMount(){
        frontState.rootView = this
    }
}
</script>

<style scoped>

</style>
