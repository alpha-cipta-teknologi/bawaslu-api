'use strict';

import Like from './like.model';

export default class Respository {
  public detailLike(condition: any) {
    return Like.findOne({
      where: condition,
    });
  }

  public create(data: any) {
    return Like.create(data?.payload, {
      transaction: data?.transaction,
    });
  }
  
  public delete(data: any) {    
    return Like.destroy({
      where: data?.condition,
      transaction: data?.transaction,
    });
  }
}

export const repository = new Respository();