'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Resource from '../../app/resource/resource.model';

const Model = conn.sequelize.define(
  'hasil_cek_fakta',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    judul: {
      type: DataTypes.TEXT,
    },
    link_berita: {
      type: DataTypes.STRING,
    },
    path_image: {
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
Model.belongsTo(Resource, {
  as: 'author',
  targetKey: 'resource_id',
  foreignKey: 'created_by',
});

export default Model;
