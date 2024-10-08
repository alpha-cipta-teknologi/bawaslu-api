'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Detail from './gallery.detail.model';
import Resource from '../../app/resource/resource.model';

const Model = conn.sequelize.define(
  'gallery',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    folder_name: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
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
Model.belongsTo(Resource, {
  as: 'author',
  targetKey: 'resource_id',
  foreignKey: 'created_by',
});

export default Model;
