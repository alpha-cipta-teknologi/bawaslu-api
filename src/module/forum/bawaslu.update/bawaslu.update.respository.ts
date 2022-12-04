'use strict';

import sequelize, { Op } from 'sequelize';
import Model from './bawaslu.update.model';
import Comment from '../like.comment/comment.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      attributes: [
        'id',
        'category_name',
        'title',
        'description',
        'path_thumbnail',
        'path_image',
        'status',
        'counter_view',
        'counter_share',
        [
          sequelize.literal(
            '(select count(1) from forum_likes where forum_likes.id_external = forum_bawaslu_update.id and group_like = 2)'
          ),
          'counter_like',
        ],
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
      ],
      where: {
        ...data?.condition,
        status: { [Op.ne]: 9 },
      },
      group: 'forum_bawaslu_update.id',
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
          status: { [Op.ne]: 9 },
          [Op.or]: [
            { category_name: { [Op.like]: `%${data?.keyword}%` } },
            { title: { [Op.like]: `%${data?.keyword}%` } },
            { description: { [Op.like]: `%${data?.keyword}%` } },
          ],
        },
      };
    }
    return Model.findAndCountAll({
      ...query,
      include: [
        {
          model: Comment,
          as: 'comment',
          required: false,
          where: {
            group_comment: 2,
            status: { [Op.ne]: 9 },
          },
        },
      ],
    });
  }

  public detail(condition: any) {
    return Model.findOne({
      attributes: [
        'id',
        'category_name',
        'title',
        'description',
        'path_thumbnail',
        'path_image',
        'status',
        'counter_view',
        'counter_share',
        [
          sequelize.literal(
            '(select count(1) from forum_likes where forum_likes.id_external = forum_bawaslu_update.id and group_like = 2)'
          ),
          'counter_like',
        ],
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
      ],
      where: {
        ...condition,
        status: { [Op.ne]: 9 },
      },
      include: [
        {
          model: Comment,
          as: 'comment',
          required: false,
          where: {
            group_comment: 2,
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
