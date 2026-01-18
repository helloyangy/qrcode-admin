import request from '../utils/request'

// 获取二维码列表
export const getQRCodes = (params) => request.get('/qrcodes', { params })

// 生成普通二维码
export const generateQRCode = (data) => {
  if (data instanceof FormData) {
    return request.post('/qrcode/generate', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
  return request.post('/qrcode/generate', data)
}

// 生成隐藏式二维码
export const generateHiddenQRCode = (data) => request.post('/qrcode/hidden-generate', data)

// 生成彩色二维码
export const generateColorfulQRCode = (data) => {
  if (data instanceof FormData) {
    return request.post('/colorful/qrcode/generate', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
  return request.post('/colorful/qrcode/generate', data)
}

// 删除单个二维码
export const deleteQRCode = (id) => request.delete(`/qrcodes/${id}`)

// 批量删除二维码
export const batchDeleteQRCode = (data) => request.post('/qrcodes/batch-delete', data)

// 检查链接有效性
export const checkUrlValidity = (url) => request.post('/qrcode/check-url', { url })

// ==========================================
// 公开接口 (无需登录)
// ==========================================

// 公开：生成普通二维码
export const generatePublicQRCode = (data) => {
  if (data instanceof FormData) {
    return request.post('/public/qrcode/generate', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
  return request.post('/public/qrcode/generate', data)
}

// 公开：生成彩色二维码
export const generatePublicColorfulQRCode = (data) => {
  if (data instanceof FormData) {
    return request.post('/public/colorful/qrcode/generate', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
  return request.post('/public/colorful/qrcode/generate', data)
}

// 公开：生成隐藏式二维码
export const generatePublicHiddenQRCode = (data) => request.post('/public/qrcode/hidden-generate', data)
