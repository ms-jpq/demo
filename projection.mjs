import { bounds, integrate } from "./calculus.mjs";

import { enumerate } from "./prelude.mjs";
import { norm } from "./stats.mjs";

export const MODE = Object.freeze({
  SHOWN: Symbol("shown"),
  PADDING: Symbol("padding"),
  HIDDEN: Symbol("hidden"),
});

const { cdf_inv } = norm();
const boundary = cdf_inv(0.9999);

/**
 * @param {{ main_size: number, min_size: number, max_size: number, padding: number, slices: number, cursor: number }}
 * @return {IterableIterator<[MODE[keyof MODE], number]>}
 */
export const projection = ({
  main_size,
  min_size,
  max_size,
  padding,
  slices,
  cursor,
}) => {
  if (cursor < 0 || cursor > 1) {
    throw new Error();
  } else {
    const sigma = 1;
    const mu = sigma * (cursor - 1 / 2) * 2;
    const { pdf } = norm(mu, sigma);

    const regions = padding * 2 + slices;
    const it = bounds(-boundary, boundary)(regions);

    const line = [
      ...(function* () {
        for (const [idx, [lo, hi]] of enumerate(it, 0)) {
          const mode =
            idx < padding || idx >= slices + padding
              ? MODE.PADDING
              : MODE.SHOWN;
          const width = integrate(pdf, 2)(lo, hi);
          yield [mode, width];
        }
      })(),
    ];

    const pre_sum = line.reduce((sum, [_, width]) => sum + width, 0);
    const normalized_1 = line.map(([mode, width]) => {
      const normalized = width / pre_sum;
      const to_smol = main_size * normalized < min_size;
      const adjusted_mode = to_smol ? MODE.HIDDEN : mode;
      return [adjusted_mode, normalized];
    });
    const post_sum = line.reduce(
      (sum, [mode, width]) => sum + (mode !== MODE.HIDDEN ? width : width),
      0
    );
    const normalized_2 = normalized_1.map(([mode, width]) => [
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
