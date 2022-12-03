'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Resource from '../../app/resource/resource.model';

const Model = conn.sequelize.define(
  'forum_comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_external: {
      type: DataTypes.INTEGER,
    },
    group_comment: {
      type: DataTypes.TINYINT,
    },
    comment: {
      type: DataTypes.TEXT,
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
Model.belongsTo(Resource, {
  as: 'resource',
  targetKey: 'resource_id',
  foreignKey: 'created_by',
});

export default Model;
