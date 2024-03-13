import { TimeUtil } from "../src/time-util";

describe("TimeUtil", () => {
  test("getTimestamp returns the current timestamp in the correct format", () => {
    const timestamp = TimeUtil.getTimestamp();
    const regex = /^\d{10}$/;
    expect(regex.test(timestamp)).toBe(true);
  });
});
