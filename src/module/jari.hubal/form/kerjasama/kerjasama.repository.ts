'use strict';

import { Op } from 'sequelize';
import Model from './kerjasama.model';
import Attachment from '../attachment.model';
import Regency from '../../../area/regencies.model';
import Province from '../../../area/provinces.model';

export default class Respository {
  public index(data: any, condition: any) {
    let query: Object = {
      where: {
        ...condition,
        status: { [Op.ne]: 9 },
      },
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...condition,
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { no_register: { [Op.like]: `%${data?.keyword}%` } },
            { nama_lembaga: { [Op.like]: `%${data?.keyword}%` } },
            { pic_name: { [Op.like]: `%${data?.keyword}%` } },
            { pic_email: { [Op.like]: `%${data?.keyword}%` } },
            { nama_kerjasama: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
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

  public async create(data: any) {
    return Model.create(data?.payload);
  }

  public bulkCreateAttach(data: any) {
    return Attachment.bulkCreate(data?.payload);
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
    });
  }

  public deleteAttachment(data: any) {
    return Attachment.destroy({
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
