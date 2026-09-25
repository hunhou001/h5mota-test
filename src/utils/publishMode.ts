export type PublishMode = 'build' | 'direct';

export function resolvePublishMode(value: unknown): PublishMode {
  if (value === undefined) return 'build';
  if (value === 'build' || value === 'direct') return value;
  throw new Error('无效的发布方式');
}
