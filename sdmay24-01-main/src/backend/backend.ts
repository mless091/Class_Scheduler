import express from "express";
import cors from "cors";

import { Class } from "./models/classModel";
import { Cohort } from "./models/cohortModel";
import { Import } from "./models/importModel";
import { ImportPreferences } from "./models/importPreferences";
import { Schedule } from "./models/scheduleModel";

const classRouter = require("./routes/classRoutes");
const cohortRouter = require("./routes/cohortRoutes");
const importRouter = require("./routes/importRoutes");
const availabilityRouter = require("./routes/availabilityRoutes");
const scheduleRouter = require("./routes/scheduleRoutes");

const app = express();

// for parsing application/json
app.use(express.json(), cors());

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});

app.use("/class", classRouter);
app.use("/cohort", cohortRouter);
app.use("/import", importRouter);
app.use("/availability", availabilityRouter);
app.use("/schedule", scheduleRouter);

async function syncDatabase() {
  try {
    // This creates the table if it doesn't exist (and does nothing if it already exists)
    await Class.sync();
    await Cohort.sync();
    await Import.sync();
    await Schedule.sync();
    await ImportPreferences.sync();

    console.log("The table was just (re)created!");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
}

// Call the asynchronous function
syncDatabase();

module.exports = app;
