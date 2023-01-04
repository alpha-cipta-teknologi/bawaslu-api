'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../config/database';

const Model = conn.sequelize.define(
  'sso_logs',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
    },
    request: {
      type: DataTypes.TEXT,
    },
    response: {
      type: DataTypes.TEXT,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);

export default Model;
