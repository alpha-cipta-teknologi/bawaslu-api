'use strict';

export default class Variable {
  public fillable() {
    const field: Array<string> = [
      'no_register',
      'nama_lembaga',
      'pic_name',
      'pic_phone',
      'pic_email',
      'perihal_audiensi',
      'waktu_audiensi',
      'konfirmasi_waktu_audiensi',
      'area_province_id',
      'area_regencies_id',
      'status',
    ];
    return field;
  }
}

export const variable = new Variable();
