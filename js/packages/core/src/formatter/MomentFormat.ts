import moment, {Moment} from "moment";
import {Nullable} from "@/other";

export class MomentFormat {
  static readonly DATE = new MomentFormat('DD.MM.YYYY');
  static readonly TIME = new MomentFormat('HH:mm:ss');
  static readonly DATETIME = new MomentFormat('DD.MM.YYYY HH:mm:ss');
  static readonly DATE_PICKER_FORMATS = ['DD.MM.YYYY', 'DDMMYYYY', 'DDMMYY'];

  public readonly f: string;

  private constructor(f: string) {
    this.f = f;
    this.fromUtc = this.fromUtc.bind(this);
    this.fromLocal = this.fromLocal.bind(this);
  }

  public fromLocal(date: Nullable<string | Moment>): Nullable<string> {
    if (!date) {
      return null;
    }
    return moment(date).format(this.f);
  }

  public fromUtc(date: Nullable<string | Moment>): Nullable<string> {
    if (!date) {
      return null;
    }
    return moment.utc(date).local().format(this.f);
  }
}
