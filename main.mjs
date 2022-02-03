import { MODE, projection, projection_inv } from "./projection.mjs";

import { round } from "./math.mjs";
import { zip } from "./prelude.mjs";

const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const cursor_input = document.querySelector("#cursor_input");
const cursor_output = document.querySelector("#cursor_output");

const padding = 5;
const [min_size, max_size] = [6, 160];

globalThis.on_update = () => {
  const { width: main_size } = main.getBoundingClientRect();
  const slices = main.children.length - 2 * padding;
  const cursor = parseFloat(cursor_input.value);
  cursor_output.value = round(cursor * slices, 2);

  const it = zip(
    main.children,
    projection({ main_size, min_size, max_size, padding, slices, cursor })
  );

  main.style.gridTemplateColumns = [
    ...(function* () {
      for (const [child, [mode, width]] of it) {
        switch (mode) {
          case MODE.SHOWN:
            child.style.display = "inherit";
            for (const c of child.children) {
              c.style.display = "inherit";
            }
            yield `${width}fr`;
            break;
          case MODE.PADDING:
            child.style.display = "inherit";
            for (const c of child.children) {
              c.style.display = "none";
            }
            yield `${width}fr`;
            break;
          case MODE.HIDDEN:
            child.style.display = "none";
            for (const c of child.children) {
              c.style.display = "none";
            }
            break;
        }
      }
    })(),
  ].join(" ");
};

globalThis.on_pages = () => {
  const pages = parseInt(pages_input.value);
  pages_output.value = pages;

  main.replaceChildren(
    ...(function* () {
      for (let i = 0; i < padding; i++) {
        yield document.createElement("div");
      }
      for (let i = 1; i <= pages; i++) {
        const div = document.createElement("section");
        const span = div.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(i.toString()));
        span.appendChild(document.createElement("br"));
        span.appendChild(document.createTextNode("-".repeat(9)));
        yield div;
      }
      for (let i = 0; i < padding; i++) {
        yield document.createElement("div");
      }
    })()
  );

  globalThis.on_update();
};

new ResizeObserver(() => {
  globalThis.on_update();
}).observe(main);
