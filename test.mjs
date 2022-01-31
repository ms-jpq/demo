#!/usr/bin/env node

import { EOL } from "os";
import { dirname, join } from "path";
import { env } from "process";
import { equal, fail, ok } from "assert";
import { erf, erf_inv, round } from "./math.mjs";
import { norm, skew_norm_pdf } from "./stats.mjs";
import { readFile } from "fs/promises";
import { spawn } from "child_process";
import { zip } from "./prelude.mjs";

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
  const cwd = dirname(new URL(import.meta.url).pathname);
  const tmp = join(cwd, "tmp");

  const mean = 3;
  const sd = 1;
  const boundary = 2;
  const reps = 100;
  const alpha = Math.random();

  const code = await new Promise((resolve, reject) => {
    spawn(join(cwd, "norm.r"), [], {
      signal,
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
      env: { ...env, mean, sd, boundary, reps, alpha },
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

  const [r_pdf, r_cdf, r_cdf_inv, r_s_pdf_0, r_s_pdf_a] = (
    await Promise.all(
      ["pdf.csv", "cdf.csv", "cdf_inv.csv", "s_pdf_0.csv", "s_pdf_a.csv"].map(
        (csv) => readFile(join(tmp, csv), "utf8")
      )
    )
  ).map(parse);

  {
    const gen = [...seq(-boundary, boundary, boundary / reps)];

    const tst_norm = () => {
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

    // TODO: -- We need to ensure skew_norm_pdf works with non-zero `mu`
    const tst_skew_norm = () => {
      const s_pdf_0 = skew_norm_pdf(norm(mean, sd), 0);
      const s_pdf_a = skew_norm_pdf(norm(mean, sd), alpha);

      for (const [lhs, rhs] of zip(gen.map(s_pdf_0), r_s_pdf_0)) {
        console.debug(round(lhs, PRECISION), round(rhs, PRECISION));
      }
      for (const [lhs, rhs] of zip(gen.map(s_pdf_a), r_s_pdf_a)) {
        console.debug(round(lhs, PRECISION), round(rhs, PRECISION));
      }
    };

    tst_skew_norm();
  }
};

await tst_norms();
