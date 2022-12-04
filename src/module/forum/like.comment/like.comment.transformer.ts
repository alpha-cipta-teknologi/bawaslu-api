'use strict';

import { repository } from './like.comment.repository';

const nestedChildren = async (data: any) => {
  let result: Array<Object> = [];
  const comments: any = await repository.comments({
    id_external: data?.dataValues?.id,
    group_comment: 3,
  });
  
  if (comments?.length > 0) {
    for (let i in comments) {
      const reply: Array<Object> = await nestedChildren(comments[i]);
      result.push({
        ...comments[i]?.dataValues,
        counter_comment: reply?.length,
        reply_comment: reply,
      });
    }
  }
  return result;
};

export default class Transformer {
  public async list(data: any) {
    let result: Array<object> = [];
    for (let i in data) {
      const reply: Array<Object> = await nestedChildren(data[i]);
      result.push({
        ...data[i]?.dataValues,
        counter_comment: reply?.length,
        reply_comment: reply,
      });
    }
    return result;
  }

  public async detail(data: any) {
    let result = data?.dataValues;
    const reply: Array<Object> = await nestedChildren(data);
    return {
      ...result,
      counter_comment: reply?.length,
      reply_comment: reply,
    };
  }
}

export const transformer = new Transformer();