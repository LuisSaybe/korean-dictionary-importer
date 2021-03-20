import yargs from "yargs";

import { writeToCSV } from "src/helper/write-dictionary-to-rows";
import { writeToSQLLite } from "src/helper/write-dictionary-to-sqllite";

yargs
  .usage("$0 <cmd> [args]")
  .command(
    "sqllite",
    "Import Korean dictionary into specified format",
    (yargs) => {
      yargs
        .option("output", {
          describe: "File to output to",
          demandOption: true,
        })
        .option("input", {
          describe: "CSV input file to read from",
          demandOption: true,
        });
    },
    (argv) => {
      const uncheckedArgv = argv as any;
      writeToSQLLite(uncheckedArgv.input, uncheckedArgv.output);
    },
  )
  .command(
    "csv",
    "Import Korean entries as csv from XML file and API",
    (yargs) => {
      yargs
        .option("output", {
          describe: "File to output to",
          demandOption: true,
        })
        .option("input", {
          describe:
            "The .zip file containing xml files to read from. This can be download in your OpenAPI account from the 사전 내려받기 tab.",
          demandOption: true,
        })
        .option("api_key", {
          describe:
            "API used for https://krdict.korean.go.kr/openApi/openApiInfo API",
          demandOption: true,
        });
    },
    (argv) => {
      const uncheckedArgv = argv as any;
      writeToCSV(
        uncheckedArgv.input,
        uncheckedArgv.output,
        uncheckedArgv.api_key,
      );
    },
  )
  .help().argv;
