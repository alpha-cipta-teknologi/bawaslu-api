'use strict';

import { Op } from 'sequelize';
import Model from './report.article.model';
import Tema from '../../reff/tema/tema.model';
import Article from '../../forum/article/article.model';
import Resource from '../../app/resource/resource.model';
import Komunitas from '../../reff/komunitas/komunitas.model';

export default class Respository {
  public index(data: any) {
    let query: Object = {
      order: [['id', 'DESC']],
      offset: data?.offset,
      limit: data?.limit,
      where: data?.condition,
    };
    if (data?.keyword !== undefined && data?.keyword != null) {
      query = {
        ...query,
        where: {
          ...data?.condition,
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
            'status',
          ],
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
