import { Router } from "express";

import { addSchedule, getAllSchedules, deleteScheduleById, updateScheduleById } from "../controllers/scheduleController";

// Initialization
const router = Router();

// Requests - order matters. You can't have a get request to /:id before a get request to / or a specific endpoint. 
router.post("/", addSchedule); // it's a find or create so it's a post request. you can send it an existing id and it will update it. Kinda bad dev practices but need it for frontend. 
router.get("/", getAllSchedules);
router.delete("/:id", deleteScheduleById);

module.exports = router;