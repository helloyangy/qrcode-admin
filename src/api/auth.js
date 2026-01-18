import request from '../utils/request'

export const login = (data) => request.post('/login', data)
export const logout = () => request.post('/logout')
export const getMe = () => request.get('/me')
export const updateProfile = (data) => request.put('/profile', data)
export const updatePassword = (data) => request.put('/password', data)
