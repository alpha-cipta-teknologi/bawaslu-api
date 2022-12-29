'use strict';

import Model from './article.model';
import sequelize, { Op } from 'sequelize';
import Like from '../like.comment/like.model';
import Resource from '../../app/resource/resource.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      attributes: [
        'id',
        'category_name',
        'title',
        'slug',
        'description',
        'path_thumbnail',
        'path_image',
        'status',
        'counter_view',
        'counter_share',
        [
          sequelize.literal(`(
            select count(1)
            from forum_likes
            where forum_likes.id_external = forum_article.id
            and forum_likes.group_like = 1
            )`),
          'counter_like',
        ],
        [
          sequelize.literal(`(
            select count(1)
            from forum_comment
            where forum_comment.id_external = forum_article.id
            and forum_comment.group_comment = 1
            and forum_comment.status = 1
            )`),
          'counter_comment',
        ],
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
      ],
      where: {
        ...data?.condition,
      },
      group: 'forum_article.id',
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
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
          attributes: ['username', 'full_name', 'image_foto'],
          model: Resource,
          as: 'author',
          required: false,
          where: {
            status: { [Op.ne]: 9 },
          },
        },
        {
          model: Like,
          as: 'like',
          required: false,
          where: {
            group_like: 1,
            created_by: data?.user_id,
          },
        },
      ],
    });
  }

  public trending(data: any) {
    let query: Object = {
      attributes: [
        'id',
        'category_name',
        'title',
        'slug',
        'description',
        'path_thumbnail',
        'path_image',
        'status',
        'counter_view',
        'counter_share',
        [
          sequelize.literal(`(
            select count(1)
            from forum_likes
            where forum_likes.id_external = forum_article.id
            and forum_likes.group_like = 1
            )`),
          'counter_like',
        ],
        [
          sequelize.literal(`(
            select count(1)
            from forum_comment
            where forum_comment.id_external = forum_article.id
            and forum_comment.group_comment = 1
            and forum_comment.status = 1
            )`),
          'counter_comment',
        ],
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
      ],
      where: {
        ...data?.condition,
      },
      group: 'forum_article.id',
      order: [
        ['counter_view', 'DESC'],
        ['id', 'DESC'],
      ],
      offset: data?.offset,
      limit: data?.limit,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
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
          attributes: ['username', 'full_name', 'image_foto'],
          model: Resource,
          as: 'author',
          required: false,
          where: {
            status: { [Op.ne]: 9 },
          },
        },
        {
          model: Like,
          as: 'like',
          required: false,
          where: {
            group_like: 1,
            created_by: data?.user_id,
          },
        },
      ],
    });
  }

  public detail(data: any) {
    return Model.findOne({
      attributes: [
        'id',
        'category_name',
        'title',
        'slug',
        'description',
        'path_thumbnail',
        'path_image',
        'status',
        'counter_view',
        'counter_share',
        [
          sequelize.literal(`(
            select count(1)
            from forum_likes
            where forum_likes.id_external = forum_article.id
            and forum_likes.group_like = 1
            )`),
          'counter_like',
        ],
        [
          sequelize.literal(`(
            select count(1)
            from forum_comment
            where forum_comment.id_external = forum_article.id
            and forum_comment.group_comment = 1
            and forum_comment.status = 1
            )`),
          'counter_comment',
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
        {
          model: Like,
          as: 'like',
          required: false,
          where: {
            group_like: 1,
            created_by: data?.user_id,
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
    return Model.create(data?.payload);
  }

  public update(data: any) {
    return Model.update(data?.payload, {
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
