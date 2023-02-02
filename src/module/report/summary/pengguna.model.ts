'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'v_summary_pengguna',
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
    anak_anak: {
      type: DataTypes.INTEGER,
    },
    muda: {
      type: DataTypes.INTEGER,
    },
    pekerja_awal: {
      type: DataTypes.INTEGER,
    },
    paruh_baya: {
      type: DataTypes.INTEGER,
    },
    pra_pensiun: {
      type: DataTypes.INTEGER,
    },
    pensiun: {
      type: DataTypes.INTEGER,
    },
    lansia: {
      type: DataTypes.INTEGER,
    },
    total_pengguna: {
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
