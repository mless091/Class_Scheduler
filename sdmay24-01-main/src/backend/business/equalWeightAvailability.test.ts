import {
  classPercentage,
  cohortPercentage,
} from "../controllers/availabilityController";
import { ClassData } from "../models/classModel";
import { Availability } from "./availability";
jest.mock("./availability", () => {
  const originalModule = jest.requireActual("./availability");
  return {
    _esModule: true,
    ...originalModule,
    getEmptyAvailability: jest.fn(() => mockAvailability()),
  };
});
import {
  calculateAvailability,
  timesAreOverlapping,
} from "./equalWeightAvailability";
import { Time } from "./time";

function mockAvailability(): Availability[] {
  return [
    new Availability(new Time("Monday", "10:00", "10:59")),
    new Availability(new Time("Monday", "11:00", "11:59")),
    new Availability(new Time("Monday", "12:00", "12:59")),
    new Availability(new Time("Monday", "13:00", "13:59")),
  ];
}

const mockSections: ClassData[] = [
  {
    id: 1,
    classDepartment: "S E",
    classNumber: 185,
    section: "A",
    classTimes: [new Time("Monday", "10:00", "10:59")], //Original Line: classTimes: [{ day: "Monday", startTime: "10:00", endTime: "10:59" }],
  },
  {
    id: 1,
    classDepartment: "S E",
    classNumber: 185,
    section: "B",
    classTimes: [new Time("Monday", "12:00", "12:59")], //Original Line: [{ day: "Monday", startTime: "12:00", endTime: "12:59" }],
  },
  {
    id: 2,
    classDepartment: "S E",
    classNumber: 160,
    section: "B",
    classTimes: [new Time("Monday", "11:00", "11:59")], //Original Line: [{ day: "Monday", startTime: "11:00", endTime: "11:59" }],
  },
  // Add more mock sections as needed
];

// Mock the findAll method of the Class model
jest.mock("../models/classModel", () => ({
  Class: {
    findAll: jest.fn(() => mockSections),
  },
}));

const mockCohorts = [
  {
    cohort: {
      id: 1,
      department: "S E",
      semesterNumber: 1,
      classes: [
        {
          classDepartment: "S E",
          classNumber: 185,
        },
        {
          classDepartment: "S E",
          classNumber: 160,
        },
      ],
    },
    percentage: 50,
  },
  {
    cohort: {
      id: 3,
      department: "Your Department",
      semesterNumber: 2,
      classes: [
        {
          classDepartment: "S E",
          classNumber: 185,
        },
        {
          classDepartment: "S E",
          classNumber: 160,
        },
      ],
    },
    percentage: 50,
  },
];

const mockClasses: classPercentage[] = [
  {
    classDepartment: "S E",
    classNumber: 185,
    percentage: 100,
  },
  {
    classDepartment: "S E",
    classNumber: 160,
    percentage: 100,
  },
];

describe("calculateAvailability", () => {
  /* fix this mock*/
  beforeEach(() => {
    jest.resetModules();
  });
  test("should calculate availability correctly for classes", async () => {
    // Mock input data
    const classes: classPercentage[] = mockClasses;

    // Call the function
    const result = await calculateAvailability([], classes);

    const availabilityMap = new Map<string, number>();
    availabilityMap.set(new Time("Monday", "10:00", "10:59").toString(), 50);
    availabilityMap.set(new Time("Monday", "11:00", "11:59").toString(), 0);
    availabilityMap.set(new Time("Monday", "12:00", "12:59").toString(), 50);
    availabilityMap.set(new Time("Monday", "13:00", "13:59").toString(), 100);
    // Assert the result
    result.forEach((element) => {
      const percent = availabilityMap.get(element.time.toString());
      expect(element.availability).toEqual(percent);
    });
  });

  test("should calculate availability correctly for cohorts", async () => {
    // Mock input data
    const cohorts: cohortPercentage[] = mockCohorts as cohortPercentage[];

    // Call the function
    const result = await calculateAvailability(cohorts, []);

    const availabilityMap = new Map<string, number>();
    availabilityMap.set(new Time("Monday", "10:00", "10:59").toString(), 50);
    availabilityMap.set(new Time("Monday", "11:00", "11:59").toString(), 0);
    availabilityMap.set(new Time("Monday", "12:00", "12:59").toString(), 50);
    availabilityMap.set(new Time("Monday", "13:00", "13:59").toString(), 100);
    // Assert the result
    result.forEach((element) => {
      const percent = availabilityMap.get(element.time.toString());
      expect(element.availability).toEqual(percent);
    });
  });
});

describe("Equal Weight Availability Tests", () => {
  test("should correctly identify overlapping times", () => {
    const time1 = new Time("Monday", "09:00", "10:00");
    const time2 = new Time("Monday", "09:30", "10:30");
    expect(timesAreOverlapping(time1, time2)).toBe(true);
  });

  test("should correctly identify non-overlapping times", () => {
    const time1 = new Time("Monday", "09:00", "10:00");
    const time2 = new Time("Monday", "10:30", "11:30");
    expect(timesAreOverlapping(time1, time2)).toBe(false);
  });
});
