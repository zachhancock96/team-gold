import moment, { DATETIME_TO_API_FORMAT } from './moment';

export const ARBITER_EXPORT_SAVE_DIR = (() => {
  const x = process.env.ARBITER_EXPORT_SAVE_DIR || '/';
  if (x == '/') {
    console.warn(`ARBITER_EXPORT_SAVE_DIR env variable is not provided.`);
  } else {
    console.log(`Saving arbiter exports at ${x}`);
  }
  return x;
})();

type constructorArgs = {
  id: number;
  timestamp: moment.Moment | string;
  filename: string;
  gameCount: number;
  schoolIdsFilter: string | null;
  startFilter: moment.Moment | string | null;
  endFilter: moment.Moment | string | null;
  note: string | null;
  creatorId: number;
}

export default class ArbiterExport {
  private _id: number;
  private _timestamp: moment.Moment;
  private _filename: string;
  private _gameCount: number;
  private _hasSchoolIdsFilter: boolean;
  private _hasStartEndFilter: boolean;
  private _schoolIdsFilter: number[] | null;
  private _startFilter: moment.Moment | null;
  private _endFilter: moment.Moment | null;
  private _note: string | null;
  private _creatorId: number;

  constructor(o: constructorArgs) {
    this._id = o.id;
    this._timestamp = moment(o.timestamp);
    this._filename = o.filename;
    this._gameCount = o.gameCount;
    this._note = o.note;
    this._creatorId = o.creatorId;

    this._schoolIdsFilter = (o.schoolIdsFilter && o.schoolIdsFilter.length > 0)
      ? o.schoolIdsFilter.split(',').map(s => parseInt(s))
      : null;
    this._hasSchoolIdsFilter = !!this._schoolIdsFilter;

    this._hasStartEndFilter = !!(o.startFilter && o.endFilter);
    this._startFilter = this._hasStartEndFilter
      ? moment(o.startFilter!)
      : null;
    this._endFilter = this._hasStartEndFilter
      ? moment(o.endFilter!)
      : null;    
  }

  get id() {
    return this._id;
  }

  get timestamp() {
    return this._timestamp;
  }

  get filename() {
    return this._filename;
  }

  get gameCount() {
    return this._gameCount;
  }

  get creatorId() {
    return this._creatorId;
  }

  toApi(): ApiSchema.ArbiterExport {
    return {
      id: this._id,
      timestamp: dateTimeToApi(this._timestamp)!,
      downloadUrl: toDownloadUrl(this._filename),
      filename: this._filename,
      gameCount: this._gameCount,
      hasSchoolIdsFilter: this._hasSchoolIdsFilter,
      hasStartEndFilter: this._hasStartEndFilter,
      schoolIdsFilter: this._schoolIdsFilter,
      startFilter: dateTimeToApi(this._startFilter),
      endFilter: dateTimeToApi(this._endFilter),
      note: this._note
    };
  }

}

function dateTimeToApi(start: moment.Moment | string | null) {
  return start? moment(start).format(DATETIME_TO_API_FORMAT): null;
}

const toDownloadUrl = (() => {
  const prefix = ARBITER_EXPORT_SAVE_DIR;
  
  return filename => prefix.endsWith('/')
      ? `${prefix}${filename}`
      : `${prefix}/${filename}`;
})();