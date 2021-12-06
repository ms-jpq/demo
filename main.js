const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const skew_input = document.querySelector("#skew_input");
const skew_output = document.querySelector("#skew_output");

/**
 * Verified
 */
const intervals = function* (slices) {
  const points = [
    ...(function* () {
      yield 0;
      for (let i = 1; i < slices; i++) {
        yield (1 / slices) * i;
      }
      yield 1;
    })(),
  ];
  for (let i = 0; i < slices; i++) {
    yield [points[i], points[i + 1]];
  }
};

/**
 * Midpoint integration
 * Verified
 */
const integrate = (fn, steps) => (lo, hi) => {
  let sum = 0;
  const step_size = (hi - lo) / steps;
  for (let i = 0; i < steps; i++) {
    const [l, h] = [lo + i * step_size, lo + (i + 1) * step_size];
    sum += fn((l + h) / 2);
  }
  return step_size * sum;
};

/**
 * Norm PDF
 *
 * Verified
 */
const pdf = (mu, sigma) => {
  const lhs = 1 / (sigma * Math.sqrt(2 * Math.PI));
  return (x) => {
    const exp = -(1 / 2) * Math.pow((x - mu) / sigma, 2);
    const rhs = Math.pow(Math.E, exp);
    return lhs * rhs;
  };
};

const calc = function* (slices) {
  //console.group("CALC");
  for (const [lo, hi] of intervals(slices)) {
    const ratio = cdf(hi) - cdf(lo);
    const approx = Math.round(ratio * 1000);
    yield `${approx}fr`;
  }
  //console.groupEnd("CALC");
};

const on_skew = () => {
  const slices = main.childElementCount;
  const skew = parseInt(skew_input.value);
  skew_output.value = skew;
  main.style.gridTemplateColumns = [...calc(slices)].join(" ");
};

const on_pages = () => {
  const pages = parseInt(pages_input.value);
  pages_output.value = pages;

  main.replaceChildren(
    ...(function* () {
      for (let i = 0; i < pages; i++) {
        yield document.createElement("div");
      }
    })()
  );

  on_skew();
};
