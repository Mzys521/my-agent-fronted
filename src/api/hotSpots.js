import request from './request'

export const fetchWeeklyHotSpots = (limit = 3) => {
  return request.get(`/api/hot-spots?limit=${limit}`)
}
