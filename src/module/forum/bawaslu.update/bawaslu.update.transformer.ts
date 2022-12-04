'use strict';

import { repository } from '../like.comment/like.comment.repository';

export default class Transformer {
  public async list(data: any) {
    let result: Array<object> = [];
    for (let i in data) {
      const comments = data[i]?.comment;
      let dataComment: Array<Object> = [];
      for (let x in comments) {
        const cmt: any = await repository.comments({
          id_external: comments[x]?.id,
          group_comment: 3,
        });
        dataComment.push({
          ...comments[x]?.dataValues,
          reply_comment: cmt,
        });
      }
      result.push({
        ...data[i]?.dataValues,
        comment: dataComment,
      });
    }
    return result;
  }

  public async detail(data: any) {
    let result = data?.dataValues;
    const comments = result?.comment;
    let dataComment: Array<Object> = [];
    for (let x in comments) {
      const cmt: any = await repository.comments({
        id_external: comments[x]?.id,
        group_comment: 3,
      });
      dataComment.push({
        ...comments[x]?.dataValues,
        reply_comment: cmt,
      });
    }
    return {
      ...result,
      comment: dataComment,
    };
  }
}

export const transformer = new Transformer();
