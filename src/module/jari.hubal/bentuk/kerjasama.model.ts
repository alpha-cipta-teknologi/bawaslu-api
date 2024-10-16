'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'bentuk_kerjasama',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kerjasama: {
      type: DataTypes.STRING,
    },
    keterangan: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modified_by: {
      type: DataTypes.INTEGER,
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
