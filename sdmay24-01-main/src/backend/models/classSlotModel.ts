import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize";

// Define a ClassSlot model
export const ClassSlot = sequelize.define('ClassSlot', {
    // Model attributes are defined here
    id: { //need this in order for a database to function
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    meetingDays: {
        type: DataTypes.STRING,
        allowNull: false
    },
    meetingStartTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    meetingEndTime: {
        type: DataTypes.TIME,
        allowNull: false
    }
});

interface ClassSlotData {
    id?: number;
    meetingDays?: string;
    meetingStartTime?: number;
    meetingEndTime?: string;
}