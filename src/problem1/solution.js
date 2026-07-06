// Assumption: n is a non-negative integer.

const sum_to_n_a = function (n) {
  // Iterative — O(n) time, O(1) space
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

const sum_to_n_b = function (n) {
  // Recursive — O(n) time, O(n) space (call stack)
  if (n <= 0) return 0;
  return n + sum_to_n_b(n - 1);
};

const sum_to_n_c = function (n) {
  // Gauss formula — O(1) time, O(1) space
  return (n * (n + 1)) / 2;
};
