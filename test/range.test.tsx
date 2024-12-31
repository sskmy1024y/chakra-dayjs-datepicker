import dayjs from "dayjs";
import React from "react";
import { createRoot } from "react-dom/client";
import { RangeDatepicker } from "../src";

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(
      <RangeDatepicker
        selectedDates={[dayjs(), dayjs()]}
        onDateChange={() => {}}
      />
    );
    root.unmount();
  });
});