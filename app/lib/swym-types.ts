export interface FavoritesList {
  di: string;
  listcontents: any[];
  userinfo: Userinfo;
  lty: string;
  uid: string;
  cts: number;
  cnt: number;
  lname: string;
  cby: string;
  lid: string;
  pid: string;
  st: number;
  id: string;
  uts: number;
  _pkey: string;
  _t: number;
  itemcmnts: number;
  uby: string;
  lhash: string;
  cfor: string;
}

export interface Userinfo {
  fname: null;
  sw_mkt: null;
  uid: string;
  m: null;
  em: string;
  cts: number;
  lname: null;
  pid: string;
  uts: number;
  acc_mkt: null;
  ut: null;
  prefs: Prefs;
}

export interface Prefs {
  Mediums: Mediums;
}

export interface Mediums {
  email: Email;
}

export interface Email {
  signuptime: number;
  acceptmarketing: boolean;
  acceptsource: string;
}
