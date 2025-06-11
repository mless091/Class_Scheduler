import express from 'express';
import { Cohort } from "../models/cohortModel";
import { calculateAvailability } from '../business/equalWeightAvailability';

//adds Cohort to database
export const addCohort = async (req:express.Request, res:express.Response) => {
  try {
    const cohortData: any = req.body;
    const newCohort = await Cohort.create(cohortData);
    res.status(200).json(newCohort);
  } catch (error) {
    console.error('Unable to create cohort:', error);
    res.status(500).json({ error: 'Unable to create cohort' });
  }
};

export const getCohorts =  async (req:express.Request, res:express.Response) => {
  try {
    const cohorts = await Cohort.findAll();
    res.status(200).json(cohorts);
  } catch (error) {
    console.error('Unable to get cohorts:', error);
    res.status(500).json({ error: 'Unable to get cohorts' });
  }
};

export const getCohortById = async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    const cohortData = await Cohort.findByPk(id);
    res.status(200).json(cohortData);
  } catch (error) {
    console.error('Unable to get cohort:', error);
    res.status(500).json({ error: 'Unable to get cohort' });
  }
};

export const deleteCohortById = async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    await Cohort.destroy({
      where: { id: id }
    });
    res.status(200).json({ message: 'Cohort deleted' });
  } catch (error) {
    console.error('Unable to delete cohort:', error);
    res.status(500).json({ error: 'Unable to delete cohort' });
  }
};

/* Update the Cohort given it's id. The body of the request needs to have each field
* that is expected to be updated.*/
export const updateCohortById =  async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    const updateData: any = req.body;
    //log the data that is passed for the update, not the class that is to be edited
    console.log(updateData)
    const cohortToBeUpdated = await Cohort.findByPk(id)
    cohortToBeUpdated?.set(updateData)
    //need to assume that cohortToBeUpdated is not null, should never be a problem
    await cohortToBeUpdated!.save()
    res.json(cohortToBeUpdated)
  } catch (error) {
    console.error('Unable to update cohort:', error);
    res.status(500).json({ error: 'Unable to update cohort' });
  }
};
// Export of all methods as object 
module.exports = { getCohorts, getCohortById, addCohort, deleteCohortById, updateCohortById };
