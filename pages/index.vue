<template>
    <div>
        <Entry/>
    </div>

</template>

<script>
import axios from '~/plugins/axios'
import Entry from '../components/Entry'
const frontState = require('../state/frontState')

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
