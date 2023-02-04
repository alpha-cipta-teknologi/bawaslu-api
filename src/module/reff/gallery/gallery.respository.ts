'use strict';

import Model from './gallery.model';
import sequelize, { Op } from 'sequelize';
import Detail from './gallery.detail.model';
import Resource from '../../app/resource/resource.model';

export default class Respository {
  public list(condition: any) {
    return Model.findAll({
      order: [['created_date', 'DESC']],
      where: {
        ...condition,
        status: { [Op.ne]: 9 },
      },
      include: [
        {
          model: Detail,
          as: 'detail',
          required: false,
          where: {
            status: { [Op.ne]: 9 },
          },
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

  public index(data: any) {
    let query: Object = {
      where: data?.condition,
      group: 'gallery.id',
      order: [['created_date', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          [Op.or]: [
            { folder_name: { [Op.like]: `%${data?.keyword}%` } },
            { description: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          model: Detail,
          as: 'detail',
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
          model: Detail,
          as: 'detail',
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

  public check(condition: any) {
    return Model.findOne({
      where: {
        ...condition,
        status: { [Op.ne]: 9 },
      },
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

  public bulkCreateDetail(data: any) {
    return Detail.bulkCreate(data?.payload);
  }

  public updateDetail(data: any) {
    return Detail.update(data?.payload, {
      where: data?.condition,
    });
  }

  public deleteDetail(data: any) {
    return Detail.destroy({
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
