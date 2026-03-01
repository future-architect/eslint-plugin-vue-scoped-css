import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);

/**
 * Attempts to load an optional peer dependency by name.
 * Returns the loaded module, or `null` if the dependency is not installed.
 * Re-throws any error that is NOT a MODULE_NOT_FOUND for the named package.
 */
export function loadOptionalDep<T>(depName: string): T | null {
  try {
    return _require(depName) as T;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    const message = typeof err.message === "string" ? err.message : "";
    if (err.code !== "MODULE_NOT_FOUND" || !message.includes(depName)) {
      throw err;
    }
    return null;
  }
}
