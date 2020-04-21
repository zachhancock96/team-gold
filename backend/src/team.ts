import School from './school';
import User from './user';
import { TeamKind } from './enums';

type constructorArgs = { 
  id: number; 
  name: string; 
  teamKind: TeamKind;
  isLhsaa: boolean;
};

export default class Team {

  private o: constructorArgs;
  private school_?: School;
  private schoolReps_: User[] = [];

  constructor(o: constructorArgs) {
    this.o = o;
  }

  set school(s: School) {
    //TODO: only once
    this.school_ = s;
  }

  set schoolReps(s: User[]) {
    //TODO: only once
    this.schoolReps_ = s;
  }

  get id() {
    return this.o.id;
  }

  get name() {
    return this.o.name;
  }

  get schoolReps() {
    return this.schoolReps_;
  }

  get teamKind() {
    return this.o.teamKind;
  }

  get school() {
    return this.school_!;
  }

  get isLhsaa() {
    return this.o.isLhsaa;
  }

  toString() {
    const reps = this.schoolReps_;
    return `
    Team: 
    { 
      name: ${this.name},
      teamKind: ${this.teamKind},
      reps: ${reps.map(rep => rep.toString())}
    }`;
  }
  
  equals(t: Team) {
    return t.id === this.id;
  }

  toApi(): ApiSchema.Team {
    return {
      id: this.id,
      name: this.name,
      teamKind: this.teamKind,
      isLhsaa: this.isLhsaa,
      school: {
        id: this.school.id,
        name: this.school.name
      },
      schoolReps: this.schoolReps.map(sr => ({
        id: sr.id,
        name: sr.name
      }))
    };
  }
}