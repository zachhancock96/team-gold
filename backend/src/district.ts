import User from './user';
import School from './school';

type constructorArgs = { id: number; name: string; };

export default class District {
  private o: constructorArgs;

  private schools_: School[] = [];
  private assignor_: User | null = null;

  constructor(o: constructorArgs) {
    this.o = o;
  }

  set schools(schools_) {
    //TODO: only once
    this.schools_.forEach(s => s.district = this);
    this.schools_ = schools_;
  }

  set assignor(assignor: User | null) {
    //TODO: only once
    this.assignor_ = assignor;
  }

  get id() {
    return this.o.id;
  }

  get name() {
    return this.o.name;
  }

  get schools() {
    return this.schools_;
  }

  get assignor() {
    return this.assignor_;
  }

  toString() {
    const assignor = this.assignor_? this.assignor_.toString(): 'null';
    const schools = this.schools.map(s => s.toString());
    return `
    District: 
    { 
      name: ${this.name}, 
      schools: ${schools}, 
      assignor: ${assignor}
    }`;
  }

  equals(d: District) {
    return d.id === this.id;
  }
}