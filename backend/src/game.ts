import moment, { DATETIME_TO_API_FORMAT } from './moment';
import { GameStatus } from './enums';
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
        school: {
          id: ht.school.id,
          name: ht.school.name
        }
      },
      awayTeam: {
        id: at.id,
        name: at.name,
        teamKind: at.teamKind,
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