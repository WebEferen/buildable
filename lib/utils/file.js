import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse, stringify } from "yaml";

export const readFile = (path, cwd, type = "json") => {
  const directory = dirname(fileURLToPath(import.meta.url));
  const file = cwd ? resolve(cwd, path) : resolve(directory, "../..", path);

  if (!existsSync(file)) return null;
  const contents = readFileSync(file, { encoding: "utf-8" });

  switch (type) {
    case "yaml":
    case "yml":
      return parse(contents);
    case "json":
      return JSON.parse(contents);
    default:
      return {};
  }
};

export const saveFile = (path, contents, type = "json") => {
  const file = resolve(process.cwd(), path);

  switch (type) {
    case "yaml":
    case "yml":
      contents = stringify(contents);
      break;
    case "json":
      contents = JSON.stringify(contents, null, 2);
      break;
  }

  writeFileSync(file, contents);
};
