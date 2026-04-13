/**
 * 本地临时存储工具类
 * 历史对话数据存储在 temp 空间
 */
const STORAGE_KEY = "temp_chat_history";

// 读取历史对话
export function getHistoryList() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// 保存历史对话
export function saveHistoryList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 清空历史对话
export function clearHistoryList() {
  localStorage.removeItem(STORAGE_KEY);
}
