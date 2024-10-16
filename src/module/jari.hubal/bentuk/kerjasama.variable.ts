'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['nama_kerjasama', 'keterangan', 'status'];
    return field;
  }
}

export const variable = new Variable();
