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

import TestStartForm from "./TestStartForm";

describe("TestStartForm", () => {
  it("renders subject and subcategory selectors", () => {
    const markup = renderToStaticMarkup(<TestStartForm />);

    expect(markup).toContain("Subject");
    expect(markup).toContain("Subcategory");
    expect(markup).toContain("Language");
    expect(markup).toContain("English");
  });
});
