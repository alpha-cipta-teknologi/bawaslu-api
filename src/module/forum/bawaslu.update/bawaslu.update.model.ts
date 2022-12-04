'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Like from '../like.comment/like.model';
import Comment from '../like.comment/comment.model';
import Resource from '../../app/resource/resource.model';

const Model = conn.sequelize.define(
  'forum_bawaslu_update',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    path_thumbnail: {
      type: DataTypes.STRING,
    },
    path_image: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
    },
    counter_view: {
      type: DataTypes.INTEGER,
    },
    counter_share: {
      type: DataTypes.INTEGER,
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
  as: 'author',
  targetKey: 'resource_id',
  foreignKey: 'created_by',
});
Model.hasMany(Like, { as: 'like', foreignKey: 'id_external' });
Model.hasMany(Comment, { as: 'comment', foreignKey: 'id_external' });

export default Model;
