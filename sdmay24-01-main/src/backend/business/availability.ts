import path from "path";
import fs from "fs";
import { Reason } from "./reason";
import { Time } from "./time";
export class Availability {
  time: Time;
  availability: number;
  reasons: Array<Reason>;

  constructor(time: Time) {
    this.time = time;
    this.availability = 100;
    this.reasons = [];
  }

  toString(): string {
    return `Time: ${this.time.toString()}, Availability: ${
      this.availability
    }, Reasons: ${this.reasons.map((reason) => reason.toString()).join(", ")}`;
  }
}
export const getEmptyAvailability = (): Array<Availability> => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "resources",
      "TimeSlots.csv"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Now you can process the file content and return the availability list
    const lines = fileContent.split("\n");
    const availabilityList: Array<Availability> = [];

    //Skips the header
    for (const line of lines.slice(1)) {
      //Create Time object
      const [day, startTime, endTime] = line.split(",");
      if (day == undefined || startTime == undefined || endTime == undefined) {
        break;
      }
      const time = new Time(day, startTime, endTime);

      //Create Availability object
      const availability = new Availability(time);
      availabilityList.push(availability);
    }

    return availabilityList;
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};
