import { bounds, integrate } from "./calculus.mjs";

import { enumerate } from "./prelude.mjs";
import { norm } from "./stats.mjs";

export const MODE = Object.freeze({
  SHOWN: Symbol("shown"),
  PADDING: Symbol("padding"),
  HIDDEN: Symbol("hidden"),
});

/**
 * @param {{ main_size: number, min_size: number, max_size: number, padding: number, slices: number, cursor: number }}
 * @return {IterableIterator<[MODE[keyof MODE], number]>}
 */
export const projection = ({
  main_size,
  hidden_size,
  min_size,
  max_size,
  padding,
  slices,
  cursor,
}) => {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    const regions = padding + slices + padding;
    const centered_cursor = (cursor - 1 / 2) * 2;

    const sigma = 1;
    const boundary = sigma * 3;
    const mu = sigma * centered_cursor * 2;

    const scores = [
      ...(function* () {
        const { pdf } = norm(mu, sigma);
        const it = bounds(-boundary, boundary)(regions);

        const centre = regions * cursor;
        const horizon = main_size / max_size / 2;
        const [lhs, rhs] = [centre - horizon, centre + horizon];

        for (const [idx, [lo, hi]] of enumerate(it, 0)) {
          const is_padding = idx < padding || idx >= slices + padding;
          const centrality = idx >= lhs && idx <= rhs;
          const width = integrate(pdf, 6)(lo, hi);
          yield [is_padding, centrality, width];
        }
      })(),
    ];

    const pre_sum = scores.reduce((sum, [, , width]) => sum + width, 0);

    const real_sizes = scores.map(([is_padding, centrality, width]) => {
      const normalized = width / pre_sum;
      const slice_size = main_size * normalized;

      const mode = (() => {
        if (slice_size < hidden_size) {
          return MODE.HIDDEN;
        } else if (is_padding) {
          return MODE.PADDING;
        } else if (centrality) {
          return MODE.SHOWN;
        } else if (slice_size >= min_size) {
          return MODE.SHOWN;
        } else {
          return MODE.PADDING;
        }
      })();

      return [mode, mode === MODE.HIDDEN ? 0 : normalized];
    });

    const post_sum = real_sizes.reduce((sum, [, width]) => sum + width, 0);

    const normalized_2 = real_sizes.map(([mode, width]) => [
      mode,
      (width / post_sum) * 100,
    ]);

    return normalized_2;
  }
};

/**
 * @param {{ slices: number, index: number }}
 */
export const projection_inv = ({ slices, index }) => index / slices;
