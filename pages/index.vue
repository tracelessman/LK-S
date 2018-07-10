<template>
    <div>
        <Entry/>
    </div>

</template>

<script>
import axios from '~/plugins/axios'
const frontState = require('../state/frontState')
import Entry from '../components/Entry'



export default {
  async asyncData () {
      // await
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
