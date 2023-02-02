'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['judul', 'link_berita', 'status'];
    return field;
  }
}

export const variable = new Variable();
