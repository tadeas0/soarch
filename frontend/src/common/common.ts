// eslint-disable-next-line import/prefer-default-export
export const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);
