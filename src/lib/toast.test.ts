import { beforeEach, describe, expect, it, vi } from "vitest";

const { addToast } = vi.hoisted(() => ({
  addToast: vi.fn(),
}));

vi.mock("@heroui/react", () => ({
  addToast,
}));

import { toast } from "./toast";

describe("toast helper", () => {
  beforeEach(() => {
    addToast.mockClear();
  });

  it("shows an error toast using Error message", () => {
    toast.error(new Error("boom"), {
      fallbackDescription: "fallback",
    });

    expect(addToast).toHaveBeenCalledWith({
      color: "danger",
      description: "boom",
      title: "Error",
      variant: "flat",
    });
  });

  it("uses fallback description when error payload is unknown", () => {
    toast.error(null, {
      fallbackDescription: "fallback",
      title: "Oops",
    });

    expect(addToast).toHaveBeenCalledWith({
      color: "danger",
      description: "fallback",
      title: "Oops",
      variant: "flat",
    });
  });

  it("shows non-error toast kinds with default styles", () => {
    toast.warning("watch out");
    toast.success("done");
    toast.info("heads up");

    expect(addToast).toHaveBeenNthCalledWith(1, {
      color: "warning",
      description: "watch out",
      title: "Warning",
      variant: "flat",
    });
    expect(addToast).toHaveBeenNthCalledWith(2, {
      color: "success",
      description: "done",
      title: "Success",
      variant: "flat",
    });
    expect(addToast).toHaveBeenNthCalledWith(3, {
      color: "primary",
      description: "heads up",
      title: "Info",
      variant: "flat",
    });
  });
});
