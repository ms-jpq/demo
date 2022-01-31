import { erf, erf_inv } from "./math.mjs";

/**
 * Standard Norm Dist
 *
 * @param {number} mu
 * @param {number} sigma
 * @return {{ pdf: (x: number) => number, cdf: (x: number) => number, cdf_inv: (p: number) => number }}
 */
export const norm = (mu = 0, sigma = 1) => {
  const pdf = (x) => {
    const lhs = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exp = -(1 / 2) * Math.pow((x - mu) / sigma, 2);
    const rhs = Math.pow(Math.E, exp);
    return lhs * rhs;
  };
  const cdf = (x) => {
    return (1 / 2) * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
  };
  const cdf_inv = (p) => {
    return mu + sigma * Math.sqrt(2) * erf_inv(2 * p - 1);
  };
  return { pdf, cdf, cdf_inv };
};

/**
 * Skew Norm Dist
 * WARNING: This forumlation works IFF Z -> Standard Normal Dist
 *
 * @param {ReturnType<norm>} norm
 * @param {number} alpha
 * @return {(z: number) => number}
 */
export const skew_norm_pdf = (norm, alpha = 0) => {
  const { pdf, cdf } = norm;
  return (z) => 2 * pdf(z) * cdf(alpha * z);
};
