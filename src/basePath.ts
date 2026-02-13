/**
 * GitHub Pages 部署时，站点在子路径下，
 * 所有静态资源路径需要加上这个前缀。
 */
const BASE_PATH = '/Happy-Valentine-s-Day';

export function assetPath(path: string): string {
    return `${BASE_PATH}${path}`;
}
