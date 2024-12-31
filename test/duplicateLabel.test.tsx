import dayjs from "dayjs";
import React from "react";
import { createRoot } from "react-dom/client";
import { RangeDatepicker } from "../src";

describe("it", () => {
  it("check children without the same key", () => {
    // @ts-ignore
    var consoleError = jest.spyOn(global.console, "error");
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(
      <RangeDatepicker
        selectedDates={[dayjs(), dayjs()]}
        onDateChange={() => {}}
        defaultIsOpen={true}
        configs={{
          dateFormat: "yyyy-MM-dd",
          monthNames: Array(12).fill("m"),
          dayNames: Array(7).fill("d"),
        }}
      />
    );
    root.unmount();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
