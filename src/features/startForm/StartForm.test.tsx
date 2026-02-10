import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@heroui/react", () => {
  return {
    Card: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  };
});

import StartForm from "./StartForm";

describe("StartForm", () => {
  it("renders the title", () => {
    const markup = renderToStaticMarkup(<StartForm />);

    expect(markup).toContain("Choose subject");
  });
});
