'use strict';

import { Op } from 'sequelize';
import Model from './content.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      order: [['seq', 'ASC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { header: { [Op.like]: `%${data?.keyword}%` } },
            { title: { [Op.like]: `%${data?.keyword}%` } },
            { description: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll(query);
  }

  public detail(condition: any) {
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
}

export const repository = new Respository();
