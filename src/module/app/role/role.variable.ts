'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['role_name', 'status'];
    return field;
  }
}

export const variable = new Variable();