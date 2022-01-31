#!/usr/bin/env node

import { erf, erf_inv, round } from "./math.mjs";
import { equal } from "assert";

const PRECISION = 3;

for (let i = 0; i < 1000; i++) {
  const x = Math.random();
  const y = erf(x);
  const z = erf_inv(y);
  equal(round(x, PRECISION), round(z, PRECISION));
}
