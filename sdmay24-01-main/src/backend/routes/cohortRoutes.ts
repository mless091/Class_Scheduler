import { Router } from "express";

import { getCohorts, getCohortById, deleteCohortById, addCohort, updateCohortById} from "../controllers/cohortController";

// Initialization
const router = Router();

// Requests - order matters. You can't have a get request to /:id before a get request to / or a specific endpoint. 
router.post("/", addCohort);
router.get("/", getCohorts);
router.get("/:id", getCohortById);
router.delete("/:id", deleteCohortById);
router.put("/:id", updateCohortById)

module.exports = router;
