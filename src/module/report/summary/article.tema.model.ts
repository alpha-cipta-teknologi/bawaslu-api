'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'v_summary_article_per_tema',
  {
    area_province_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    provinces: {
      type: DataTypes.STRING,
    },
    area_regencies_id: {
      type: DataTypes.INTEGER,
    },
    regencies: {
      type: DataTypes.STRING,
    },
    tema_id: {
      type: DataTypes.INTEGER,
    },
    tema_name: {
      type: DataTypes.STRING,
    },
    jumlah_article: {
      type: DataTypes.INTEGER,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);

export default Model;
