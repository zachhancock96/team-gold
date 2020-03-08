//TODO: possible circ ref
import User from './user';
import District from './district';
import Team from './team';

type constructorArgs = { id: number; name: string; }

export default class School {

  private o: constructorArgs;
  private schoolAdmin_: User | null = null;
  private district_: District | null = null;
  private teams_: Team[] = [];
  private schoolReps_: User[] = [];

  constructor(o: constructorArgs) {
    this.o = o;
  }

  set teams(t: Team[]) {
    //TODO: only once
    this.teams_ = t;
    t.forEach(t => t.school = this);
  }

  set district(dist: District | null) {
    //TODO: only once
    this.district_ = dist;
  }

  set schoolReps(sreps: User[]) {
    //TODO: only once
    this.schoolReps_ = sreps;
  }

  set schoolAdmin(sadmin: User | null) {
    //TODO: only once
    this.schoolAdmin_ = sadmin;
  }

  get name() {
    return this.o.name;
  }

  get id() {
    return this.o.id;
  }

  get teams() {
    return this.teams_;
  }

  get district() {
    return this.district_;
  }

  get schoolReps() {
    return this.schoolReps_;
  }

  get schoolAdmin() {
    return this.schoolAdmin_;
  }

  toString() {
    const admin = this.schoolAdmin_? this.schoolAdmin_.toString(): 'null';
    const teams = this.teams.map(t => t.toString());
    const reps = this.schoolReps_.map(rep => rep.toString());

    return `
    School: {
      name: ${this.name},
      admin:${admin},
      teams: ${teams},
      reps: ${reps}
    }`;
  }

  equals(s: School) {
    return s.id === this.id;
  }

  toApi(): ApiSchema.School {
    const sAdmin = this.schoolAdmin;
    const dist = this.district;
    const asor = dist? dist.assignor: null;

    return {
      id: this.id,
      name: this.name,
      schoolReps: this.schoolReps.map(s => ({
        id: s.id,
        name: s.name
      })),
      teams: this.teams.map(t => ({
        id: t.id,
        name: t.name,
        teamKind: t.teamKind
      })),
      schoolAdmin: sAdmin
        ? { id: sAdmin.id, name: sAdmin.name }
        : null,
      district: dist
        ? { id: dist.id, name: dist.name }
        : null,
      assignor: asor
        ? { id: asor.id, name: asor.name }
        : null
    };
  }
}