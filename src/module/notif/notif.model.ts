'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../config/database';
import Resource from '../app/resource/resource.model';

const Model = conn.sequelize.define(
  'notif_message_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    resource_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    text_message: {
      type: DataTypes.STRING,
    },
    target_url: {
      type: DataTypes.STRING,
    },
    type_message: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 2,
    },
    created_by: {
      type: DataTypes.INTEGER,
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
Model.belongsTo(Resource, {
  as: 'author',
  targetKey: 'resource_id',
  foreignKey: 'created_by',
});

export default Model;
