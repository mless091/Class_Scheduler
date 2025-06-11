import { Router } from "express";

import { getAvailability } from "../controllers/availabilityController";

// Initialization
const router = Router();

// Requests - order matters. You can't have a get request to /:id before a get request to / or a specific endpoint.
router.post("/", getAvailability);

module.exports = router;
