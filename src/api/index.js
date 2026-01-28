import request from '../utils/request'
import * as authApi from './auth'
import * as qrcodeApi from './qrcode'
import * as monitorApi from './monitor'
import * as fileApi from './file'

// 导出 request 实例以兼容旧代码
export default request

// 导出所有 API 模块
export const apiLogin = authApi.login
export const apiLogout = authApi.logout
export const apiMe = authApi.getMe
export const apiHiddenGenerateQRCode = qrcodeApi.generateHiddenQRCode

// 推荐使用以下命名导出
export {
  authApi,
  qrcodeApi,
  monitorApi,
  fileApi
}
