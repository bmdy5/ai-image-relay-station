export const defaultImageName = () => {
  const now = new Date();
  return `Visionary_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
};

export const downloadWithName = (url, defaultName) => {
  const name = window.prompt('请输入保存的文件名', defaultName);
  if (!name) return;
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.png`;
  link.click();
};
