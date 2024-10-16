'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'no_register',
      'nama_lembaga',
      'pic_name',
      'pic_phone',
      'pic_email',
      'id_bentuk_kerjasama',
      'nama_kerjasama',
      'area_province_id',
      'area_regencies_id',
      'status',
    ];
    return field;
  }
}

export const variable = new Variable();
