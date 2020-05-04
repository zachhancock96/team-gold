export const env = (s: string): string => {
  if (process.env[s] !== undefined) return process.env[s]!;
  throw new Error(`Env variable ${s} not found`);
};
