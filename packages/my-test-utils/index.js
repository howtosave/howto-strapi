const { genUsers, insertUsers } = require("./test-data-user/gen-users");
const { genJfhdevices, insertJfhdevices } = require("./test-data-jfhdevice/gen-jfhdevices");
const { genJfactivities, insertJfactivities } = require("./test-data-jfactivity/gen-jfactivities");
const {
  genJfactivityExCourses,
  insertJfactivityExCourses,
} = require("./test-data-jfactivity/gen-jfactivity-excourses");
const {
  genDefaultStatisticsForExercisePrograms,
  genDefaultStatisticsForUnitExercises,
} = require("./test-data-statistics/gen-data");

module.exports = {
  genUsers,
  insertUsers,
  genJfhdevices,
  insertJfhdevices,
  genJfactivities,
  insertJfactivities,
  genJfactivityExCourses,
  insertJfactivityExCourses,
  genDefaultStatisticsForExercisePrograms,
  genDefaultStatisticsForUnitExercises,
};
