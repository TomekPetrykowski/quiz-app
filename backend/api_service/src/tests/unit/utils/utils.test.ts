import { getErrorMessage } from "@/utils";

describe("getErrorMessage", () => {
  it("should return a default message for unknown errors", () => {
    const error = new Error("Something went wrong");
    expect(getErrorMessage(error)).toBe("Something went wrong");
  });

  it("should return a custom message for ValidationError", () => {
    const error = {
      message: "Validation failed",
    };
    expect(getErrorMessage(error)).toBe("Validation failed");
  });

  it("should handle errors without a message", () => {
    const error = {};
    expect(getErrorMessage(error)).toBe("An error occurred");
  });

  it("should return a string error message", () => {
    const error = "A string error message";
    expect(getErrorMessage(error)).toBe("A string error message");
  });
});
