import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useSupplierStore = defineStore('Supplier', () => {
  const supplierInn = ref<string | null>(null)

  return {
    supplierInn,
  }
})
