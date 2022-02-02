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

new ResizeObserver(() => {
  visible_output.value = visible();
}).observe(main);

globalThis.on_update = () => {
  const slices = main.children.length;
  const cursor = parseFloat(cursor_input.value);
  cursor_output.value = round(cursor * slices, 2);

  const it = zip(
    main.children,
    projection({ slices, visible: visible(), cursor })
  );

  main.style.gridTemplateColumns = [
    ...(function* () {
      for (const [child, [shown, col]] of it) {
        if (shown) {
          child.style.display = "inherit";
          yield `${col}fr`;
        } else {
          child.style.display = "none";
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
      for (let i = 0; i < pages; i++) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(i.toString()));
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode("-".repeat(9)));
        yield div;
      }
    })()
  );

  globalThis.on_update();
};
