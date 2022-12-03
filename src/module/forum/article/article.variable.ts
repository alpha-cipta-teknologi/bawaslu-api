'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'category_name',
      'title',
      'description',
      'status',
    ];
    return field;
  }
}

export const variable = new Variable();