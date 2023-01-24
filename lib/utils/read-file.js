import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

export const readJsonFile = (path, cwd) => {
  let file = resolve(dirname(fileURLToPath(import.meta.url)), "../..", path);
  if (cwd) file = resolve(cwd, path);
  if (!existsSync(file)) return {};

  try {
    return JSON.parse(readFileSync(file, { encoding: "utf-8" }));
  } catch {
    return {};
  }
};
