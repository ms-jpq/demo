import { norm } from "./stats.mjs";
import { integrate, bounds } from "./calculus.mjs";
import { enumerate } from "./prelude.mjs";

/**
 * @param {{ slices: number, visible: number, cursor: number }}
 * @return {IterableIterator<number>}
 */
export const projection = ({ slices, visible, cursor }) => {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    const { cdf_inv } = norm();
    const boundary = cdf_inv(1 - 1 / Math.max(1, slices)) * visible / 2;
    const mu = (cursor - 1 / 2) * visible;
    const { pdf } = norm(mu, 1);

    const [centre, horizon] = [slices * cursor, visible / 2];
    const [lhs, rhs] = [centre - horizon, centre + horizon];
    const it = bounds(-boundary, boundary)(slices);

    const line = [
      ...(function* () {
        for (const [idx, [lo, hi]] of enumerate(it, 1)) {
          if (idx >= lhs && idx <= rhs) {
            yield integrate(pdf, 2)(lo, hi);
          } else {
            yield 0;
          }
        }
      })(),
    ];
    const tot = line.reduce((a, c) => a + c, 0);
    return line.map((f) => f / tot);
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
