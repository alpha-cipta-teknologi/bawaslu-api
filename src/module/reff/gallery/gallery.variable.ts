'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['folder_name', 'description', 'status'];
    return field;
  }
}

export const variable = new Variable();
