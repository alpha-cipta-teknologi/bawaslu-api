'use strict';

import sequelize, { Op } from 'sequelize';
import Model from './report.complaint.model';
import Regency from '../../area/regencies.model';
import Province from '../../area/provinces.model';
import Resource from '../../app/resource/resource.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { title: { [Op.like]: `%${data?.keyword}%` } },
            { description: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          model: Province,
          as: 'province',
          required: false,
        },
        {
          model: Regency,
          as: 'regency',
          required: false,
        },
        {
          attributes: [
            'username',
            'full_name',
            'image_foto',
            [
              sequelize.literal(`(
                select name
                from area_provinces
                where area_provinces.id = author.area_province_id
              )`),
              'province',
            ],
            [
              sequelize.literal(`(
                select name
                from area_regencies
                where area_regencies.id = author.area_regencies_id
              )`),
              'regency',
            ],
          ],
          model: Resource,
          as: 'author',
          required: false,
          where: {
            status: { [Op.ne]: 9 },
          },
        },
      ],
    });
  }

  public detail(condition: any) {
    return Model.findOne({
      where: {
        ...condition,
        status: { [Op.ne]: 9 },
      },
      include: [
        {
          model: Province,
          as: 'province',
          required: false,
        },
        {
          model: Regency,
          as: 'regency',
          required: false,
        },
        {
          attributes: [
            'username',
            'full_name',
            'image_foto',
            [
              sequelize.literal(`(
                select name
                from area_provinces
                where area_provinces.id = author.area_province_id
              )`),
              'province',
            ],
            [
              sequelize.literal(`(
                select name
                from area_regencies
                where area_regencies.id = author.area_regencies_id
              )`),
              'regency',
            ],
          ],
          model: Resource,
          as: 'author',
          required: false,
          where: {
            status: { [Op.ne]: 9 },
          },
        },
      ],
    });
  }

  public create(data: any) {
    return Model.create(data?.payload);
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
