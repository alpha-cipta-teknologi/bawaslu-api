'use strict';

import Province from './provinces.model';
import Regency from './regencies.model';

export default class Respository {
  public province() {
    return Province.findAll();
  }

  public regency(condition: any) {
    return Regency.findAll({
      where: condition,
    });
  }
}

export const repository = new Respository();