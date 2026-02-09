import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../features/test/TestStartForm", () => {
  return {
    default: () => <div>TestStartForm</div>,
  };
});

import Home from "./page";

describe("Home page", () => {
  it("is a thin entry wrapper for TestStartForm", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("TestStartForm");
  });
});
