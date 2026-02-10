import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { nextThemeProviderSpy } = vi.hoisted(() => {
  return {
    nextThemeProviderSpy: vi.fn(
      ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    ),
  };
});

vi.mock("next-themes", () => {
  return {
    ThemeProvider: nextThemeProviderSpy,
  };
});

import ThemeProvider from "./ThemeProvider";

describe("ThemeProvider", () => {
  it("uses class-based system theming and renders children", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider>
        <span>Child</span>
      </ThemeProvider>,
    );

    expect(markup).toContain("Child");
    expect(nextThemeProviderSpy).toHaveBeenCalledTimes(1);

    const props = nextThemeProviderSpy.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;

    expect(props.attribute).toBe("class");
    expect(props.defaultTheme).toBe("system");
    expect(props.enableSystem).toBe(true);
  });
});
