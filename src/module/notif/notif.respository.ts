'use strict';

import Model from './notif.model';
import { Op } from 'sequelize';
import Resource from '../app/resource/resource.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      where: {
        ...data?.condition,
      },
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          text_message: { [Op.like]: `%${data?.keyword}%` },
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          attributes: ['username', 'full_name', 'image_foto'],
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

  public detail(data: any) {
    return Model.findOne({
      where: {
        ...data?.condition,
        status: { [Op.ne]: 9 },
      },
    });
  }

  public create(data: any) {
    return Model.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public bulkCreate(data: any) {
    return Model.bulkCreate(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
      transaction: data?.transaction,
    });
  }
}

export const repository = new Respository();
