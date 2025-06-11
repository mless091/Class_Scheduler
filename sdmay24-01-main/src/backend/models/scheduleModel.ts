import { Model, DataTypes } from "sequelize";
import { sequelize } from "../sequelize";

export class Schedule extends Model {
  public id!: number;
  public title!: string;
  public dayTimeSequence!: string;
  public avoidClasses!: string; // JSON stringified version of ClassData[]
  public avoidCohorts!: string; // JSON stringified version of CohortData[]
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dayTimeSequence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avoidClasses: {
      type: DataTypes.TEXT,
      get: function() {
        return JSON.parse(this.getDataValue('avoidClasses'));
      },
      set: function(val) {
        this.setDataValue('avoidClasses', JSON.stringify(val));
      }
    },
    avoidCohorts: {
      type: DataTypes.TEXT,
      get: function() {
        return JSON.parse(this.getDataValue('avoidCohorts'));
      },
      set: function(val) {
        this.setDataValue('avoidCohorts', JSON.stringify(val));
      }
    },
    availabilityData: {
      type: DataTypes.TEXT,
      get: function() {
        return JSON.parse(this.getDataValue('availabilityData'));
      },
      set: function(val) {
        this.setDataValue('availabilityData', JSON.stringify(val));
      }
    },
  },
  {
    tableName: 'Schedule',
    sequelize,
  },
);