export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0; // 生成一个随机数 [0, 15]
    var v = c === 'x' ? r : (r & 0x3) | 0x8; // 'x' 用随机值，'y' 用 8、9、a、b 中的随机值
    return v.toString(16); // 转换为十六进制字符串
  });
}
