#!/usr/bin/env node

let args = process.argv.slice(2);

function usage(errMsg) {
  console.log(`!!! ${errMsg}`);
  console.log("Usage: ");
  console.log("  gen <target> <options>");
  console.log("");
  console.log("  <target>        user | stat | dev | hdev | act | hact");
  console.log("  <options>       for user");
  console.log("                    --size: # of size to be generated");
  console.log("  <options>       for hdev and dev");
  console.log("                    --size: # of size to be generated");
  console.log("  <options>       for stat");
  console.log("                    --subtarget: unit | prog | all*");
  console.log("                    --output: output directory");
  console.log("  <options>       for act and course");
  console.log("                    --days: # of days to be generaged");
  console.log();
}

if (args.length < 1) {
  usage();
  process.exit(1);
}

const target = args[0];
const opts = {};
if (args.length > 1) {
  args = args.slice(1);
  args.reduce((acc, e) => {
    if (e.startsWith("--")) {
      return e.slice(2);
    } else {
      if (acc) {
        opts[acc] = e;
      }
    }
  }, null);
}
console.log(opts);

const {
  genUsers,
  genJfhdevices,
  genDefaultStatisticsForExercisePrograms,
  genDefaultStatisticsForUnitExercises,
  genJfactivitiesCourse,
  genJfactivities,
} = require("my-test-utils");

switch (target) {
  case "user":
    console.log(genUsers(opts));
    break;
  case "dev":
  case "hdev":
    console.log(genJfhdevices(opts));
    break;
  case "stat":
    if (opts.subtarget === "prog") {
      genDefaultStatisticsForExercisePrograms(opts);
    } else if (opts.subtarget === "unit") {
      genDefaultStatisticsForUnitExercises(opts);
    } else {
      genDefaultStatisticsForExercisePrograms(opts);
      genDefaultStatisticsForUnitExercises(opts);
    }
    break;
  case "act":
  case "hact":
    console.log(
      JSON.stringify(genJfactivities(genUsers({ size: 5 }), genJfhdevices({ size: 5 }), opts))
    );
    break;
  case "course":
    console.log(JSON.stringify(genJfactivitiesCourse(genUsers({ size: 5 }), opts)));
    break;
  default:
    usage("invalid target: " + target);
    process.exit(1);
}
