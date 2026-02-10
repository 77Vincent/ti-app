import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import StartForm from "./StartForm";

describe("StartForm", () => {
  it("renders the title and available subjects", () => {
    const markup = renderToStaticMarkup(<StartForm />);

    expect(markup).toContain("Choose the subject of your test");
    expect(markup).toContain("Language");
    expect(markup).toContain("Mathematics");
  });
});
