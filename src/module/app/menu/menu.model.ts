'use strict';

import { DataTypes } from 'sequelize';
import conn from '../../../config/database';

const Model = conn.sequelize.define(
  'app_menu',
  {
    menu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_name: {
      type: DataTypes.STRING,
    },
    menu_icon: {
      type: DataTypes.STRING,
    },
    module_name: {
      type: DataTypes.STRING,
    },
    type_menu: {
      type: DataTypes.STRING(1),
    },
    seq_number: {
      type: DataTypes.TINYINT,
    },
    parent_id: {
      type: DataTypes.INTEGER,
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

export default Model;