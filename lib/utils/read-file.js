import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse, stringify } from "yaml";

export const readFile = (path, cwd, type = "json") => {
  let file = resolve(dirname(fileURLToPath(import.meta.url)), "../..", path);
  if (cwd) file = resolve(cwd, path);
  if (!existsSync(file)) return {};

  try {
    const contents = readFileSync(file, { encoding: "utf-8" });

    if (type === "yaml" || type === "yml") {
      return parse(contents);
    }

    return JSON.parse(contents);
  } catch {
    return {};
  }
};

export const saveFile = (path, contents, type = "json") => {
  const file = resolve(process.cwd(), path);

  if (type === "yaml" || type === "yml") {
    contents = stringify(contents);
  }

  if (type === "json") {
    contents = JSON.stringify(contents);
  }

  writeFileSync(file, contents);
};
