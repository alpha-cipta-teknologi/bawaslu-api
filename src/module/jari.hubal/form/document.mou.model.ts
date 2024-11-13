'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'form_document_mou',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pengajuan_kerjasama: {
      type: DataTypes.INTEGER,
    },
    id_pengajuan_audiensi: {
      type: DataTypes.INTEGER,
    },
    path_url: {
      type: DataTypes.STRING,
    },
    masa_berlaku: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    keterangan: {
      type: DataTypes.STRING,
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
