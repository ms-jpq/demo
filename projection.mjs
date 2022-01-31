import { centered_n_scaled_logit_0_1 } from "./math.mjs";
import { norm, skew_norm_pdf } from "./stats.mjs";

/**
 * @param {{ slices: number, cursor: number }}
 */
export const projection = function* ({ slices, cursor }) {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    /* roughly speaking, the projection is the [relative ratios]
     * of a uniformly divided [n slices] applied to a skew normal distribution
     *
     */
    const naive_dist = norm(cursor, 1);

    const { cdf_inv } = naive_dist;
    const boundary = cdf_inv(1 - 1 / slices);

    // skew of the distribution, eased using the logit fn
    // Magic number [5] is added to increase the rate of asymptotic convergency
    const alpha = centered_n_scaled_logit_0_1(cursor) / 5;

    const skew_pdf = skew_norm_pdf(naive_dist, alpha);

    for (const [lo, hi] of bounds(-boundary, boundary)(slices)) {
      yield integrate(skew_pdf, 2)(lo, hi);
    }
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
