import axios from 'axios';
import { ImportPreferences } from "../models/importPreferences";

const dayMapping = { //when you had a mainframe, space was precious so they shortened this. 
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'R': 'Thursday',
  'F': 'Friday'
};

type Section = {
  classDepartment: string;
  classNumber: string;
  section: string;
  classTimes: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
};

export const refreshCoursesAlgorithm = async (formattedData: { department: string, classes: string[] }[]) => {
  const result: Section[] = [];
   // Fetch the selectedTerm from the ImportPreferences model
   const importPreferences = await ImportPreferences.findOne();
   const selectedTerm = importPreferences ? importPreferences.semester_id : 1;
 
   await Promise.all(formattedData.map(async ({ department, classes }) => {
     const payload = {
       selectedTerm,
       selectedDepartment: department
     };

    try {
      const response = await axios.post('https://classes.iastate.edu/app/rest/courses/preferences', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      //This mess basically formats the classes.iastate.edu response into a standardized format
      response.data.response
        .filter((obj: any) => classes.includes(obj.classNumber))
        .forEach(({ deptCode: classDepartment, classNumber, sections }: any) => {
          const cleanedSections: Section[] = sections.map(({ sectionID, sectionTimes }: any) => {
            const times = sectionTimes.map(({ startTime, stopTime, meetDays }: any) => {
              const days = meetDays.trim().split(' ');
              return days.map((day: keyof typeof dayMapping) => ({
                day: dayMapping[day],
                startTime: startTime.substring(0, 5),
                endTime: stopTime.substring(0, 5)
              }));
            });

            return {
              classDepartment,
              classNumber,
              section: sectionID.trim(),
              classTimes: times.flat()
            };
          });

          cleanedSections.forEach((section: Section) => {
            result.push(section);
          });
        });
    } catch (error) {
      console.error('Unable to fetch data:', error);
    }
  }));

  return result;
};