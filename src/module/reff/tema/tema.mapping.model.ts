'use strict';

import Tema from './tema.model';
import { DataTypes } from 'sequelize';
import conn from '../../../config/database';
import Resource from '../../app/resource/resource.model';

const Model = conn.sequelize.define(
  'mapping_resource_tema',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    resource_id: {
      type: DataTypes.INTEGER,
    },
    tema_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);
Model.belongsTo(Resource, { as: 'resource', foreignKey: 'resource_id' });
Model.belongsTo(Tema, { as: 'tema', targetKey: 'id', foreignKey: 'tema_id' });

export default Model;
