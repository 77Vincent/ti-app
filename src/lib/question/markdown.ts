const LATEX_COMMANDS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "theta",
  "lambda",
  "mu",
  "pi",
  "sigma",
  "omega",
  "mathbb",
  "mathbf",
  "mathrm",
  "mathcal",
  "frac",
  "sqrt",
  "cdot",
  "times",
  "leq",
  "geq",
  "neq",
  "infty",
  "sum",
  "int",
  "left",
  "right",
  "vec",
  "hat",
  "bar",
] as const;

const MISSING_LATEX_COMMAND_PATTERN = new RegExp(
  String.raw`(^|[^\\])(${LATEX_COMMANDS.join("|")})(?=[\s{_^]|$)`,
  "g",
);

function normalizeMathDelimiters(markdown: string): string {
  return markdown
    .replace(/\\\[((?:.|\n)*?)\\\]/g, (_fullMatch, inner: string) => `$$${inner}$$`)
    .replace(/\\\[((?:.|\n)*?)\]/g, (_fullMatch, inner: string) => `$$${inner}$$`)
    .replace(/\\\((.+?)\\\)/g, (_fullMatch, inner: string) => `$${inner}$`)
    .replace(/\\\(([^)\n]+)\)/g, (_fullMatch, inner: string) => `$${inner}$`);
}

function normalizeLatexCommands(latex: string): string {
  return latex.replace(
    MISSING_LATEX_COMMAND_PATTERN,
    (_fullMatch, prefix: string, command: string) => `${prefix}\\${command}`,
  );
}

function normalizeLatexCommandsInMath(markdown: string): string {
  return markdown.replace(
    /\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g,
    (fullMatch, blockLatex?: string, inlineLatex?: string) => {
      if (typeof blockLatex === "string") {
        return `$$${normalizeLatexCommands(blockLatex)}$$`;
      }

      if (typeof inlineLatex === "string") {
        return `$${normalizeLatexCommands(inlineLatex)}$`;
      }

      return fullMatch;
    },
  );
}

export function normalizeMathMarkdown(markdown: string): string {
  return normalizeLatexCommandsInMath(normalizeMathDelimiters(markdown));
}

