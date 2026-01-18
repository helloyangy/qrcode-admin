import request from '../utils/request'

// 获取失败登录记录
export const getFailedLogins = (params) => request.get('/failed-logins', { params })

// 获取系统监控状态
export const getSystemStatus = () => request.get('/monitor/status')
