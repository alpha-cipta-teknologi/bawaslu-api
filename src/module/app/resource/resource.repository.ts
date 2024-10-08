'use strict';

import { Op } from 'sequelize';
import Model from './resource.model';
import Role from '../role/role.model';
import Regency from '../../area/regencies.model';
import Province from '../../area/provinces.model';
import Komunitas from '../../reff/komunitas/komunitas.model';

export default class Respository {
  public list(data: any) {
    return Model.findAll({
      where: data?.condition,
      order: [['resource_id', 'DESC']],
    });
  }

  public index(data: any, condition: any) {
    let query: Object = {
      where: {
        ...condition,
        status: { [Op.ne]: 'D' },
      },
      order: [['resource_id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...condition,
          status: { [Op.ne]: 'D' },
          [Op.or]: [
            { username: { [Op.like]: `%${data?.keyword}%` } },
            { full_name: { [Op.like]: `%${data?.keyword}%` } },
            { email: { [Op.like]: `%${data?.keyword}%` } },
            { place_of_birth: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      attributes: {
        exclude: ['password', 'confirm_hash'],
      },
      include: [
        {
          model: Role,
          attributes: ['role_id', 'role_name', 'status'],
          as: 'role',
          required: false,
        },
        {
          model: Province,
          attributes: ['id', 'name'],
          as: 'province',
          required: false,
        },
        {
          model: Regency,
          attributes: ['id', 'name', 'area_province_id'],
          as: 'regency',
          required: false,
        },
        {
          attributes: ['id', 'komunitas_name', 'type', 'icon_image'],
          model: Komunitas,
          as: 'komunitas',
          required: false,
        },
      ],
    });
  }

  public detail(condition: any) {
    return Model.findOne({
      where: {
        ...condition,
        status: { [Op.ne]: 'D' },
      },
      include: [
        {
          model: Role,
          attributes: ['role_id', 'role_name', 'status'],
          as: 'role',
          required: false,
        },
        {
          model: Province,
          attributes: ['id', 'name'],
          as: 'province',
          required: false,
        },
        {
          model: Regency,
          attributes: ['id', 'name', 'area_province_id'],
          as: 'regency',
          required: false,
        },
        {
          attributes: ['id', 'komunitas_name', 'type', 'icon_image'],
          model: Komunitas,
          as: 'komunitas',
          required: false,
        },
      ],
    });
  }

  public check(condition: any) {
    return Model.findOne({
      where: {
        ...condition,
        status: { [Op.ne]: 'D' },
      },
    });
  }

  public admin(condition: any) {
    return Model.findAll({
      where: {
        ...condition,
        status: { [Op.ne]: 'D' },
      },
      include: [
        {
          model: Role,
          attributes: ['role_id', 'role_name', 'status'],
          as: 'role',
          required: true,
          where: {
            [Op.or]: [
              { role_name: 'administrator' },
              { role_name: 'admin pusat' },
            ],
          },
        },
      ],
    });
  }

  public async create(data: any) {
    return Model.create(data?.payload);
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
