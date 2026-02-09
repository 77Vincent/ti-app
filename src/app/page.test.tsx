import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@heroui/react", () => {
  const Box = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Select = Object.assign(Box, {
    Trigger: Box,
    Value: Box,
    Indicator: Box,
    Popover: Box,
  });
  const ListBox = Object.assign(Box, {
    Item: Box,
  });

  return {
    Select,
    ListBox,
  };
});

import Home from "./page";

describe("Home page", () => {
  it("renders only subject and subcategory selects", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("Subject");
    expect(markup).toContain("Subcategory");
    expect(markup).toContain("Language");
    expect(markup).toContain("English");
  });
});
