import request from './request'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useUserStore } from '../stores/userStore'

class FatalError extends Error {}

export const fetchChats = () => {
  return request.get('/api/chats')
}

export const createChat = (data) => {
  return request.post('/api/chats', data)
}

export const updateChat = (chatId, data) => {
  return request.put(`/api/chats/${chatId}`, data)
}

export const deleteChat = (chatId) => {
  return request.delete(`/api/chats/${chatId}`)
}

export const fetchMessages = (chatId) => {
  return request.get(`/api/chats/${chatId}/messages`)
}

export const sendStreamMessage = async (chatId, content, callbacks) => {
  const userStore = useUserStore()
  let completed = false
  
  await fetchEventSource(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.token}`
    },
    body: JSON.stringify({ content }),
    signal: callbacks.signal,
    async onopen(response) {
      if (response.ok) {
        return; // everything's good
      } else {
        throw new Error(`Failed to establish stream: ${response.status}`);
      }
    },
    onmessage(msg) {
      if (msg.event === 'start') {
        if (callbacks.onStart) callbacks.onStart(msg.data ? JSON.parse(msg.data) : null);
      } else if (msg.event === 'weather') {
        if (callbacks.onWeather) callbacks.onWeather(msg.data ? JSON.parse(msg.data) : null);
      } else if (msg.event === 'delta') {
        if (callbacks.onDelta) callbacks.onDelta(msg.data ? JSON.parse(msg.data) : null);
      } else if (msg.event === 'done') {
        completed = true
        if (callbacks.onDone) callbacks.onDone(msg.data ? JSON.parse(msg.data) : null);
      }
    },
    onclose() {
      if (completed) return
      // 抛出严重错误以彻底阻止 @microsoft/fetch-event-source 的自动重发机制
      // 防止重复调用接口导致数据库写入冗余的同一条用户消息
      throw new FatalError('Stream closed');
    },
    onerror(err) {
      if (err instanceof FatalError) {
        throw err; // Stop retrying
      }
      if (callbacks.onError) callbacks.onError(err);
      throw err; // Ensure we don't retry locally indefinitely if it crashes
    }
  })
}
