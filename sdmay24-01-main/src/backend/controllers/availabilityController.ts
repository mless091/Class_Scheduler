import express from "express";
import { Cohort } from "../models/cohortModel";
import { calculateAvailability } from "../business/equalWeightAvailability";

export const getAvailability = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const cohortIds: idPercentage[] = req.body.cohorts;
    const classes: classPercentage[] = req.body.classes;

    let cohorts = new Array<cohortPercentage>();

    for (let i = 0; i < cohortIds.length; i++) {
      const cohortData = await Cohort.findByPk(cohortIds[i].id);
      if (cohortData == null) {
        console.error("Cohort not found:", cohortIds[i].id);
        res.status(404).json({ error: "Cohort not found" });
      } else {
        cohorts.push({
          cohort: cohortData,
          percentage: cohortIds[i].percentage,
        });
      }
    }
    

    const availability = await calculateAvailability(cohorts, classes);
    res.status(200).json(availability);
  } catch (error) {
    console.error("Unable to get cohort:", error);
    res.status(500).json({ error: "Unable to get cohort" });
  }
};

// Export of all methods as object
module.exports = { getAvailability };

interface idPercentage {
  id: number;
  percentage: number;
}

export interface cohortPercentage {
  cohort: Cohort;
  percentage: number;
}
export interface classPercentage {
  classDepartment: string;
  classNumber: number;
  percentage: number;
}
