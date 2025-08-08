export const lerp = (a: number, b: number, perc: number) => {
  return a + perc * (b - a);
};
