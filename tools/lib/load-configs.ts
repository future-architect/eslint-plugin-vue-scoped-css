import plugin from "../../lib/index";

type Config = {
  name: string;
  configId: string;
  config: { rules?: Record<string, unknown> };
  extends: Config[];
};

/**
 * Get the all configs
 * @returns {Array} The all configs
 */
function readConfigs(): Config[] {
  const pluginConfigs = plugin.configs as Record<
    string,
    { rules?: Record<string, unknown> }[]
  >;
  const result: Config[] = [];
  for (const [name, flatConfig] of Object.entries(pluginConfigs)) {
    // Skip backward-compat `flat/*` aliases
    if (name.startsWith("flat/")) continue;
    const mergedRules: Record<string, unknown> = {};
    for (const entry of flatConfig) {
      if (entry.rules) {
        Object.assign(mergedRules, entry.rules);
      }
    }
    result.push({
      name,
      configId: name,
      config: { rules: mergedRules },
      extends: [],
    });
  }
  return result;
}

export const configs = readConfigs();
