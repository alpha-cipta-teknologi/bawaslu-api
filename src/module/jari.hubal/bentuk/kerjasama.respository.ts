'use strict';

import { Op } from 'sequelize';
import Model from './kerjasama.model';

export default class Respository {
  public list() {
    return Model.findAll({
      where: {
        status: { [Op.ne]: 9 },
      },
      order: [['id', 'DESC']],
    });
  }

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
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { nama_kerjasama: { [Op.like]: `%${data?.keyword}%` } },
            { keterangan: { [Op.like]: `%${data?.keyword}%` } },
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
    return Model.create(data?.payload);
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
