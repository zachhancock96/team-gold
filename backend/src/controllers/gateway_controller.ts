import User from '../user';
import Repository from '../repository';
import {Request, Response} from 'express';
import { UserStatus, Roles } from '../enums';

//TODO: this is temporary
export default class GatewayController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    const users = await this.repository.getUsers();
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.send({ok: false, reason: 'Email or Password did not match'});
    }

    const error = checkNonAcceptUser(user);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    if (user.password !== password) {
      return res.send({ok: false, reason: 'Email or Password did not match'});
    }

    //NOTE: sessionId same as user id LOL!
    return res.send({ok: true, sessionId: user.id});
  }

  signup = async (req: Request, res: Response) => {
    const repo = this.repository;
    const { name, email, password, schoolId, role } = req.body;

    const users = await repo.getUsers();
    const user = users.find(u => u.email === email);

    if (user) {
      const error = checkNonAcceptUser(user);
      if (error) {
        res.send({ok: false, reason: error});
        return;
      }
      res.send({ok: false, reason: 'Please login instead.'});
      return;
    }

    //TODO: continue here
    if (!password || typeof password !== 'string') {
      res.send({ok: false, reason: 'Pasword required.'});
      return;
    }

    if (!name || typeof name !== 'string') {
      res.send({ok: false, reason: 'Name required.'});
      return;
    }

    if (!schoolId || typeof schoolId !== 'number') {
      res.send({ok: false, reason: 'SchoolId required.'});
      return;
    }

    const school = await repo.getSchool(schoolId);
    if (!school || !school.isLhsaa) {
      res.send({ok: false, reason: 'School not found.'});
      return;
    }

    if (role !== Roles.SCHOOL_ADMIN && role !== Roles.SCHOOL_REP) {
      res.send({ok: false, reason: 'Can sign up as either school admin or school coach.'});
      return;
    }

    await repo.addUser({
      name, email,
      password, role,
      schoolId,
      status: UserStatus.PENDING
    });

    res.send({ok: true});
  }
}

const checkNonAcceptUser = (user: User) => {
  if (user.status === UserStatus.REJECTED) {
    return 'Your sign up request was rejected. Please, sign up with different email.';
  }

  if (user.status === UserStatus.REMOVED) {
    return 'Your account has been removed. Please, sign up with different email.';
  }

  if (user.status === UserStatus.PENDING) {
    return 'Your sign up request is under review. You will recieve an email, once the request gets approved.';
  }

  return null;
}