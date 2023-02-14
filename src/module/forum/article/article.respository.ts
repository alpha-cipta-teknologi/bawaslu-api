'use strict';

import Model from './article.model';
import conn from '../../../config/database';
import Like from '../like.comment/like.model';
import Tema from '../../reff/tema/tema.model';
import sequelize, { Op, QueryTypes } from 'sequelize';
import Resource from '../../app/resource/resource.model';
import Komunitas from '../../reff/komunitas/komunitas.model';

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
        [
          sequelize.literal(`(
            select case 
              when exists (
                select 1 
                from forum_likes 
                where forum_likes.group_like = 1
                and forum_likes.id_external = forum_article.id
                and forum_likes.created_by = ${data?.user_id}
              ) then 1
              else 0
            end
            )`),
          'like',
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
          attributes: [
            'username',
            'full_name',
            'image_foto',
            [
              sequelize.literal(`(
                select name
                from area_provinces
                where area_provinces.id = author.area_province_id
              )`),
              'province',
            ],
            [
              sequelize.literal(`(
                select name
                from area_regencies
                where area_regencies.id = author.area_regencies_id
              )`),
              'regency',
            ],
          ],
          model: Resource,
          as: 'author',
          required: data?.conditionArea ? true : false,
          where: {
            status: { [Op.ne]: 9 },
            ...data?.conditionArea,
          },
        },
        {
          attributes: ['id', 'komunitas_name', 'type', 'icon_image'],
          model: Komunitas,
          as: 'komunitas',
          required: false,
        },
        {
          attributes: ['id', 'tema_name', 'type', 'icon_image'],
          model: Tema,
          as: 'tema',
          required: false,
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
          attributes: [
            'username',
            'full_name',
            'image_foto',
            [
              sequelize.literal(`(
                select name
                from area_provinces
                where area_provinces.id = author.area_province_id
              )`),
              'province',
            ],
            [
              sequelize.literal(`(
                select name
                from area_regencies
                where area_regencies.id = author.area_regencies_id
              )`),
              'regency',
            ],
          ],
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
        {
          attributes: ['id', 'komunitas_name', 'type', 'icon_image'],
          model: Komunitas,
          as: 'komunitas',
          required: false,
        },
        {
          attributes: ['id', 'tema_name', 'type', 'icon_image'],
          model: Tema,
          as: 'tema',
          required: false,
        },
      ],
    });
  }

  public async search(data: any) {
    let keyword = '';
    let komunitas = '';
    let tema = '';
    if (data?.keyword !== undefined && data?.keyword != null) {
      keyword = ` AND (
        fa.title LIKE :keyword1
        OR fa.description LIKE :keyword2
        OR t.tema_name LIKE :keyword3
      )`;
    }
    if (data?.komunitas_id !== undefined && data?.komunitas_id != null) {
      komunitas = ` AND fa.komunitas_id = :komunitas`;
    }
    if (data?.tema_id !== undefined && data?.tema_id != null) {
      tema = ` AND fa.tema_id = :tema`;
    }

    const result = await conn.sequelize.query(
      `
        SELECT
          fa.id,
          fa.category_name,
          fa.title,
          fa.slug,
          fa.description,
          fa.path_thumbnail,
          fa.path_image,
          fa.status,
          fa.counter_view,
          fa.counter_share,
          (
            SELECT COUNT(1)
            FROM forum_likes
            WHERE forum_likes.id_external = fa.id
            AND forum_likes.group_like = 1
          ) AS counter_like,
          (
            SELECT COUNT(1)
            FROM forum_comment
            WHERE forum_comment.id_external = fa.id
            AND forum_comment.group_comment = 1
            AND forum_comment.status = 1
          ) AS counter_comment,
          fa.created_by,
          fa.created_date,
          fa.modified_by,
          fa.modified_date,
          fa.komunitas_id,
          fa.tema_id,
          author.username AS username,
          author.full_name AS full_name,
          author.image_foto AS image_foto,
          k.komunitas_name AS k_komunitas_name,
          k.type AS k_type,
          k.icon_image AS k_icon_image,
          t.tema_name AS t_tema_name,
          t.type AS t_type,
          t.icon_image AS t_icon_image,
          (
            SELECT COUNT(1)
            FROM forum_likes AS fl
            WHERE fl.id_external = fa.id
            AND fl.group_like = 1
            AND fl.created_by = ${data?.user_id}
          ) AS user_like
        FROM forum_article AS fa 
        LEFT JOIN app_resource AS author ON author.resource_id = fa.created_by
        LEFT JOIN content_tema AS t ON fa.tema_id = t.id
        LEFT JOIN content_komunitas AS k ON fa.komunitas_id = k.id
        LEFT JOIN forum_likes AS l ON fa.id = l.id_external AND l.group_like = 1
        WHERE fa.status != 9 ${keyword} ${komunitas} ${tema}
        GROUP BY fa.id 
        ORDER BY fa.id DESC 
        LIMIT :offset, :limit
      `,
      {
        replacements: {
          keyword1: `%${data?.keyword}%`,
          keyword2: `%${data?.keyword}%`,
          keyword3: `%${data?.keyword}%`,
          offset: data?.offset,
          limit: data?.limit,
          komunitas: data?.komunitas_id,
          tema: data?.tema_id,
        },
        type: QueryTypes.SELECT,
      }
    );
    const count = await conn.sequelize.query(
      `
        SELECT COUNT(1) AS total
        FROM forum_article AS fa 
        LEFT JOIN app_resource AS author ON author.resource_id = fa.created_by
        LEFT JOIN content_tema AS t ON fa.tema_id = t.id
        LEFT JOIN content_komunitas AS k ON fa.komunitas_id = k.id
        WHERE fa.status != 9 ${keyword} ${komunitas} ${tema}
      `,
      {
        replacements: {
          keyword1: `%${data?.keyword}%`,
          keyword2: `%${data?.keyword}%`,
          keyword3: `%${data?.keyword}%`,
          komunitas: data?.komunitas_id,
          tema: data?.tema_id,
        },
        type: QueryTypes.SELECT,
      }
    );
    return { result, count };
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
          attributes: [
            'username',
            'full_name',
            'image_foto',
            'area_province_id',
            'area_regencies_id',
            [
              sequelize.literal(`(
                select name
                from area_provinces
                where area_provinces.id = author.area_province_id
              )`),
              'province',
            ],
            [
              sequelize.literal(`(
                select name
                from area_regencies
                where area_regencies.id = author.area_regencies_id
              )`),
              'regency',
            ],
          ],
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
        {
          attributes: ['id', 'komunitas_name', 'type', 'icon_image'],
          model: Komunitas,
          as: 'komunitas',
          required: false,
        },
        {
          attributes: ['id', 'tema_name', 'type', 'icon_image'],
          model: Tema,
          as: 'tema',
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
