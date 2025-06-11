import express from 'express';
import {
    Import
} from "../models/importModel";
import {
    ImportPreferences
} from "../models/importPreferences";
import {
    Class
} from "../models/classModel";

import {
    refreshCoursesAlgorithm
} from './refreshCoursesAlgorithm';

import axios from 'axios';


export const refreshCourses = async (req: express.Request, res: express.Response) => {
    try {
        // Extract the data from the request body. The data is expected to be an array of objects,
        // each with a classDepartment and classNumber property.
        const ImportData: {
            classDepartment: string,
            classNumber: string
        } [] = req.body;

        // Reduce the imported data into an object where each key is a classDepartment and each value is an array of classNumbers.
        // This groups the classes by their department.
        const departmentClasses = ImportData.reduce((acc: {
            [key: string]: string[]
        }, {
            classDepartment,
            classNumber
        }) => {
            // If the current department doesn't exist in the accumulator object yet, add it with an empty array as its value.
            if (!acc[classDepartment]) {
                acc[classDepartment] = [];
            }
            // Add the current classNumber to the array of the current department.
            acc[classDepartment].push(classNumber);
            return acc;
        }, {});

        // Convert the departmentClasses object into an array of objects, each with a department and classes property.
        // This is done to prepare the data for the refreshCoursesAlgorithm function.
        const formattedData = Object.entries(departmentClasses).map(([department, classes]) => ({
            department,
            classes,
        }));

        // Call the refreshCoursesAlgorithm function with the formatted data.
        // This function is expected to return an array of responses.
        const responses = await refreshCoursesAlgorithm(formattedData);
        console.log(JSON.stringify(responses, null, 2)); // print the result

        // Delete existing classes that match the classDepartment and classNumber
        for (const classData of responses) {
            await Class.destroy({
                where: {
                    classDepartment: classData.classDepartment,
                    classNumber: classData.classNumber
                }
            });
        }

        // Save each response to the database
        const savedClasses = await Promise.all(responses.map(async (classData) => {
            const newClass = await Class.create(classData);
            return newClass;
        }));

        res.status(200).json(savedClasses);

    } catch (error) {
        console.error('Unable to fetch data:', error);
        res.status(500).json({
            error: 'Unable to create class'
        });
    }
};

export const addImport = async (req: express.Request, res: express.Response) => {
    try {
        const ImportData: any = req.body;
        const newImport = await Import.create(ImportData);
        res.status(200).json(newImport);
    } catch (error) {
        console.error('Unable to create Import:', error);
        res.status(500).json({
            error: 'Unable to create Import'
        });
    }
};

export const getImports = async (req: express.Request, res: express.Response) => {
    try {
        const Imports = await Import.findAll();
        res.status(200).json(Imports);
    } catch (error) {
        console.error('Unable to get Imports:', error);
        res.status(500).json({
            error: 'Unable to get Imports'
        });
    }
};

export const getImportById = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        const ImportData = await Import.findByPk(id);
        res.status(200).json(ImportData);
    } catch (error) {
        console.error('Unable to get Import:', error);
        res.status(500).json({
            error: 'Unable to get Import'
        });
    }
};

export const deleteImportById = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        await Import.destroy({
            where: {
                id: id
            }
        });
        res.status(200).json({
            message: 'Import deleted'
        });
    } catch (error) {
        console.error('Unable to delete Import:', error);
        res.status(500).json({
            error: 'Unable to delete Import'
        });
    }
};

export const getImportPreferences = async (req: express.Request, res: express.Response) => {
    try {
        const [ImportData, created] = await ImportPreferences.findOrCreate({
            where: { id: 1 },
            //below prevents an error if the table doesn't initially exist. 
            defaults: {
                "semester_id": 1, "semester_name":""
            }
        });
        res.status(200).json(ImportData);
    } catch (error) {
        console.error('Unable to get or create Import:', error);
        res.status(500).json({
            error: 'Unable to get or create Import'
        });
    }
};
export const setImportPreferences = async (req: express.Request, res: express.Response) => {
    try {
        const [ImportData, created] = await ImportPreferences.findOrCreate({
            where: { id: 1 },
            defaults: {
                "semester_id": 1, "semester_name":""
            }
        });

        if (!created) {
            await ImportData.update({
                semester_id: req.body.semester_id,
                semester_name: req.body.semester_name
            });
        }

        console.log(req.body);
        console.log(ImportData);
        res.status(200).json(ImportData);
    } catch (error) {
        console.error('Unable to get or create Import:', error);
        res.status(500).json({
            error: 'Unable to get or create Import'
        });
    }
};
/* have to use these interfaces because of it being typescript. this is dictated by Iowa State's classes.iastate.edu API */
interface Department {
    id: string;
    title: string;
    abbreviation: string;
}

interface Semester {
    id: number;
    code: string;
    year: string;
    preliminary: string;
    current: string;
    lastChanged: string;
    semNum: string;
    semesterTitle: string;
    formattedStartDateTime: string;
}
//only returns the important info from classes.iastate.edu API regarding form defaults
export const getFormDefaults = async (req: express.Request, res: express.Response) => {
    try {
        const response = await axios.get('https://classes.iastate.edu/app/rest/formdefaults');
        const data = response.data;

        const departments = data.departments.map((dept: Department) => dept.abbreviation);
        const semesters = data.semesters.map((sem: Semester) => ({ id: sem.id, semesterTitle: sem.semesterTitle }));

        res.status(200).json({ departments, semesters });
    } catch (error) {
        console.error('Unable to get form defaults:', error);
        res.status(500).json({
            error: 'Unable to get form defaults'
        });
    }
};
// Export of all methods as object 
module.exports = {
    getImports,
    getImportById,
    addImport,
    deleteImportById,
    getImportPreferences,
    setImportPreferences,
    getFormDefaults,
    refreshCourses
};