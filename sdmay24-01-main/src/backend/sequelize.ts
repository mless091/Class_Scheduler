import { Sequelize } from "sequelize";

// Provide a file path in the connection string

export const sequelize = new Sequelize("sqlite:./database.sqlite");
