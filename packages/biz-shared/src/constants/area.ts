import { Area } from '../types';
import { Region } from '../types/region';
import { REGION_LABEL_MAP } from './region';

const AREA_REGIONS_MAP: Record<Area, Region[]> = {
  // MENA 区域
  [Area.MENA]: [
    Region.AE,
    Region.BH,
    Region.DJ,
    Region.DZ,
    Region.EG,
    Region.IQ,
    Region.JO,
    Region.KM,
    Region.KW,
    Region.LB,
    Region.LY,
    Region.MA,
    Region.MR,
    Region.OM,
    Region.PS,
    Region.QA,
    Region.SA,
    Region.SD,
    Region.SO,
    Region.TN,
    Region.YE,
  ],

  // RU+ 区域
  [Area.RU_PLUS]: [
    Region.RU,
    Region.UA,
    Region.BY,
    Region.KZ,
    Region.AZ,
    Region.GE,
    Region.TM,
    Region.KG,
    Region.TJ,
    Region.AM,
    Region.MD,
    Region.UZ,
  ],

  // 单一区域映射
  [Area.TR]: [Region.TR],
  [Area.ID]: [Region.ID],
  [Area.VN]: [Region.VN],
  [Area.TH]: [Region.TH],

  // UK+ 区域
  [Area.UK_PLUS]: [
    Region.GB,
    Region.GR,
    Region.AL,
    Region.IE,
    Region.LT,
    Region.RS,
    Region.LV,
    Region.EE,
    Region.MK,
    Region.BA,
    Region.MT,
    Region.ME,
    Region.FO,
    Region.GI,
    Region.JE,
    Region.IM,
    Region.GG,
    Region.CD,
    Region.SM,
    Region.SJ,
  ],

  [Area.BR]: [Region.BR],
  [Area.MY]: [Region.MY],
  [Area.TW]: [Region.TW],
  [Area.PH]: [Region.PH],
  [Area.US]: [Region.US, Region.CA],
  [Area.JP]: [Region.JP],
  [Area.KR]: [Region.KR],

  // LATAM 区域
  [Area.LATAM]: [
    Region.AR,
    Region.CL,
    Region.PE,
    Region.CO,
    Region.EC,
    Region.PA,
    Region.BO,
    Region.CR,
    Region.UY,
    Region.DO,
    Region.GT,
    Region.HN,
    Region.VE,
    Region.SV,
    Region.NI,
    Region.PY,
    Region.PR,
    Region.GN,
    Region.MX,
  ],

  // DE+ 区域
  [Area.DE_PLUS]: [Region.DE, Region.CH, Region.AT, Region.LI, Region.LU],

  [Area.RO]: [Region.RO],

  // FR+ 区域
  [Area.FR_PLUS]: [
    Region.FR,
    Region.BE,
    Region.GF,
    Region.MC,
    Region.PF,
    Region.TF,
    Region.RE,
  ],

  [Area.IT]: [Region.IT],

  // AU+ 区域
  [Area.AU_PLUS]: [Region.AU, Region.NZ],

  // ES+ 区域
  [Area.ES_PLUS]: [Region.ES, Region.AD],

  // SE+ 区域
  [Area.SE_PLUS]: [Region.SE, Region.FI, Region.NO, Region.DK],

  // NL 区域
  [Area.NL]: [Region.NL],

  // PL 区域
  [Area.PL]: [Region.PL],

  // PT+ 区域
  [Area.PT_PLUS]: [Region.PT],

  // SG 区域
  [Area.SG]: [Region.SG],

  // US+ 区域
  // [Area.US_PLUS]: [Region.US, Region.CA],
};

export function getRegionsByArea(area: Area): Region[] {
  return AREA_REGIONS_MAP[area];
}

export function getRegionsByAreas(areas: Area[]): Region[] {
  return areas.flatMap(area => getRegionsByArea(area));
}

export const REGION_AREA_MAP: { [key in Region]?: Area } = (() => {
  const map: { [key in Region]?: Area } = {};
  for (const area in AREA_REGIONS_MAP) {
    const regions = AREA_REGIONS_MAP[area as Area];
    for (const region of regions) {
      map[region] = area as Area;
    }
  }
  return map;
})();

export function getAreaByRegion(region: Region): Area | undefined {
  return REGION_AREA_MAP[region];
}

export interface AreaOption {
  label: string;
  value: Area;
}

function getAreaDescription(area: Area): string | undefined {
  const regions = AREA_REGIONS_MAP[area];
  if (regions.length === 1) {
    return undefined;
  }
  const regionLabels = regions.map(region => REGION_LABEL_MAP[region]);
  return `包括: ${regionLabels.join(', ')}`;
}

export const AREA_OPTIONS: AreaOption[] = [
  { label: '美国区', value: Area.US },
  { label: '英国区', value: Area.UK_PLUS },
  { label: '中东及北非', value: Area.MENA },
  { label: '俄罗斯及独联体', value: Area.RU_PLUS },
  { label: '拉丁美洲', value: Area.LATAM },
  { label: '德国区', value: Area.DE_PLUS },
  { label: '法国区', value: Area.FR_PLUS },
  { label: '西班牙区', value: Area.ES_PLUS },
  { label: '日本', value: Area.JP },
  { label: '韩国', value: Area.KR },
  { label: '澳洲区', value: Area.AU_PLUS },
  { label: '土耳其', value: Area.TR },
  { label: '印尼', value: Area.ID },
  { label: '越南', value: Area.VN },
  { label: '泰国', value: Area.TH },
  { label: '巴西', value: Area.BR },
  { label: '马来西亚', value: Area.MY },
  { label: '台湾', value: Area.TW },
  { label: '菲律宾', value: Area.PH },
  { label: '北欧区', value: Area.SE_PLUS },
  { label: '意大利', value: Area.IT },
  { label: '罗马尼亚', value: Area.RO },
  { label: '荷兰', value: Area.NL },
  { label: '波兰', value: Area.PL },
  { label: '葡萄牙', value: Area.PT_PLUS },
  { label: '新加坡', value: Area.SG },
  // { label: '美国及加拿大', value: Area.US_PLUS },
];

export const AREA_DESCRIPTION_MAP = Object.fromEntries(
  AREA_OPTIONS.map(item => [item.value, getAreaDescription(item.value)]),
) as Record<Area, string>;

export const AREA_NAME_MAP: Record<Area, string> = Object.fromEntries(
  AREA_OPTIONS.map(item => [item.value, item.label]),
) as Record<Area, string>;
