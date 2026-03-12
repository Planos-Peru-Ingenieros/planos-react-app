import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://intranet.planosperu.com.pe/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export const getCotizaciones = async () => {
  const { data } = await api.get('/cotizaciones/')
  return data
}
