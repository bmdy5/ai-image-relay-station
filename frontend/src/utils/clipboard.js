/**
 * 通用剪贴板复制工具
 * @param {string} text 需要复制的文本
 * @param {function} callback 成功后的回调函数 (例如 showToast)
 */
export const copyToClipboard = (text, callback) => {
  if (!text) return;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
      // 回退方案
      fallbackCopy(text, callback);
    });
  } else {
    fallbackCopy(text, callback);
  }
};

const fallbackCopy = (text, callback) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    if (callback) callback('已复制到剪贴板');
  } catch (err) {
    console.error('Fallback 复制失败:', err);
  }
  document.body.removeChild(textArea);
};
