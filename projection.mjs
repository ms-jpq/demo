import { norm } from "./stats.mjs";
import { integrate, bounds } from "./calculus.mjs";
import { enumerate } from "./prelude.mjs";

/**
 * @param {{ slices: number, visible: number, cursor: number }}
 * @return {IterableIterator<number>}
 */
export const projection = function* ({ slices, visible, cursor }) {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    const { cdf_inv } = norm();
    const boundary = cdf_inv(1 - 1 / Math.max(1, slices)) * 5;
    const mu = (cursor - 1 / 2) * 5;
    const { pdf } = norm(mu, 1);

    const centre = slices / 2;
    const [lhs, rhs] = [centre - visible, centre + visible];

    for (const [idx, [lo, hi]] of enumerate(
      bounds(-boundary, boundary)(slices)
    )) {
      if (idx >= lhs && idx <= rhs) {
        yield integrate(pdf, 2)(lo, hi);
      }
    }
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
