import axios from 'axios'
import {boot} from 'quasar/wrappers'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export {api}
