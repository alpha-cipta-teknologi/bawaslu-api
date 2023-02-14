'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Article from '../../forum/article/article.model';

const Model = conn.sequelize.define(
  'laporan_article',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
    },
    jenis_laporan: {
      type: DataTypes.STRING,
    },
    hasil_cek_fakta: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    area_province_id: {
      type: DataTypes.INTEGER,
    },
    area_regencies_id: {
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
Model.belongsTo(Article, {
  as: 'article',
  targetKey: 'id',
  foreignKey: 'article_id',
});

export default Model;
