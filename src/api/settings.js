import request from '../utils/request'

export const getSettings = () => {
  return request({
    url: '/admin/settings',
    method: 'get'
  })
}

export const updateSettings = (data) => {
  return request({
    url: '/admin/settings',
    method: 'put',
    data
  })
}
