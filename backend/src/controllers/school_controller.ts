import { Request, Response } from 'express';
import Repository from '../repository';
import { Roles, TeamKind } from '../enums';
import School from '../school';

const TEAM_KINDS: TeamKind[]  = [ TeamKind.VB, TeamKind.VG, TeamKind.JVB, TeamKind.JVG ];

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

  //adds non lhsaa schools and 4 teams
  addNonLhsaaSchool = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolName = (req.body.name || '') as string;
    if (!schoolName.length) {
      res.send({ok: false, reason: 'name paramter required in body'});
      return;
    }

    const schoolName_ = schoolName.toLowerCase();

    const schools = await repo.getSchools();
    const schoolExists = !!schools.find(s => s.name.toLowerCase() === schoolName_);

    if (schoolExists) {
      return res.send({ok: false, reason: 'School already exists'});
    }
    
    const schoolId = await repo.addSchool({
      name: schoolName, 
      isLhsaa: false, 
      schoolAdminId: null, 
      districtId: null
    });

    //TODO: do addManyTeam with bulk add operation instead 
    //for better atomicity guarantee
    const promises = TEAM_KINDS.map(teamKind => repo.addTeam({
      name: createTeamName(schoolName, teamKind),
      isLhsaa: false,
      teamKind,
      schoolId
    }));

    await Promise.all(promises);

    res.send({ok: true, schoolId });
  }
}

const createTeamName = (schoolName: string, teamKind: TeamKind) => {
  return schoolName + ' ' + teamKind.toUpperCase();
}