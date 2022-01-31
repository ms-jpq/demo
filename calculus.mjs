/**
 * Integration Boundaries -> [lhs, rhs]
 *
 * @param {number} lo
 * @param {number} hi
 * @return {(slices: number) => IterableIterator<[number, number]>}
 */
export const bounds = (lo, hi) =>
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
 * Riemann Sum
 *
 * @param {(x: number) => number} fn
 * @param {number} steps
 * @return {(lo: number, hi: number) => number}
 */
export const integrate = (fn, steps) => (lo, hi) => {
  let sum = 0;
  const step_size = (hi - lo) / steps;
  for (let i = 0; i < steps; i++) {
    const [l, h] = [lo + i * step_size, lo + (i + 1) * step_size];
    sum += fn((l + h) / 2);
  }
  return step_size * sum;
};
