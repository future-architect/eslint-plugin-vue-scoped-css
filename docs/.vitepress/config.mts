import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "path";
import { fileURLToPath } from "url";
import eslint4b from "vite-plugin-eslint4b";
import { viteCommonjs } from "./vite-plugin.mjs";

import "./build-system/build.mts";

type RuleModule = {
  meta: { docs: { ruleId: string; ruleName: string }; deprecated?: boolean };
};

const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem({
  meta: {
    docs: { ruleId, ruleName },
  },
}: RuleModule): DefaultTheme.SidebarItem {
  return {
    text: ruleId,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const a = "../../dist/utils/rules.js";
  const { rules } = (await import(a)) as { rules: RuleModule[] };
  return defineConfig({
    base: "/eslint-plugin-vue-scoped-css/",
    title: "eslint-plugin-vue-scoped-css",
    outDir: path.join(dirname, "./dist/eslint-plugin-vue-scoped-css"),
    description: "ESLint plugin for Scoped CSS in Vue.js",
    head: [],

    vite: {
      plugins: [viteCommonjs(), eslint4b()],
      resolve: {
        alias: {
          "vue-eslint-parser": path.join(
            dirname,
            "./build-system/shim/vue-eslint-parser.mjs",
          ),
          module: path.join(dirname, "./shim/module.mjs"),
          "safer-buffer": path.join(dirname, "./shim/module.mjs"),
          sax: path.join(dirname, "./shim/sax.mjs"),
          events: path.join(dirname, "./build-system/shim/events.mjs"),
          stylus: path.join(
            dirname,
            "../../node_modules/stylus/lib/browserify.js",
          ),
        },
      },
      define: {
        "process.env.NODE_DEBUG": "false",
        "process.platform": JSON.stringify(process.platform),
        "process.version": JSON.stringify(process.version),
      },
      optimizeDeps: {
        // exclude: ["vue-eslint-parser"],
      },
    },

    lastUpdated: true,
    themeConfig: {
      search: {
        provider: "local",
        options: {
          detailedView: true,
        },
      },
      editLink: {
        pattern:
          "https://github.com/future-architect/eslint-plugin-vue-scoped-css/edit/master/docs/:path",
      },
      nav: [
        { text: "Introduction", link: "/" },
        { text: "User Guide", link: "/user-guide/" },
        { text: "Rules", link: "/rules/" },
        { text: "Playground", link: "/playground/" },
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/future-architect/eslint-plugin-vue-scoped-css",
        },
      ],
      sidebar: {
        "/rules/": [
          {
            text: "Rules",
            items: [{ text: "Available Rules", link: "/rules/" }],
          },
          {
            text: "Vue Scoped CSS Rules",
            collapsed: false,
            items: rules
              .filter((rule) => !rule.meta.deprecated)
              .map(ruleToSidebarItem),
          },

          // Rules in no category.
          ...(rules.some((rule) => rule.meta.deprecated)
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: rules
                    .filter((rule) => rule.meta.deprecated)
                    .map(ruleToSidebarItem),
                },
              ]
            : []),
        ],
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/" },
              { text: "User Guide", link: "/user-guide/" },
              { text: "Rules", link: "/rules/" },
            ],
          },
        ],
      },
    },
  });
};
