/**
 * 解决 BigInt 在 JSON 序列化时的问题
 */
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
