import { CliOptions } from "../modules/options.js";

const run = async (parameters) => {
  const options = new CliOptions({ ...parameters });
  return options.initializeConfig();
};

export default {
  name: "init",
  description: "initialize buildable configuration",
  builder: (yargs) => yargs.help(),
  handler: (options) => run(options),
};
