'use strict';

import { DataTypes } from 'sequelize';
import DocMou from '../document.mou.model';
import Attachment from '../attachment.model';
import conn from '../../../../config/database';
import HistoryStatus from '../history.status.model';
import Regency from '../../../area/regencies.model';
import Province from '../../../area/provinces.model';

const Model = conn.sequelize.define(
  'form_pengajuan_audiensi',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    no_register: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    nama_lembaga: {
      type: DataTypes.STRING,
    },
    pic_name: {
      type: DataTypes.STRING,
    },
    pic_phone: {
      type: DataTypes.STRING,
    },
    pic_email: {
      type: DataTypes.STRING,
      unique: true,
    },
    perihal_audiensi: {
      type: DataTypes.STRING,
    },
    waktu_audiensi: {
      type: DataTypes.STRING,
    },
    konfirmasi_waktu_audiensi: {
      type: DataTypes.DATE,
    },
    area_province_id: {
      type: DataTypes.INTEGER,
    },
    area_regencies_id: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    pengajuan_ke: {
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
Model.hasMany(HistoryStatus, {
  as: 'history_status',
  foreignKey: 'id_pengajuan_audiensi',
});
Model.hasMany(Attachment, {
  as: 'attachment',
  foreignKey: 'id_pengajuan_audiensi',
});
Model.hasOne(DocMou, {
  as: 'document_mou',
  foreignKey: 'id_pengajuan_audiensi',
});

export default Model;
