import moment, { DATETIME_TO_API_FORMAT } from './moment';
import { GameStatus, TeamKind } from './enums';
import Team from './team';

type constructorArgs = {
  id: number;
  start: moment.Moment | string;
  location: string;
  status: GameStatus;
  rejectionNote?: string;
}

export default class Game {
  private o: constructorArgs;
  private homeTeam_?: Team;
  private awayTeam_?: Team;

  constructor(o: constructorArgs) {
    this.o = o;
  }

  set homeTeam(t: Team) {
    this.homeTeam_ = t;
  }

  set awayTeam(t: Team) {
    this.awayTeam_ = t;
  }

  get id() {
    return this.o.id;
  }

  get homeTeam() {
    return this.homeTeam_!;
  }

  get awayTeam() {
    return this.awayTeam_!;
  }

  get start() {
    return this.o.start;
  }

  get status() {
    return this.o.status;
  }

  get location() {
    return this.o.location;
  }

  get rejectionNote() {
    return this.o.rejectionNote || null;
  }

  get level() {
    return levelMap[this.homeTeam.teamKind];
  }

  get prettyStart() {
    return prettyStart(this.start);
  }

  isPending() {
    const s = this.status;
    return s === GameStatus.PENDING_ASSIGNOR || s === GameStatus.PENDING_AWAY_TEAM
      || s === GameStatus.PENDING_HOME_TEAM;
  }

  equals(g: Game) {
    return this.id === g.id;
  }

  toApi(): ApiSchema.Game {
    const ht = this.homeTeam;
    const at = this.awayTeam;
    
    return {
      id: this.id,
      homeTeam: {
        id: ht.id,
        name: ht.name,
        teamKind: ht.teamKind,
        isLhsaa: ht.isLhsaa,
        school: {
          id: ht.school.id,
          name: ht.school.name
        }
      },
      awayTeam: {
        id: at.id,
        name: at.name,
        teamKind: at.teamKind,
        isLhsaa: at.isLhsaa,
        school: {
          id: at.school.id,
          name: at.school.name
        }
      },
      start: startToApi(this.start),
      location: this.location,
      status: this.status
    }
  }
}

function startToApi(start: moment.Moment | string) {
  return moment(start).format(DATETIME_TO_API_FORMAT);
}

function prettyStart(start: moment.Moment | string) {
  return moment(start).format('MMM DD, hh:mm A');
}

const levelMap = {
  [TeamKind.VB]: 'Varsity Boys',
  [TeamKind.VG]: 'Varsity Girls',
  [TeamKind.JVB]: 'Junior Varsity Boys',
  [TeamKind.JVG]: 'Junior Varsity Girls'
};

export interface GameHistory {
  id: number,
  start: moment.Moment | string,
  location: string,
  status: GameStatus,
  gameId: number,    
  timestamp: moment.Moment | string, //timestamp of when the update was made     
  updateType: GameHistoryUpdateType,
  updater: { id: number, name: string },
  updaterType: GameHistoryUpdaterType
}