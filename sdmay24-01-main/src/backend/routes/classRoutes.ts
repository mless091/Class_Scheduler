import { Router } from "express";
import { addClass, getClasses, getClassById, deleteClassById, getUniqueClasses, updateClassById } from "../controllers/classController";

// Initialization
const router = Router();

// Requests - order matters. You can't have a get request to /:id before a get request to / or a specific endpoint. 
router.post("/", addClass);
router.get("/", getClasses);
router.get("/unique", getUniqueClasses);
router.get("/:id", getClassById);
router.delete("/:id", deleteClassById);
router.put("/:id", updateClassById)


module.exports = router;
