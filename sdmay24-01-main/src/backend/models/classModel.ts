import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequelize";
import { Time } from "../business/time";

// Define a Class model
export class Class extends Model implements ClassData {

  id!: number;
  classDepartment!: string;
  classNumber!: number;
  section!: string;
  classTimes!: Time[];
}

export interface ClassData {
  id: number;
  classDepartment: string;
  classNumber: number;
  section: string;
  classTimes: Time[];
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    classDepartment: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    classNumber: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    section: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    classTimes: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "classes",
    sequelize,
  }
);

