import express from 'express';
import { Schedule } from "../models/scheduleModel";

export const addSchedule = async (req: express.Request, res: express.Response) => { //creates if it doesn't exist, otherwise updatebased on id
    try {
        const scheduleData = req.body;
        const [schedule, created] = await Schedule.upsert(scheduleData, {
            returning: true
        });
        if (created) {
            res.status(201).json(schedule);
        } else {
            res.status(200).json(schedule);
        }
    } catch (error) {
        console.error('Unable to add or update schedule:', error);
        res.status(500).json({
            error: 'Unable to add or update schedule'
        });
    }
};

export const getAllSchedules = async (req: express.Request, res: express.Response) => {
    try {
        const schedules = await Schedule.findAll();
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Unable to get schedules:', error);
        res.status(500).json({
            error: 'Unable to get schedules'
        });
    }
};

export const deleteScheduleById = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        await Schedule.destroy({
            where: {
                id: id
            }
        });
        res.status(200).json({
            message: 'Schedule deleted'
        });
    } catch (error) {
        console.error('Unable to delete schedule:', error);
        res.status(500).json({
            error: 'Unable to delete schedule'
        });
    }
};

export const updateScheduleById = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        const scheduleData = req.body;
        const schedule = await Schedule.update(scheduleData, {
            where: {
                id: id
            }
        });
        res.status(200).json(schedule);
    } catch (error) {
        console.error('Unable to update schedule:', error);
        res.status(500).json({
            error: 'Unable to update schedule'
        });
    }
};
module.exports = {
    addSchedule,
    getAllSchedules,
    deleteScheduleById,
    updateScheduleById
};