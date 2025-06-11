# Building this project make sure yarn is installed and run the following commands
  yarn install //Installs all node modules for this project
  yarn run electron:start
# Project Overview
The Class Scheduler project aims to develop a desktop application that can efficiently schedule new courses for the Electrical and Computer Engineering (ECpE) department at Iowa State University.

Currently, ECpE schedules courses manually using a master spreadsheet, which is time-consuming and makes it difficult to quickly find available timeslots. There is no existing automated system to optimize course scheduling.

The application will allow users, primarily ECpE office staff, to input the core class schedule for each major (EE, CprE, CyberE) per semester. Users can then specify details and scheduling rules for a new course and the application will recommend the best time slots that avoid conflicts with existing classes students take.

Key requirements for the application include:

- User-friendly desktop interface for entering course details and viewing schedules
- Algorithm to find optimal schedules based on rules and constraints
- Integration with university data sources like classes.iastate.edu (if possible)
- Easy installation for non-technical users

The system aims to reduce scheduling conflicts for students by using intelligence to assign class times adhering to predefined rules. This will streamline the course scheduling process for ECpE staff.

The project utilizes skills in UI/UX design, algorithms, data management, and full-stack development. It addresses real department needs and demonstrates application of technical knowledge to solve an organizational challenge.

Website: https://sdmay24-01.sd.ece.iastate.edu/
