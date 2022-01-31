#!/usr/bin/env node

import { EOL } from "os";
import { dirname, join } from "path";
import { equal, fail, ok } from "assert";
import { erf, erf_inv, round } from "./math.mjs";
import { readFile } from "fs/promises";
import { spawn } from "child_process";
import { norm, skew_norm_pdf } from "./stats.mjs";

const { signal } = (() => {
  const abrt = new AbortController();
  process.on("SIGINT", () => abrt.abort());
  process.on("SIGTERM", () => abrt.abort());
  process.on("SIGHUP", () => abrt.abort());
  return abrt;
})();

const PRECISION = 2;

const tst_erf = () => {
  for (let i = 0; i < 1000; i++) {
    const x = Math.random();
    const y = erf(x);
    const z = erf_inv(y);
    equal(round(x, PRECISION), round(z, PRECISION));
  }
};

tst_erf();

/**
 * @param {Iterable<T>[]} its
 * @return {IterableIterator<T>}
 */
const zip = function* (...its) {
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

/**
 * @param {number} lo
 * @param {number} hi
 * @param {number} step
 * @return {IterableIterator<number>}
 */
const seq = function* (lo, hi, step) {
  for (let i = lo; i <= hi; i += step) {
    yield i;
  }
};

const tst_norms = async () => {
  const top_lv = dirname(new URL(import.meta.url).pathname);
  const tmp = join(top_lv, "tmp");
  const code = await new Promise((resolve, reject) => {
    spawn(join(top_lv, "norm.r"), [], {
      signal,
      stdio: "inherit",
    })
      .once("error", reject)
      .once("exit", resolve);
  });
  if (code) {
    fail(`$? - ${code}`);
  }

  /**
   * @param {string} csv
   * @return {IterableIterator<number>}
   */
  const parse = function* (csv) {
    const map = { Inf: Infinity, "-Inf": -Infinity };
    for (const line of csv.split(EOL)) {
      if (line) {
        const val = map[line] ?? Number(line);
        ok(!isNaN(val));
        yield val;
      }
    }
  };

  const [r_pdf, r_cdf, r_cdf_inv] = (
    await Promise.all(
      ["pdf.csv", "cdf.csv", "cdf_inv.csv"].map((csv) =>
        readFile(join(tmp, csv), "utf8")
      )
    )
  ).map(parse);

  {
    const mean = 0;
    const sd = 1;
    const boundary = 2;
    const reps = 100;

    const tst_norm = () => {
      const gen = [...seq(-boundary, boundary, boundary / reps)];

      const { pdf, cdf, cdf_inv } = norm(mean, sd);
      for (const [lhs, rhs] of zip(gen.map(pdf), r_pdf)) {
        equal(round(lhs, PRECISION), round(rhs, PRECISION));
      }
      for (const [lhs, rhs] of zip(gen.map(cdf), r_cdf)) {
        equal(round(lhs, PRECISION), round(rhs, PRECISION));
      }
      for (const [lhs, rhs] of zip(
        [...seq(0, 1, 1 / reps)].map(cdf_inv),
        r_cdf_inv
      )) {
        equal(round(lhs, PRECISION), round(rhs, PRECISION));
      }
    };

    tst_norm();

    const tst_skew_norm = () => {};

    tst_skew_norm();
  }
};

await tst_norms();
