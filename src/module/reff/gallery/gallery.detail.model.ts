'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'gallery_detail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gallery_id: {
      type: DataTypes.INTEGER,
    },
    path_image: {
      type: DataTypes.STRING,
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

export default Model;
