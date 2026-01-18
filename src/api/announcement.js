import request from '../utils/request'

// 获取公告列表
export const getAnnouncements = (params) => request.get('/announcements', { params })

// 创建公告
export const createAnnouncement = (data) => request.post('/announcements', data)

// 更新公告
export const updateAnnouncement = (id, data) => request.put(`/announcements/${id}`, data)

// 删除公告
export const deleteAnnouncement = (id) => request.delete(`/announcements/${id}`)

// 切换公告状态
export const toggleAnnouncementStatus = (id, status) => request.patch(`/announcements/${id}/status`, { status })

// 获取公开公告列表
export const getPublicAnnouncements = (params) =>
  request.get('/announcements', params ? { params } : undefined)
