'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'v_pengguna_per_propinsi',
  {
    area_province_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    provinces: {
      type: DataTypes.STRING,
    },
    total_pengguna: {
      type: DataTypes.INTEGER,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);

export default Model;