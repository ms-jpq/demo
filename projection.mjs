import { norm } from "./stats.mjs";
import { integrate, bounds } from "./calculus.mjs";

/**
 * @param {{ slices: number, cursor: number }}
 * @return {IterableIterator<number>}
 */
export const projection = function* ({ slices, cursor }) {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    const { cdf_inv } = norm();
    const boundary = cdf_inv(1 - 1 / Math.max(1, slices));
    const mu = (cursor - 1 / 2) * boundary;
    const { pdf } = norm(mu, 1);

    for (const [lo, hi] of bounds(-boundary, boundary)(slices)) {
      yield integrate(pdf, 2)(lo, hi);
    }
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
