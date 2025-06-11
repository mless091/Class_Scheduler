import { Router } from "express";

import { getImports, getImportById, deleteImportById, addImport, refreshCourses, getImportPreferences, setImportPreferences, getFormDefaults } from "../controllers/importController";

// Initialization
const router = Router();

// Requests - order matters. You can't have a get request to /:id before a get request to / or a specific endpoint. 
router.post("/", addImport);
router.get("/", getImports);
router.get("/isuinfo", getImports);
router.get("/importPreferences", getImportPreferences);
router.get("/formDefaults", getFormDefaults);
router.post("/importPreferences", setImportPreferences);
router.post("/refresh", refreshCourses);
router.get("/:id", getImportById);
router.delete("/:id", deleteImportById);


module.exports = router;
