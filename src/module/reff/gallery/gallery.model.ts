'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Detail from './gallery.detail.model';

const Model = conn.sequelize.define(
  'gallery',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    folder_name: {
      type: DataTypes.STRING,
    },
    path_thumbnail: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
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
Model.hasMany(Detail, { as: 'detail', foreignKey: 'gallery_id' });

export default Model;
