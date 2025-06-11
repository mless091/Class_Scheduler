import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequelize";

export class ImportPreferences extends Model {
  public id!: number;
  public semester_id!: number;
  public semester_name!: string;
}

ImportPreferences.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: false,
      primaryKey: true,
      defaultValue: 1
    },
    semester_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    semester_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'ImportPreferences',
    sequelize,
  },
);