// @flow

import {uniformDistribution, computeDelta, deltaLessThan} from "./distribution";

describe("core/attribution/distribution", () => {
  describe("uniformDistribution", () => {
    describe("errors for: ", () => {
      [
        [NaN, "NaN"],
        [-1, "negatives"],
        [0, "zero"],
        [1.337, "non-integer"],
      ].forEach(([value, name]) => {
        it(name, () => {
          expect(() => uniformDistribution(value)).toThrowError(
            "expected positive integer"
          );
        });
      });
    });
    it("returns a uniform distribution of size 1", () => {
      expect(uniformDistribution(1)).toEqual(new Float64Array([1]));
    });
    it("returns a uniform distribution of size 2", () => {
      expect(uniformDistribution(2)).toEqual(new Float64Array([0.5, 0.5]));
    });
  });

  describe("computeDelta", () => {
    const u = uniformDistribution;
    it("errors on empty array", () => {
      expect(() =>
        computeDelta(new Float64Array([]), new Float64Array([]))
      ).toThrowError("invalid input");
    });
    it("works on size-1 array", () => {
      expect(computeDelta(u(1), u(1))).toEqual(0);
    });
    it("errors on mismatched sizes", () => {
      expect(() => computeDelta(u(1), u(2))).toThrowError("invalid input");
    });
    it("correctly computes max delta", () => {
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      expect(computeDelta(u(3), pi)).toEqual(1 / 3);
    });
    it("doesn't depend on argument order", () => {
      // implies that it uses Math.abs for delta computation
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      expect(computeDelta(u(3), pi)).toEqual(computeDelta(pi, u(3)));
    });
  });

  describe("deltaLessThan", () => {
    const u = uniformDistribution;
    it("errors on empty array", () => {
      expect(() =>
        deltaLessThan(new Float64Array([]), new Float64Array([]), 1)
      ).toThrowError("invalid input");
    });
    it("errors on mismatched sizes", () => {
      expect(() => deltaLessThan(u(1), u(2), 1)).toThrowError("invalid input");
    });
    it("returns true if delta is less than target", () => {
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      expect(deltaLessThan(u(3), pi, 0.5)).toEqual(true);
    });
    it("returns false if delta is greater than target", () => {
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      expect(deltaLessThan(u(3), pi, 0.2)).toEqual(false);
    });
    it("returns false if delta is equal to target", () => {
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      expect(deltaLessThan(u(3), pi, 1 / 3)).toEqual(false);
    });
    it("doesn't depend on argument order", () => {
      const pi = new Float64Array([0.5, 0.0, 0.5]);
      const targets = [0.2, 1 / 3, 0.4];
      for (const target of targets) {
        expect(deltaLessThan(u(3), pi, target)).toEqual(
          deltaLessThan(pi, u(3), target)
        );
      }
    });
  });
});
