/**
 * Approx Error Function
 *
 * @param {number} n
 * @return {number}
 */
export const erf = (() => {
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  return (n) => {
    const sign = n >= 0 ? 1 : -1;
    const x = Math.abs(n);

    const t = 1 / (1 + p * x);
    const y =
      1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };
})();

/**
 * Inverse Approx Error Function
 *
 * @param {number} n
 * @return {number}
 */
export const erf_inv = (() => {
  const P0 = [
    -59.96335010141079, 98.00107541859997, -56.67628574690703,
    13.931260938727968, -1.2391658386738125,
  ];
  const Q0 = [
    1.9544885833814176, 4.676279128988815, 86.36024213908905,
    -225.46268785411937, 200.26021238006066, -82.03722561683334,
    15.90562251262117, -1.1833162112133,
  ];
  const P1 = [
    4.0554489230596245, 31.525109459989388, 57.16281922464213,
    44.08050738932008, 14.684956192885803, 2.1866330685079025,
    -0.1402560791713545, -0.03504246268278482, -0.0008574567851546854,
  ];
  const Q1 = [
    15.779988325646675, 45.39076351288792, 41.3172038254672, 15.04253856929075,
    2.504649462083094, -0.14218292285478779, -0.03808064076915783,
    -0.0009332594808954574,
  ];
  const P2 = [
    3.2377489177694603, 6.915228890689842, 3.9388102529247444,
    1.3330346081580755, 0.20148538954917908, 0.012371663481782003,
    0.00030158155350823543, 2.6580697468673755e-6, 6.239745391849833e-9,
  ];
  const Q2 = [
    6.02427039364742, 3.6798356385616087, 1.3770209948908132,
    0.21623699359449663, 0.013420400608854318, 0.00032801446468212774,
    2.8924786474538068e-6, 6.790194080099813e-9,
  ];

  /**
   * @param {number} x
   * @param {number[]} coefs
   */
  const polevl = (x, coefs) => {
    let ans = 0;
    let power = coefs.length - 1;
    for (const coef of coefs) {
      ans += coef * Math.pow(x, power);
      power -= 1;
    }
    return ans;
  };

  /**
   * @param {number} x
   * @param {number[]} coefs
   */
  const p1evl = (x, coefs) => polevl(x, [1, ...coefs]);

  return (n) => {
    if (n < -1 || n > 1) {
      throw new Error();
    } else if (n == 0) {
      return 0;
    } else if (n == 1) {
      return math.inf;
    } else if (n == -1) {
      return -math.inf;
    } else {
      const ndtri = (y) => {
        const s2pi = 2.5066282746310007;
        let code = 1;
        if (y > 1.0 - 0.1353352832366127) {
          y = 1.0 - y;
          code = 0;
        }
        if (y > 0.1353352832366127) {
          y = y - 0.5;
          const y2 = y * y;
          let x = y + y * ((y2 * polevl(y2, P0)) / p1evl(y2, Q0));
          x = x * s2pi;
          return x;
        } else {
          let x = Math.sqrt(-2.0 * Math.log(y));
          const x0 = x - Math.log(x) / x;
          const z = 1.0 / x;
          if (x < 8.0) {
            var x1 = (z * polevl(z, P1)) / p1evl(z, Q1);
          } else {
            var x1 = (z * polevl(z, P2)) / p1evl(z, Q2);
          }
          x = x0 - x1;
          if (code != 0) {
            x = -x;
          }
          return x;
        }
      };

      return ndtri((n + 1) / 2.0) / Math.sqrt(2);
    }
  };
})();
