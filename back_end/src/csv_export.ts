import moment, { DATETIME_TO_API_FORMAT } from './moment';

export const CSV_EXPORT_SAVE_DIR = (() => {
  const x = process.env.CSV_EXPORT_SAVE_DIR || '/';
  if (x == '/') {
    console.warn(`CSV_EXPORT_SAVE_DIR env variable is not provided.`);
  } else {
    console.log(`Saving csv exports at ${x}`);
  }
  return x;
})();

type constructorArgs = {
  id: number;
  timestamp: moment.Moment | string;
  filename: string;
  gameCount: number;
  note: string | null;
  creatorId: number;
}

export default class CsvExport {
  private _id: number;
  private _timestamp: moment.Moment;
  private _filename: string;
  private _gameCount: number;
  private _note: string | null;
  private _creatorId: number;

  constructor(o: constructorArgs) {
    this._id = o.id;
    this._timestamp = moment(o.timestamp);
    this._filename = o.filename;
    this._gameCount = o.gameCount;
    this._note = o.note;
    this._creatorId = o.creatorId;
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

  toApi(): ApiSchema.CsvExport {
    return {
      id: this._id,
      timestamp: dateTimeToApi(this._timestamp)!,
      downloadUrl: toDownloadUrl(this._filename),
      filename: this._filename,
      gameCount: this._gameCount,
      note: this._note
    };
  }

}

function dateTimeToApi(start: moment.Moment | string | null) {
  return start? moment(start).format(DATETIME_TO_API_FORMAT): null;
}

const toDownloadUrl = (() => {
  const prefix = CSV_EXPORT_SAVE_DIR;
  
  return filename => prefix.endsWith('/')
      ? `${prefix}${filename}`
      : `${prefix}/${filename}`;
})();