import { projection, projection_inv } from "./projection.mjs";
import { zip } from "./prelude.mjs";

const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const cursor_input = document.querySelector("#cursor_input");
const cursor_output = document.querySelector("#cursor_output");

globalThis.on_update = () => {
  const { width } = main.getBoundingClientRect();

  const slices = main.children.length;
  const cursor = (cursor_output.value = parseFloat(cursor_input.value));
  const visible = width / 420;
  const it = zip(main.children, projection({ slices, visible, cursor }));

  main.style.gridTemplateColumns = [
    ...(function* () {
      for (const [child, col] of it) {
        if (col) {
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
        yield document.createElement("div");
      }
    })()
  );

  globalThis.on_update();
};
