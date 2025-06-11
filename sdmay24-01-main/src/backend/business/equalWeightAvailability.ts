import { Cohort } from "../models/cohortModel";
import { Class, ClassData } from "../models/classModel";
import {
  classPercentage,
  cohortPercentage,
} from "../controllers/availabilityController";
import { Availability, getEmptyAvailability } from "./availability";
import { Reason } from "./reason";
import { Time } from "./time";

export const calculateAvailability = async (
  cohorts: cohortPercentage[],
  classes: classPercentage[]
): Promise<Array<Availability>> => {
  let timeBlocks = getEmptyAvailability();
  const sections = await Class.findAll();
  for (let i = 0; i < cohorts.length; i++) {
    const cohort = cohorts[i].cohort;
    const percentage = cohorts[i].percentage;
    updateAvailabilityForCohort(cohort, percentage, sections, timeBlocks);
  }
  for (let i = 0; i < classes.length; i++) {
    const course = classes[i];
    const percentage = course.percentage;
    const classDepartment = course.classDepartment;
    const classNumber = course.classNumber;
    addConflictsForClass(sections, classDepartment, classNumber, timeBlocks, percentage);
  }

  return timeBlocks;
};

export const timesAreOverlapping = (first: Time, second: Time): boolean => {
  if (first.day !== second.day) {
    return false;
  }
  //Send to dates for easy comparison
  const firstStartTime = new Date(`2023-01-01 ${first.startTime}`);
  const firstEndTime = new Date(`2023-01-01 ${first.endTime}`);
  const secondStartTime = new Date(`2023-01-01 ${second.startTime}`);
  const secondEndTime = new Date(`2023-01-01 ${second.endTime}`);

  return (
    (firstStartTime <= secondEndTime && firstEndTime >= secondStartTime) ||
    (secondStartTime <= firstEndTime && secondEndTime >= firstStartTime)
  );
};
//Gets sections for a particular class, either all the sections with numeric section or non numeric section
const getSectionsOfClass = (
  sections: ClassData[],
  department: string,
  classNumber: number,
  numeric: boolean
): Array<ClassData> => {
  let sectionsOfClass: Array<ClassData> = new Array();
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (
      section.classNumber === classNumber &&
      section.classDepartment === department &&
      ((numeric && isNumeric(section.section)) ||
        (!numeric && !isNumeric(section.section))) //checks whether or lecture based off whether the section is numeric
    ) {
      sectionsOfClass.push(section);
    }
  }
  return sectionsOfClass;
};

function updateAvailabilityForCohort(
  cohort: Cohort,
  percentage: number,
  sections: ClassData[],
  timeBlocks: Availability[]
) {
  for (let i = 0; i < cohort.classes.length; i++) {
    let department: string = cohort.classes[i].classDepartment;
    let classNumber: number = cohort.classes[i].classNumber;
    addConflictsForClass(sections, department, classNumber, timeBlocks, percentage);
  }
}

function addConflictsForClass(sections: ClassData[], department: string, classNumber: number, timeBlocks: Availability[], percentage: number) {
  let numericSectionsOfClass = getSectionsOfClass(
    sections,
    department,
    classNumber,
    true
  );
  let nonNumericSectionsOfClass = getSectionsOfClass(
    sections,
    department,
    classNumber,
    false
  );
  addConflictsForSections(
    numericSectionsOfClass,
    timeBlocks,
    department,
    classNumber,
    percentage
  );
  addConflictsForSections(
    nonNumericSectionsOfClass,
    timeBlocks,
    department,
    classNumber,
    percentage
  );
}

function addConflictsForSections(
  sectionsOfClass: ClassData[],
  timeBlocks: Availability[],
  department: string,
  classNumber: number,
  percentage: number
) {
  let numOfSections = sectionsOfClass.length;
  for (let j = 0; j < numOfSections; j++) {
    const section = sectionsOfClass[j];
    //Find all timeslots that match this section class that are matching
    for (let k = 0; k < timeBlocks.length; k++) {
      const timeBlock = timeBlocks[k];
      section.classTimes.forEach((classTime) => {
        if (timesAreOverlapping(classTime, timeBlock.time)) {
          timeBlock.availability -= (100 / numOfSections) * (.01 * percentage);
          timeBlock.availability = Number(Math.max(timeBlock.availability, 0).toFixed(2));
          let reason = new Reason(
            (100 / numOfSections) * (.01 * percentage),
            department + " " + classNumber,
            section.section
          );
          timeBlock.reasons.push(reason);
        }
      });
    }
  }
}

function isNumeric(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (!(code > 47 && code < 58)) {
      // numeric (0-9)
      return false;
    }
  }
  return true;
}
