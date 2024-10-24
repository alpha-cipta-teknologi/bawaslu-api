'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../config/database';

const Model = conn.sequelize.define(
  'app_otp',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    code: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    expired: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modified_date: {
      type: DataTypes.DATE,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);

export default Model;
