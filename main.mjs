import { projection, projection_inv } from "./projection.mjs";

const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const cursor_input = document.querySelector("#cursor_input");
const cursor_output = document.querySelector("#cursor_output");

globalThis.on_update = () => {
  const { width } = main.getBoundingClientRect();

  const slices = main.children.length;
  const cursor = (cursor_output.value = parseFloat(cursor_input.value));

  const cols = [...projection({ slices, cursor })];

  main.style.gridTemplateColumns = [
    ...(function* () {
      for (let i = 0; i < main.children.length; i++) {
        const col = cols[i];
        const child = main.children.item(i);
          yield `${col}fr`;
        // if (col > hidden_cutoff) {
        //   child.style.display = "inherit";
        // } else {
        //   child.style.display = "none";
        // }
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
