'use strict';

import { Op } from 'sequelize';
import Model from './category.model';

export default class Respository {
  public list() {
    return Model.findAll({
      order: [['show_order', 'ASC']],
    });
  }

  public index(data: any) {
    let query: Object = {
      order: [['show_order', 'ASC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          [Op.or]: [
            { category_name: { [Op.like]: `%${data?.keyword}%` } },
            { description: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll(query);
  }

  public detail(condition: any) {
    return Model.findOne({
      where: condition,
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

  public delete(data: any) {
    return Model.destroy({
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
