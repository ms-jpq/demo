import { bounds, integrate } from "./calculus.mjs";

import { enumerate } from "./prelude.mjs";
import { norm } from "./stats.mjs";

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
    const sigma = 1;
    const normalized = (cursor - 1 / 2) * 2;
    const mu = normalized * sigma;
    const { pdf } = norm(mu, sigma);

    const [centre, horizon] = [slices * cursor, visible / 2];
    const [lhs, rhs] = [centre - horizon, centre + horizon];
    const it = bounds(-boundary, boundary)(slices);

    const line = [
      ...(function* () {
        for (const [idx, [lo, hi]] of enumerate(it, 1)) {
          const size = integrate(pdf, 2)(lo, hi);
          const mode = (() => {
            if (idx >= lhs && idx <= rhs) {
              return MODE.SHOWN;
            } else {
              return MODE.PADDING;
            }
          })();

          yield [mode, size];
        }
      })(),
    ];
    const sum_of_visible = line.reduce(
      (acc, [mode, size]) => acc + (mode !== MODE.HIDDEN ? size : 0),
      0
    );
    return line.map(([mode, size]) => [mode, size / sum_of_visible]);
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
