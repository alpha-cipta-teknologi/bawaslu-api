'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import RoleMenu from '../role.menu/role.menu.model';

const Model = conn.sequelize.define(
  'app_role',
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.TINYINT,
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
Model.hasMany(RoleMenu, { as: 'menu', foreignKey: 'role_id' });

export default Model;
