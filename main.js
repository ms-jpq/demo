import { projection } from "./projection.js";

var time;
const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const hidden_size_input = document.querySelector("#hidden_size_input");
const hidden_size_output = document.querySelector("#hidden_size_output");

const centre_input = document.querySelector("#centre_input");
const centre_output = document.querySelector("#centre_output");

const on_update = () => {
  const { width } = main.getBoundingClientRect();

  const slices = main.childElementCount;
  const hidden_cutoff = parseFloat(hidden_size_input.value);
  const centre = parseFloat(centre_input.value);
  const spread = parseFloat(spread_input.value);

  hidden_size_output.value = hidden_cutoff;
  centre_output.value = centre;
  spread_output.value = spread;

  const cols = [...projection({ slices, centre, spread, skew: 0 })];
  const css = [
    ...(function* () {
      for (let i = 0; i < main.children.length; i++) {
        const col = cols[i];
        const child = main.children.item(i);
        if (col > hidden_cutoff) {
          child.style.display = "inherit";
          yield `${col}fr`;
        } else {
          child.style.display = "none";
        }
      }
    })(),
  ].join(" ");

  main.style.gridTemplateColumns = css;
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

  on_update();
};
