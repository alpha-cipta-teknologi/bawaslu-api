'use strict';

import { Op } from 'sequelize';
import Model from './article.model';
import Like from '../like_comment/like.model';
import Comment from '../like_comment/comment.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      where: {
        ...data?.condition,
        status: { [Op.ne]: 9 },
      },
      order: [['id', 'ASC']],
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
          model: Like,
          as: 'like',
          required: false,
          where: {
            group_like: 1,
          },
        },
        {
          model: Comment,
          as: 'comment',
          required: false,
          where: {
            group_comment: 1,
          },
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
          model: Like,
          as: 'like',
          required: false,
          where: {
            group_like: 1,
          },
        },
        {
          model: Comment,
          as: 'comment',
          required: false,
          where: {
            group_comment: 1,
          },
        },
      ],
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