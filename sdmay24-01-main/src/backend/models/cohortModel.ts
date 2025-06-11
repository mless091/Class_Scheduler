import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequelize";

export class Cohort extends Model {
  public id!: number;
  public department!: string;
  public semesterNumber!: number;
  public classes!: { classDepartment: string; classNumber: number }[];
}

Cohort.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    program: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    semesterNumber: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    classes: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "cohorts",
    sequelize,
  }
);
