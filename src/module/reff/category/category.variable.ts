'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'category_name',
      'type',
      'show_order',
      'description',
    ];
    return field;
  }
}

export const variable = new Variable();
