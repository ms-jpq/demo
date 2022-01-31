#!/usr/bin/env node

import { EOL } from "os";
import { dirname, join } from "path";
import { equal, fail, ok } from "assert";
import { erf, erf_inv, round } from "./math.mjs";
import { readFile } from "fs/promises";
import { spawn } from "child_process";

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

const tst_norm = async () => {
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

  const [pdf_csv, cdf_csv, cdf_inv_csv] = await Promise.all(
    ["pdf.csv", "cdf.csv", "cdf_inv.csv"].map((csv) =>
      readFile(join(tmp, csv), "utf8")
    )
  );

  console.log(...parse(pdf_csv));
  console.log(...parse(cdf_csv));
  console.log(...parse(cdf_inv_csv));
};

await tst_norm();
