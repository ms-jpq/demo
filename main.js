const main = document.querySelector("main");

const pages_input = document.querySelector("#pages_input");
const pages_output = document.querySelector("#pages_output");

const spread_input = document.querySelector("#spread_input");
const spread_output = document.querySelector("#spread_output");

const skew_input = document.querySelector("#skew_input");
const skew_output = document.querySelector("#skew_output");

/**
 * @param {number} lo
 * @param {number} hi
 * @return {(slices: number) => IterableIterator<number>}
 */
const intervals = (lo, hi) =>
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
 * @param {number} x
 * @return {number}
 */
const erf = (n) => {
  const sign = n >= 0 ? 1 : -1;
  const x = Math.abs(n);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
};

/**
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
 * @param {number} alpha
 * @return {(x: number) => number}
 */
const skewed_norm_pdf = (alpha = 0) => {
  const { pdf, cdf } = norm();
  return (x) => 2 * pdf(x) * cdf(alpha * x);
};

const calc = function* ({ steps, slices, spread, skew }) {
  const pdf = skewed_norm_pdf(skew);
  for (const [lo, hi] of intervals(-spread, spread)(slices)) {
    const ratio = integrate(pdf, steps)(lo, hi);
    yield `${ratio}fr`;
  }
};

const on_update = () => {
  const slices = main.childElementCount;
  const spread = parseInt(spread_input.value);
  const skew = parseFloat(skew_input.value);
  spread_output.value = spread;
  skew_output.value = skew;

  main.style.gridTemplateColumns = [
    ...calc({ steps: 10, slices, spread, skew }),
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
