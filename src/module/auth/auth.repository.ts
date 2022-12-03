'use strict';

import Model from './auth.app.session.model';

export default class Respository {
  public detail(condition: any) {
    return Model.findOne({
      where: condition,
    });
  }

  public create(data: any) {
    return Model.create(data);
  }

  public update(data: any, condition: any) {
    return Model.update(data, {
      where: condition,
    });
  }
}
export const repository = new Respository();
