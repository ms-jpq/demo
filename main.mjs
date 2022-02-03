import { MODE, projection, projection_inv } from "./projection.mjs";

import { round } from "./math.mjs";
import { zip } from "./prelude.mjs";

const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const cursor_input = document.querySelector("#cursor_input");
const cursor_output = document.querySelector("#cursor_output");

const visible_output = document.querySelector("#visible_output");

const visible = () => {
  const { width } = main.getBoundingClientRect();
  const visible = width / 240;
  return visible;
};

globalThis.on_update = () => {
  const { width: main_size } = main.getBoundingClientRect();
  const slices = main.children.length;
  const cursor = parseFloat(cursor_input.value);
  cursor_output.value = round(cursor * slices, 2);

  const vis = visible();
  const it = zip(
    main.children,
    projection({ main_size, slices, visible: vis, cursor })
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
  const padding = visible() / 2;

  main.replaceChildren(
    ...(function* () {
      for (let i = 0; i < padding; i++) {
        yield document.createElement("div");
      }
      for (let i = 0; i < pages; i++) {
        const div = document.createElement("div");
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
  visible_output.value = visible();
  globalThis.on_update();
}).observe(main);
