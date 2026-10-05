# Class Scheduler
 
A cross-platform desktop app that helps Iowa State University academic advisors choose class timeslots by predicting when the target students are actually available. Built as a senior design project for the Electrical and Computer Engineering department and **still in use by the department**.
 
[Live Demo](https://sdmay24-01.sd.ece.iastate.edu/) · Senior Design Team sdmay24-01
 
<!-- TODO: add a screenshot, e.g. ![Class Scheduler](docs/screenshot.png) -->
 
## The Problem
 
When the department schedules a new class, advisors have to find a timeslot that doesn't collide with the other classes the same students need to take. Doing this by hand means cross-checking many schedules and guessing at availability. This tool automates that and surfaces the timeslots that work for the most students.
 
## Features
 
- Predicts student availability across overlapping class timeslots
- Recommends timeslots that maximize the number of students who can attend
- Runs as a desktop app (Electron) on Windows, macOS, and Linux
- Stores data locally in SQLite, so no server setup is required for advisors
<!-- TODO: confirm this list against the final feature set and edit as needed -->
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| UI | React, TypeScript |
| Desktop shell | Electron |
| Backend logic | Node.js |
| Database | SQLite |
 
## How It Works
 
The core of the project is the availability algorithm. Given the schedules of the classes that students in a target group take together, it determines which candidate timeslots overlap with existing commitments and ranks the options by how many students could attend.
 
<!-- TODO: add 2-3 sentences on the actual approach (data model, how overlaps are computed, how ranking works) and one design tradeoff you made. This section is what interviewers will ask about. -->
 
## Getting Started
 
The application code lives in the `sdmay24-01-main/` directory.
 
```bash
git clone https://github.com/mless091/Class_Scheduler.git
cd Class_Scheduler/sdmay24-01-main
npm install
npm start
```
 
<!-- TODO: verify these commands against the repo's package.json scripts and note the required Node version -->
 
## My Role
 
I worked on this as part of a 5-person Agile team, where I led sprint planning and delivered features against specifications from the department head.
 
<!-- TODO: add 1-2 specific things you personally built (e.g. the availability algorithm, the SQLite layer, a particular UI flow) -->
 
## Project Status
 
Delivered to the department in 2024 and still in use by academic advisors.
 
## Team
 
Senior Design Team sdmay24-01, Iowa State University, 2023-2024.
 
<!-- TODO: add teammates' names if you want to credit them -->
