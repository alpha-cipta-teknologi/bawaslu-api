'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../config/database';
import Province from './provinces.model';

const Model = conn.sequelize.define(
  'area_regencies',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    area_province_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);
Model.belongsTo(Province, { as: 'province', targetKey: 'id', foreignKey: 'area_province_id' });

export default Model;