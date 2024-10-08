'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'header',
      'title',
      'link_url',
      'seq',
      'status',
      'sort_description',
      'description',
    ];
    return field;
  }
}

export const variable = new Variable();
