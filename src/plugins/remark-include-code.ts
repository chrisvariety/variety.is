import fs from "node:fs";
import path from "node:path";

import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that replaces a code block's content with a file's contents.
 *
 * Usage in MDX/MD:
 *   ````jinja wrap title="foo.prompt" include:./relative/path.jinja
 *   ````
 *
 * The `include:<path>` token is removed from the meta string before
 * expressive-code processes the block, so all other meta options work normally.
 */
export function remarkIncludeCode() {
  return (tree: Root, file: { history: string[] }) => {
    visit(
      tree,
      "code",
      (node: {
        lang?: string | null | undefined;
        meta?: string | null | undefined;
        value: string;
      }) => {
        const match = node.meta?.match(/(?:^|\s)include:(\S+)/);
        if (!match?.[1]) return;

        const mdxDir = path.dirname(file.history[0] ?? "");
        const includePath = path.resolve(mdxDir, match[1]);
        node.value = fs.readFileSync(includePath, "utf-8").trimEnd();
        node.meta = (node.meta ?? "").replace(match[0]!, "").trim() || undefined;
      },
    );
  };
}
