import Repository from '../repository';
import User from '../user';
import {Request, Response} from 'express';

export default class UserController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.repository.getUsers();
    res.send({ok: true, users: users.map(u => u.toApi())});
  }

  getUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const users = await this.repository.getUsers();
    const user = users.find(u => u.id === userId);
    res.send({ok: true, user: user? user.toApi(): null});
  }

  getMe = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const users = await this.repository.getUsers();
    const user = users.find(u => u.id === userId);
    res.send({ok: true, user: user? user.toApi(): null});
  };  
}