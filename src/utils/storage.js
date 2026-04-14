// 存储结构：{ [userId]: [对话列表] }
const STORAGE_USER_HISTORY = "temp_user_chat_history";
// 消息结构：{ [chatId]: [消息列表] }
const STORAGE_CHAT_MESSAGES = "temp_chat_messages";

// 当前固定测试 userId（真实项目从登录态拿）
const CURRENT_USER_ID = "default_user";

// -------------------------
// 1. 获取当前用户的所有对话
// -------------------------
export function getUserChatList() {
  try {
    const data = localStorage.getItem(STORAGE_USER_HISTORY);
    const userMap = data ? JSON.parse(data) : {};
    return userMap[CURRENT_USER_ID] || [];
  } catch (e) {
    return [];
  }
}

// -------------------------
// 2. 保存对话到当前用户
// -------------------------
export function saveUserChatList(chatList) {
  try {
    const data = localStorage.getItem(STORAGE_USER_HISTORY);
    const userMap = data ? JSON.parse(data) : {};
    userMap[CURRENT_USER_ID] = chatList;
    localStorage.setItem(STORAGE_USER_HISTORY, JSON.stringify(userMap));
  } catch (e) {}
}

// -------------------------
// 3. 获取某个对话的消息
// -------------------------
export function getChatMessages(chatId) {
  try {
    const all = localStorage.getItem(STORAGE_CHAT_MESSAGES);
    const msgMap = all ? JSON.parse(all) : {};
    return (
      msgMap[chatId] || [{ sender: "ai", text: "你好，我是你的旅行智能助手～" }]
    );
  } catch (e) {
    return [{ sender: "ai", text: "你好，我是你的旅行智能助手～" }];
  }
}

// -------------------------
// 4. 保存某个对话的消息
// -------------------------
export function saveChatMessages(chatId, messages) {
  try {
    const all = localStorage.getItem(STORAGE_CHAT_MESSAGES);
    const msgMap = all ? JSON.parse(all) : {};
    msgMap[chatId] = messages;
    localStorage.setItem(STORAGE_CHAT_MESSAGES, JSON.stringify(msgMap));
  } catch (e) {}
}

// -------------------------
// 5. 删除对话（同时删消息）
// -------------------------
export function deleteChat(chatId) {
  try {
    // 删消息
    const allMsg = localStorage.getItem(STORAGE_CHAT_MESSAGES);
    if (allMsg) {
      const msgMap = JSON.parse(allMsg);
      delete msgMap[chatId];
      localStorage.setItem(STORAGE_CHAT_MESSAGES, JSON.stringify(msgMap));
    }

    // 删用户对话列表里的项
    const list = getUserChatList();
    const newList = list.filter((c) => c.id !== chatId);
    saveUserChatList(newList);
  } catch (e) {}
}
