import { Request, Response } from 'express';
import Repository from '../repository';
import PrivilegeAccess from '../privilege_access';
import { Privileges as P,  Roles } from '../enums';
import School from '../school';

export default class SchoolController {
  private repository: Repository;
  private privilegeAccess: PrivilegeAccess;

  constructor(repository: Repository, privilegeAccess: PrivilegeAccess) {
    this.repository = repository;
    this.privilegeAccess = privilegeAccess;
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

  getSchoolsWithPrivilegesForUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const users = await this.repository.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      res.send({ok: false, reason: 'User not found'});
      return;
    }

    const rawPrivileges = req.params.privileges.split(';');
    
    //null if invalid
    //invalid if unrecognized privilege value or duplicate privilege values
    const privileges = rawPrivileges.reduce((privileges: P.SchoolPrivilege[] | null, rawPrivilege) => {
      if (privileges == null) return null;

      //bad value
      if (!isSchoolPrivilege(rawPrivilege)) return null;
      
      const privilege = rawPrivilege as P.SchoolPrivilege;

      //dup entry
      if (privileges.indexOf(privilege) >= 0) return null;

      privileges.push(privilege);
      return privileges;
    }, []);

    if (!privileges || !privileges.length) {
      return res.send({ok: false, reason: 'Bad privilege parameter'});
    }

    const schools = await this.privilegeAccess.getSchoolsWithPrivilege(user, privileges);
    res.send({ok: true, schools: schools.map(s => s.toApi())});
  }
}

function isSchoolPrivilege(s: string) {
  return s && (
    s === P.SchoolPrivilege.MANAGE_GAME ||
    s === P.SchoolPrivilege.MANAGE_SCHOOL_REP ||
    s === P.SchoolPrivilege.MANAGE_TEAM);
}