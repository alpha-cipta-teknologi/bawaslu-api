'use strict';

import { Op } from 'sequelize';
import Model from './gallery.model';
import Detail from './gallery.detail.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      group: 'gallery.id',
      order: [['id', 'ASC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    let where_detail: Object = {};
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          status: { [Op.ne]: 9 },
          [Op.or]: [{ folder_name: { [Op.like]: `%${data?.keyword}%` } }],
        },
      };
      where_detail = {
        description: { [Op.like]: `%${data?.keyword}%` },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          model: Detail,
          as: 'detail',
          required: false,
          where: where_detail,
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
    return Model.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
      transaction: data?.transaction,
    });
  }

  public bulkCreateDetail(data: any) {
    return Detail.bulkCreate(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public updateDetail(data: any) {
    return Detail.update(data?.payload, {
      where: data?.condition,
      transaction: data?.transaction,
    });
  }

  public deleteDetail(data: any) {
    return Detail.destroy({
      where: data?.condition,
      transaction: data?.transaction,
    });
  }
}

export const repository = new Respository();
