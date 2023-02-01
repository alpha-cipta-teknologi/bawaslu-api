'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Regency from '../../area/regencies.model';
import Province from '../../area/provinces.model';

const Model = conn.sequelize.define(
  'laporan_aduan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jenis_aduan: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT('long'),
    },
    hasil_cek_fakta: {
      type: DataTypes.TEXT('long'),
    },
    link_berita: {
      type: DataTypes.STRING,
    },
    area_province_id: {
      type: DataTypes.INTEGER,
    },
    area_regencies_id: {
      type: DataTypes.INTEGER,
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
Model.belongsTo(Province, {
  as: 'province',
  targetKey: 'id',
  foreignKey: 'area_province_id',
});
Model.belongsTo(Regency, {
  as: 'regency',
  targetKey: 'id',
  foreignKey: 'area_regencies_id',
});

export default Model;
