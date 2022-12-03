'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'header',
      'title',
      'link_url',
      'seq',
      'status',
      'description',
    ];
    return field;
  }
}

export const variable = new Variable();
