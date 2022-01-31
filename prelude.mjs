/**
 * @param {Iterable<T>} it
 * @param {number} start
 * @return {IterableIterator<readonly [number, T]>}
 */
export const enumerate = function* (it, start = 0) {
  const i = it[Symbol.iterator]();
  while (true) {
    const { done, value } = i.next();
    if (done) {
      break;
    } else {
      yield [start++, value];
    }
  }
};

/**
 * @param {Iterable<T>[]} its
 * @return {IterableIterator<T>}
 */
export const zip = function* (...its) {
  const iterators = its.map((i) => i[Symbol.iterator]());
  while (true) {
    const acc = [];
    for (const it of iterators) {
      const { done, value } = it.next();
      if (done) {
        return;
      } else {
        acc.push(value);
      }
    }
    yield acc;
  }
};
