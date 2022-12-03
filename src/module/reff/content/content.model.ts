'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'content_beranda',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    header: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.TEXT,
    },
    seq: {
      type: DataTypes.TINYINT,
      default: 1,
    },
    path_thumbnail: {
      type: DataTypes.STRING,
    },
    path_image: {
      type: DataTypes.STRING,
    },
    path_video: {
      type: DataTypes.STRING,
    },
    link_url: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
    },
    description: {
      type: DataTypes.TEXT,
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