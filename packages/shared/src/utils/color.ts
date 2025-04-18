const nameToColorMap: Record<string, string> = {};

export function getColorFromName(name: string): string {
  if (nameToColorMap[name]) {
    return nameToColorMap[name];
  }
  // 生成简单的哈希值
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 使用 HSL 颜色空间
  // Hue: 0-360
  // Saturation: 固定在 70% 保证适中的饱和度
  // Lightness: 固定在 45% 保证足够的对比度
  const hue = Math.abs(hash % 360);
  const color = `hsl(${hue}, 70%, 45%)`;
  nameToColorMap[name] = color;
  return color;
}
