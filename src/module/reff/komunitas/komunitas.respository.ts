'use strict';

import sequelize, { Op } from 'sequelize';
import Model from './komunitas.model';

export default class Respository {
  public list() {
    return Model.findAll({
      attributes: [
        'id',
        'komunitas_name',
        'type',
        'icon_image',
        'show_order',
        [
          sequelize.literal(`(
            select count(1)
            from forum_article
            where forum_article.komunitas_id = content_komunitas.id
            and forum_article.status <> 9
            )`),
          'counter_thread',
        ],
        [
          sequelize.literal(`(
            select count(1)
            from app_resource
            where app_resource.komunitas_id = content_komunitas.id
            and app_resource.status = 'A'
            )`),
          'counter_resource',
        ],
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
      ],
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
          [Op.or]: [{ komunitas_name: { [Op.like]: `%${data?.keyword}%` } }],
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
