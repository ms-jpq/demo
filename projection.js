import { norm, skewed_norm_pdf } from "./stats.js"

/**
 * @param {{ slices: number, scroll_pos: number }}
 *
 */
export const calc = function* ({ slices, scroll_pos }) {
  const { pdf } = dist = norm(mu, 1);
  const skewed_pdf = skewed_norm_pdf(dist, alpha);

  const boundary = slices + 1;

  for (const [lo, hi] of bounds(-boundary, boundary)(slices)) {
    yield integrate(pdf, 10)(lo, hi);
  }
};

