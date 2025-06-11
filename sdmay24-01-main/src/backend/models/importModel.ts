import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequelize";

export class Import extends Model {
  public id!: number;
  public classes!: { classDepartment: string; classNumber: number }[];
}

Import.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    class: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: 'Import',
    sequelize,
  },
);