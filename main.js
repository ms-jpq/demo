var time;
const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const hidden_size_input = document.querySelector("#hidden_size_input");
const hidden_size_output = document.querySelector("#hidden_size_output");

const centre_input = document.querySelector("#centre_input");
const centre_output = document.querySelector("#centre_output");

const spread_input = document.querySelector("#spread_input");
const spread_output = document.querySelector("#spread_output");

const skew_input = document.querySelector("#skew_input");
const skew_output = document.querySelector("#skew_output");

/**
 * Integration Boundaries -> [lhs, rhs]
 *
 * @param {number} lo
 * @param {number} hi
 * @return {(slices: number) => IterableIterator<[number, number]>}
 */
const bounds = (lo, hi) =>
  function* (slices) {
    const points = [
      ...(function* () {
        const step = (hi - lo) / slices;
        yield lo;
        for (let i = 1; i < slices; i++) {
          yield lo + step * i;
        }
        yield hi;
      })(),
    ];
    for (let i = 0; i < slices; i++) {
      yield [points[i], points[i + 1]];
    }
  };

/**
 * Riemann Sum
 *
 * @param {(x: number) => number} fn
 * @param {number} steps
 * @return {(lo: number, hi: number) => number}
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
 * Approx Error Function
 *
 * @param {number} n
 * @return {number}
 */
const erf = (() => {
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  return (n) => {
    const sign = n >= 0 ? 1 : -1;
    const x = Math.abs(n);

    const t = 1 / (1 + p * x);
    const y =
      1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };
})();

/**
 * Standard Norm Dist
 *
 * @param {number} mu
 * @param {number} sigma
 * @return {{ pdf: (x: number) => number, cdf: (x: number) => number }}
 */
const norm = (mu = 0, sigma = 1) => {
  const pdf = (x) => {
    const lhs = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exp = -(1 / 2) * Math.pow((x - mu) / sigma, 2);
    const rhs = Math.pow(Math.E, exp);
    return lhs * rhs;
  };
  const cdf = (x) => {
    return (1 / 2) * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
  };
  return { pdf, cdf };
};

/**
 * Skewed Norm Dist
 *
 * @param {number} alpha
 * @return {(x: number) => number}
 */
const skewed_norm_pdf = (alpha = 0) => {
  const { pdf, cdf } = norm();
  return (x) => 2 * pdf(x) * cdf(alpha * x);
};

const calc = function* ({ steps, slices, centre, spread, skew }) {
  const pdf = skewed_norm_pdf(skew);
  for (const [lo, hi] of bounds(centre - spread, centre + spread)(slices)) {
    yield integrate(pdf, steps)(lo, hi);
  }
};

const on_update = () => {
  const slices = main.childElementCount;
  const hidden_cutoff = parseFloat(hidden_size_input.value);
  const centre = parseFloat(centre_input.value);
  const spread = parseFloat(spread_input.value);
  const skew = parseFloat(skew_input.value);

  hidden_size_output.value = hidden_cutoff;
  centre_output.value = centre;
  spread_output.value = spread;
  skew_output.value = skew;

  if (time) {
    console.time("MATH");
  }
  const cols = [...calc({ steps: 10, slices, centre, spread, skew })];
  if (time) {
    console.timeEnd("MATH");
  }

  main.style.gridTemplateColumns = [
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

  on_update();
};
