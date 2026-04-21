import { isEmpty } from "lodash-es";

/** 与 AuthGuard / SSO 中 privileger 字段一致 */
export type Privileger = {
  tower?: number;
  dev?: number;
  [key: string]: unknown;
};

/** 参考 router：!isEmpty(privilege) 才视为可进管理端 */
export function isPrivilegerEmpty(privileger: unknown): boolean {
  if (privileger == null) return true;
  if (typeof privileger !== "object") return true;
  return isEmpty(privileger);
}

export function getTowerPrivilege(privileger: unknown): number {
  const t = (privileger as Privileger)?.tower;
  return typeof t === "number" ? t : 0;
}

export function canEnterAdmin(privileger: unknown): boolean {
  return !isPrivilegerEmpty(privileger);
}

/** 参考路由 meta：发塔需 tower >= 2 */
export function canEnterAddTower(privileger: unknown): boolean {
  return getTowerPrivilege(privileger) >= 2;
}
