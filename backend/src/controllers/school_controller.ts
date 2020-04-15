import { Request, Response } from 'express';
import Repository from '../repository';
import { Roles } from '../enums';
import School from '../school';

export default class SchoolController {
  private repository: Repository;
  
  constructor(repository: Repository) {
    this.repository = repository;
  }

  getAllSchools = async (req: Request, res: Response) => {
    const schools = await this.repository.getSchools();
    res.send({ok: true, schools: schools.map(s => s.toApi())});
  }

  getSchool = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const schools = await this.repository.getSchools();
    const school = schools.find(s => s.id === id);
    res.send({ok: true, school: school? school.toApi(): null});
  }
}