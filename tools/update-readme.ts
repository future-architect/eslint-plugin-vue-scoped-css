import path from "path";
import fs from "fs";
import os from "os";
import renderRulesTableContent from "./render-rules";
const isWin = os.platform().startsWith("win");

let insertText = `\n${renderRulesTableContent(
  (name) =>
    `https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/${name}.html`,
)}\n`;
if (isWin) {
  insertText = insertText
    .replace(/\r?\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/\n/gu, "\r\n");
}

const readmeFilePath = path.resolve(__dirname, "../README.md");
const newReadme = fs
  .readFileSync(readmeFilePath, "utf8")
  .replace(
    /<!--RULES_TABLE_START-->[\s\S]*<!--RULES_TABLE_END-->/u,
    `<!--RULES_TABLE_START-->${insertText}<!--RULES_TABLE_END-->`,
  );
fs.writeFileSync(readmeFilePath, newReadme);

const docsReadmeFilePath = path.resolve(__dirname, "../docs/index.md");

fs.writeFileSync(
  docsReadmeFilePath,
  newReadme
    .replace("# eslint-plugin-vue-scoped-css\n", "# Introduction\n")
    .replace(
      /<!--RULES_SECTION_START-->[\s\S]*<!--RULES_SECTION_END-->/u,
      "See [Available Rules](./rules/index.md).",
    )
    .replace(
      /<!--USAGE_SECTION_START-->[\s\S]*<!--USAGE_SECTION_END-->/u,
      "See [User Guide](./user-guide/index.md).",
    )
    .replace(/<!--DOCS_IGNORE_START-->[\s\S]*?<!--DOCS_IGNORE_END-->/gu, "")
    .replace(
      /\(https:\/\/future-architect.github.io\/eslint-plugin-vue-scoped-css/gu,
      "(.",
    )
    .replace(
      /\]\(LICENSE\)/gu,
      "](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/LICENSE)",
    )
    .replace(/\n{3,}/gu, "\n\n"),
);

const docsUserGuideFilePath = path.resolve(
  __dirname,
  "../docs/user-guide/index.md",
);
const docsUserGuide = fs.readFileSync(docsUserGuideFilePath, "utf8");

fs.writeFileSync(
  docsUserGuideFilePath,
  docsUserGuide
    .replace(
      /<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u,
      /<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u.exec(
        newReadme,
      )![0],
    )
    .replace(
      /\(https:\/\/future-architect.github.io\/eslint-plugin-vue-scoped-css(.*?)\)/gu,
      (_s, c: string) => `(..${c.endsWith("/") ? `${c}index.md` : c})`,
    ),
  "utf8",
);
