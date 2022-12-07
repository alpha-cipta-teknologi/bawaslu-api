'use strict';

import { Op } from 'sequelize';
import Like from './like.model';
import { Request } from 'express';
import Comment from './comment.model';
import Article from '../article/article.model';
import Resource from '../../app/resource/resource.model';
import BawasluUpdate from '../bawaslu.update/bawaslu.update.model';

export default class Respository {
  public async checkIdExternal(req: Request) {
    const { id, group } = req?.body;
    let result: boolean = false;
    const condition: Object = {
      where: {
        id: id,
        status: { [Op.ne]: 9 },
      },
    };
    if (group == 1) {
      const article = await Article.findOne(condition);
      if (article) return true;
    } else if (group == 2) {
      const bawasluUpdate = await BawasluUpdate.findOne(condition);
      if (bawasluUpdate) return true;
    } else if (group == 3) {
      const comment = await Comment.findOne(condition);
      if (comment) return true;
    }
    return result;
  }

  public async checkData(req: Request) {
    const { id, group } = req?.body;
    let result: any = {};
    const condition: Object = {
      where: {
        id: id,
        status: { [Op.ne]: 9 },
      },
    };
    if (group == 1) {
      result = await Article.findOne(condition);
    } else if (group == 2) {
      result = await BawasluUpdate.findOne(condition);
    }
    return result;
  }

  public index(data: any) {
    let query: Object = {
      attributes: [
        'id',
        'id_external',
        'group_comment',
        'comment',
        'created_by',
        'created_date',
      ],
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
          [Op.or]: [{ comment: { [Op.like]: `%${data?.keyword}%` } }],
        },
      };
    }
    return Comment.findAndCountAll({
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
      ],
    });
  }

  public comments(condition: any) {
    return Comment.findAll({
      attributes: [
        'id',
        'id_external',
        'group_comment',
        'comment',
        'created_by',
        'created_date',
      ],
      where: condition,
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
      ],
    });
  }

  public detailComment(condition: any) {
    return Comment.findOne({
      attributes: [
        'id',
        'id_external',
        'group_comment',
        'comment',
        'created_by',
        'created_date',
      ],
      where: condition,
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
      ],
    });
  }

  public createComment(data: any) {
    return Comment.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public updateComment(data: any) {
    return Comment.update(data?.payload, {
      where: data?.condition,
      transaction: data?.transaction,
    });
  }

  public detailLike(condition: any) {
    return Like.findOne({
      where: condition,
    });
  }

  public createLike(data: any) {
    return Like.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public deleteLike(data: any) {
    return Like.destroy({
      where: data?.condition,
      transaction: data?.transaction,
    });
  }

  public updateViewShare(data: any) {
    if (data?.group == 1) {
      return Article.update(data?.payload, {
        where: data?.condition,
        transaction: data?.transaction,
      });
    } else if (data?.group == 2) {
      return BawasluUpdate.update(data?.payload, {
        where: data?.condition,
        transaction: data?.transaction,
      });
    }
  }
}

export const repository = new Respository();
