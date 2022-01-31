#!/usr/bin/env node

import { erf, erv_inv } from "./math.mjs";

import { equal } from "assert";

equal(erf(0.5), 0.520499877813047);
