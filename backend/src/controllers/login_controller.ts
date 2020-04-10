import User from '../user';
import Repository from '../repository';
import {Request, Response} from 'express';

//TODO: this is temporary
export default class LoginController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    const users = await this.repository.getUsers();
    
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.send({ok: false, reason: 'Email or Password did not match'});
    }

    //NOTE: sessionId same as user id LOL!
    return res.send({ok: true, sessionId: user.id});
  }
}