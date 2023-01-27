'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = ['jenis_laporan', 'hasil_cek_fakta', 'status'];
    return field;
  }
}

export const variable = new Variable();
