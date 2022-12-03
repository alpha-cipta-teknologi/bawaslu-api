'use strict';

import { DataTypes } from 'sequelize';
import Role from '../role/role.model';
import conn from '../../../config/database';
import Regency from '../../area/regencies.model';
import Province from '../../area/provinces.model';

const Model = conn.sequelize.define(
  'app_resource',
  {
    resource_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    place_of_birth: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    telepon: {
      type: DataTypes.STRING(100),
    },
    image_foto: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING(5),
      defaultValue: 'NV',
    },
    total_login: {
      type: DataTypes.INTEGER,
    },
    area_province_id: {
      type: DataTypes.INTEGER,
    },
    area_regencies_id: {
      type: DataTypes.INTEGER,
    },
    confirm_hash: {
      type: DataTypes.STRING,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modified_by: {
      type: DataTypes.STRING,
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
Model.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
Model.belongsTo(Province, { as: 'province', targetKey: 'id', foreignKey: 'area_province_id' });
Model.belongsTo(Regency, { as: 'regency', targetKey: 'id', foreignKey: 'area_regencies_id' });

export default Model;