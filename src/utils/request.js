import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// Crie uma instância de axios
const service = axios.create({
  baseURL: process.env.BASE_API, // api base_url
  timeout: 5000 // tempo limite
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['X-Token'] = getToken() // Define o token de autorização
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {

    console.log('success', response) // for debug

    /**
     * code !== 20000 - - regra de negócio
     */
    const res = response.data
    if (res.code !== 20000) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      // Códigos de erro
      //  50008: token ilegal; 50012: outros clientes conectados; 50014: token expirado
      //
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          'Você foi desconectado, pode cancelar para permanecer nessa página ou fazer login novamente',
          'Confirme o logout',
          {
            confirmButtonText: 'Fazer login novamente',
            cancelButtonText: 'Cancelar',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // Para re-instanciar o objeto roteador vue para evitar erros
          })
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('error', error.response) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
