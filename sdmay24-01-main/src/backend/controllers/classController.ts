import express from 'express';
import { Class } from "../models/classModel";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import { Sequelize } from 'sequelize';
//adds Class to database
export const addClass = async (req:express.Request, res:express.Response) => {
  try {
    const classData: any = req.body;
    console.log(classData);
    const newClass = await Class.create(classData);
    res.status(200).json(newClass);
  } catch (error) {
    console.error('Unable to create class:', error);
    res.status(500).json({ error: 'Unable to create class' });
  }
};

export const getClasses =  async (req:express.Request, res:express.Response) => {
  try {
    const classes = await Class.findAll();
    res.status(200).json(classes);
  } catch (error) {
    console.error('Unable to get classes:', error);
    res.status(500).json({ error: 'Unable to get classes' });
  }
};

export const getClassById = async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    const classData = await Class.findByPk(id);
    res.status(200).json(classData);
  } catch (error) {
    console.error('Unable to get class:', error);
    res.status(500).json({ error: 'Unable to get class' });
  }
};

export const deleteClassById = async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    await Class.destroy({
      where: { id: id }
    });
    res.status(200).json({ message: 'Class deleted' });
  } catch (error) {
    console.error('Unable to delete class:', error);
    res.status(500).json({ error: 'Unable to delete class' });
  }
};

/* GET unique classes to be used in places that a course is selected */
export const getUniqueClasses =  async (req:express.Request, res:express.Response) => {
  try {
    const uniqueClasses = await Class.findAll({
      attributes: ['classDepartment', 'classNumber', 
      [Sequelize.fn('MIN', Sequelize.col('id')), 'id']],
      group: ['classDepartment', 'classNumber'],
      order: [
        ['classDepartment', 'ASC'],
        ['classNumber', 'ASC']
      ],
      raw: true
    });
    console.log("uniqueClasses");
    res.json(uniqueClasses);
  } catch (error) {
    console.error('Unable to get unique classes:', error);
    res.status(500).json({ error: 'Unable to get unique classes' });
  }
};

/* Update the Class given it's id. The body of the request needs to have each field
* that is expected to be updated.*/
export const updateClassById =  async (req:express.Request, res:express.Response) => {
  try {
    const id = req.params.id;
    const updateData: any = req.body;
    //log the data that is passed for the update, not the class that is to be edited
    console.log(updateData)
    const classToBeUpdated = await Class.findByPk(id)
    classToBeUpdated?.set(updateData)
    //need to assume that classToBeUpdated is not null, should never be a problem
    await classToBeUpdated!.save()
    res.json(classToBeUpdated)
  } catch (error) {
    console.error('Unable to update classes:', error);
    res.status(500).json({ error: 'Unable to update classes' });
  }
};
// Export of all methods as object 
module.exports = { addClass, getClasses, getClassById, deleteClassById, getUniqueClasses, updateClassById };
