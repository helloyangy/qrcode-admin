import request from '../utils/request'

export const getMiniappFiles = (params) =>
  request.get('/admin/mini-program/files', { params })

export const uploadMiniappFile = (data) => {
  throw new Error('后台不支持上传，文件由小程序端上传')
}

export const deleteMiniappFile = (key) =>
  request.delete('/admin/mini-program/files', { data: { key } })

export const batchDeleteMiniappFiles = (data) =>
  request.post('/admin/mini-program/files/batch-delete', data)
