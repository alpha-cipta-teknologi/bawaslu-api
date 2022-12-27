'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['tema_name', 'type', 'show_order'];
    return field;
  }
}

export const variable = new Variable();
