'use strict';

import { Op } from 'sequelize';
import Model from './gallery.model';
import Detail from './gallery.detail.model';

export default class Respository {
  public list(condition: any) {
    return Model.findAll({
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
      ],
    });
  }

  public index(data: any) {
    let query: Object = {
      where: data?.condition,
      group: 'gallery.id',
      order: [['id', 'ASC']],
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
