'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'username',
      'email',
      'password',
      'full_name',
      'place_of_birth',
      'date_of_birth',
      'telepon',
      'status',
    ];
    return field;
  }
}
export const variable = new Variable();
