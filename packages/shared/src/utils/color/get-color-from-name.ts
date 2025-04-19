const nameToColorMap: Record<string, string> = {};

// 预定义适合文字的颜色
const TEXT_COLORS = [
  // 原有的暖色调
  '#E65D6E', // 暖红色
  '#F28B82', // 珊瑚红
  '#D67E3B', // 暖棕色
  '#E67C23', // 橙色
  '#947A47', // 暖褐色
  '#7B7C45', // 橄榄色
  '#16A085', // 青绿色
  '#4A6FA5', // 暖蓝色
  '#9B59B6', // 紫色
  '#B86A84', // 玫瑰色

  // 新增优雅莓果色系
  '#C0392B', // 深莓红
  '#D35400', // 赤陶色
  '#E74C3C', // 石榴红
  '#8E44AD', // 优雅紫
  '#884EA0', // 深紫罗兰

  // 新增自然色调
  '#27AE60', // 翡翠绿
  '#2ECC71', // 碧绿色
  '#1ABC9C', // 青碧色
  '#45B39D', // 薄荷绿
  '#228B22', // 森林绿

  // 新增深邃宝石色
  '#2980B9', // 蓝宝石
  '#3498DB', // 天蓝色
  '#1F618D', // 深海蓝
  '#6C3483', // 紫水晶
  '#5B2C6F', // 深紫色

  // 新增高级金属色调
  '#935116', // 古铜色
  '#B8860B', // 暗金色
  '#CD853F', // 秘鲁色
  '#8B4513', // 马鞍棕色
  '#A0522D', // 赭石色

  // 新增经典深色调
  '#34495E', // 深青灰
  '#2C3E50', // 午夜蓝
  '#7F8C8D', // 优雅灰
  '#795548', // 深棕色
  '#607D8B', // 青灰色
];

// 为不同色相范围定义适合文字显示的参数
const TEXT_HUE_ADJUSTMENTS: Record<string, { s: number; l: number }> = {
  red: { s: 65, l: 45 }, // 0-30
  orange: { s: 70, l: 42 }, // 31-60
  yellow: { s: 65, l: 40 }, // 61-90
  green: { s: 55, l: 38 }, // 91-150
  cyan: { s: 50, l: 40 }, // 151-210
  blue: { s: 55, l: 45 }, // 211-270
  purple: { s: 45, l: 45 }, // 271-330
  pink: { s: 60, l: 45 }, // 331-360
};

export function getColorFromName(name: string): string {
  // 检查缓存
  if (nameToColorMap[name]) {
    return nameToColorMap[name];
  }

  // 生成哈希
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  if (name.length <= 3) {
    const index = hash % TEXT_COLORS.length;
    const color = TEXT_COLORS[index];
    nameToColorMap[name] = color;
    return color;
  }

  // 生成色相，稍微偏向暖色调但保持一定范围
  let hue = Math.abs(hash % 360);
  // 轻微调整色相，增加暖色调比例
  if (hue > 180 && hue < 270) {
    hue = (hue % 60) + 15; // 将部分冷色调映射到暖色调，但保持一定的颜色多样性
  }

  // 获取色相对应的参数
  let { s: saturation, l: lightness } = (() => {
    if (hue <= 30) {
      return TEXT_HUE_ADJUSTMENTS.red;
    }
    if (hue <= 60) {
      return TEXT_HUE_ADJUSTMENTS.orange;
    }
    if (hue <= 90) {
      return TEXT_HUE_ADJUSTMENTS.yellow;
    }
    if (hue <= 150) {
      return TEXT_HUE_ADJUSTMENTS.green;
    }
    if (hue <= 210) {
      return TEXT_HUE_ADJUSTMENTS.cyan;
    }
    if (hue <= 270) {
      return TEXT_HUE_ADJUSTMENTS.blue;
    }
    if (hue <= 330) {
      return TEXT_HUE_ADJUSTMENTS.purple;
    }
    return TEXT_HUE_ADJUSTMENTS.pink;
  })();

  // 添加细微的随机调整，但保持在合理范围内
  const saturationAdjust = (hash % 8) - 4;
  const lightnessAdjust = ((hash >> 3) % 6) - 3;

  saturation = Math.max(45, Math.min(75, saturation + saturationAdjust));
  lightness = Math.max(35, Math.min(50, lightness + lightnessAdjust));

  // 生成最终颜色
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  nameToColorMap[name] = color;
  return color;
}
