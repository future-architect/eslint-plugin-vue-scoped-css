import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ESLintCodeBlock from "./components/eslint-code-block.vue";
import PlaygroundBlock from "./components/playground-block.vue";
import "./style.css";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("eslint-code-block", ESLintCodeBlock);
    ctx.app.component("playground-block", PlaygroundBlock);
  },
};
export default theme;
