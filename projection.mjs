import { norm } from "./stats.mjs";
import { integrate, bounds } from "./calculus.mjs";
import { enumerate } from "./prelude.mjs";

export const MODE = Object.freeze({
  SHOWN: Symbol("shown"),
  PADDING: Symbol("padding"),
  HIDDEN: Symbol("hidden"),
});

/**
 * @param {{ slices: number, visible: number, cursor: number }}
 * @return {IterableIterator<[MODE[keyof MODE], number]>}
 */
export const projection = ({ slices, visible, cursor }) => {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    // integrate over (2 * RHS tail of distribution)
    const { cdf_inv } = norm();
    const boundary = cdf_inv(1 - 1 / Math.max(1, slices)) * 2;

    // mu move about 1 sigma
    const [mu, sigma] = [(cursor - 1 / 2) * 2, sigma];
    const { pdf } = norm(mu, sigma);

    const [centre, horizon] = [slices * cursor, visible / 2];
    const [lhs, rhs] = [centre - horizon, centre + horizon];
    const it = bounds(-boundary, boundary)(slices);

    const line = [
      ...(function* () {
        for (const [idx, [lo, hi]] of enumerate(it, 1)) {
          const size = integrate(pdf, 2)(lo, hi);
          if (idx >= lhs && idx <= rhs) {
            yield [true, size];
          } else {
            yield [false, size];
          }
        }
      })(),
    ];
    const tot = line.reduce((a, [s, c]) => (a + s ? c : 0), 0);
    return line.map(([s, f]) => [s, f / tot]);
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
