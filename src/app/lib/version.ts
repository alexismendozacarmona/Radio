// Versión que trae ESTE build de la app. Súbela en cada release
// (y también el versionCode/versionName en android/app/build.gradle).
export const APP_VERSION = '3.1.0';

export interface AppVersionInfo {
  latest: string;       // última versión publicada (ej. "3.2.0")
  url: string;          // link de descarga del APK
  notes?: string;       // qué hay de nuevo (opcional)
  mandatory?: boolean;  // si true, el aviso no se puede cerrar
}

// Devuelve true si "a" es una versión más nueva que "b" (formato x.y.z).
export function isNewer(a: string, b: string): boolean {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}
