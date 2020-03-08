import { Roles } from './enums';

type constructorArgs = { id: number, name: string, email: string, password: string | null, role: Roles };

export default class User {
  private o: constructorArgs;

  constructor(o: constructorArgs) {
    this.o = o;
  }

  get id() {
    return this.o.id;
  }

  get name() {
    return this.o.name;
  }

  get email() {
    return this.o.email;
  }

  get password() {
    return this.o.password;
  }

  get role() {
    return this.o.role;
  }

  toString() {
    return `
    User: 
    {
      name: ${this.name},
      email: ${this.email}
    }`;
  }

  equals(u: User) {
    return u.id === this.id;
  }

  toApi(): ApiSchema.User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role
    };
  }
}