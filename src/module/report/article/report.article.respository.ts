'use strict';

import { Op } from 'sequelize';
import Model from './report.article.model';
import Article from '../../forum/article/article.model';

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
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { jenis_laporan: { [Op.like]: `%${data?.keyword}%` } },
            { hasil_cek_fakta: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          model: Article,
          as: 'article',
          required: false,
          attributes: [
            'id',
            'category_name',
            'title',
            'slug',
            'description',
            'path_thumbnail',
            'path_image',
          ],
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
          model: Article,
          as: 'article',
          required: false,
          attributes: [
            'id',
            'category_name',
            'title',
            'slug',
            'description',
            'path_thumbnail',
            'path_image',
          ],
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
