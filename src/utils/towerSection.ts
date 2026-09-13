export enum TowerSection { Original = 0, Small = 1, Mod = 2 }
export const TOWER_SECTIONS = [
  { value: TowerSection.Original, label: '原创区' },
  { value: TowerSection.Small, label: '小塔区' },
  { value: TowerSection.Mod, label: 'MOD 区' },
];
export function resolveTowerSection(form: { section?: unknown; mod_of?: unknown }): TowerSection {
  if (form.section === undefined || form.section === null) return form.mod_of ? TowerSection.Mod : TowerSection.Original;
  if (![0, 1, 2, '0', '1', '2'].includes(form.section as number | string)) throw new Error('不合法的分区');
  return Number(form.section) as TowerSection;
}
