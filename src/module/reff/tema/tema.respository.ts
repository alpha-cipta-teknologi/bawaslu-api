'use strict';

import { Op } from 'sequelize';
import Model from './tema.model';
import ModelTema from './tema.mapping.model';

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
          [Op.or]: [{ tema_name: { [Op.like]: `%${data?.keyword}%` } }],
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

  public TemaMap(data: any) {
    return ModelTema.findAll({
      where: data?.condition,
      include: [
        {
          attributes: ['id', 'tema_name', 'type', 'icon_image'],
          model: Model,
          as: 'tema',
          required: false,
        },
      ],
    });
  }

  public bulkCreateTemaMap(data: any) {
    return ModelTema.bulkCreate(data?.payload);
  }

  public deleteTemaMap(data: any) {
    return ModelTema.destroy({
      where: data?.condition,
    });
  }
}

export const repository = new Respository();
