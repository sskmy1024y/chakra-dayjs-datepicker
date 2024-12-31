import dayjs from "dayjs";
import React from "react";
import { createRoot } from "react-dom/client";
import { SingleDatepicker } from "../src";

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(<SingleDatepicker date={dayjs()} onDateChange={() => {}} />);
    root.unmount();
  });

  it("renders without crashing with undefined date", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(<SingleDatepicker date={undefined} onDateChange={() => {}} />);
    root.unmount();
  });
});
