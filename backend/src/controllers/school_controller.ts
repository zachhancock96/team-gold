import { Request, Response } from 'express';
import Repository from '../repository';
import { Roles, TeamKind, UserStatus } from '../enums';
import School from '../school';
import User from '../user';

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

  acceptSchoolRep = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const repId = parseInt(req.params.userId);
    const rep = await repo.getUser(repId);

    if (!school || !rep) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkAcceptRep(req.user!, school, rep);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(repId, UserStatus.ACCEPTED);
    console.log('user status updated');

    const teamIds = school.teams.map(t => t.id);

    //once accepted, has permission over all the teams of the school
    await repo.updateSchoolRepTeamAssociations(repId, teamIds);
    console.log('team associations added');
    
    res.send({ok: true});
  }
  
  rejectSchoolRep = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const repId = parseInt(req.params.userId);
    const rep = await repo.getUser(repId);

    if (!school || !rep) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkRejectRep(req.user!, school, rep);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(repId, UserStatus.REJECTED);

    res.send({ok: true});
  }
  
  removeSchoolRep = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const repId = parseInt(req.params.userId);
    const rep = await repo.getUser(repId);

    if (!school || !rep) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkRemoveRep(req.user!, school, rep);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(repId, UserStatus.REMOVED);
    console.log('user status updated');

    //remove all association with team
    await repo.updateSchoolRepTeamAssociations(repId, []);
    console.log('team associations removed');
    
    res.send({ok: true});
  }

  //school admins that are either pending or accepted
  //accepted first and pending follows
  getSchoolAdmins = async (req: Request, res: Response) => {
    const schoolId = parseInt(req.params.schoolId);

    const school = await this.repository.getSchool(schoolId);
    if (!school) {
      res.send({ok: false, reason: 'School not found.'});
      return;
    }

    let users = await this.repository.getUsers();

    users = users
      .filter(u => u.schoolId === schoolId && u.role === Roles.SCHOOL_ADMIN)
      .reduce((acc: User[], user) => {
        //puts accepted school admin at head of list
        //and only takes accepted and pending users
        if (user.status === UserStatus.ACCEPTED) {
          acc.unshift(user);
        } else if (user.status === UserStatus.PENDING) {
          acc.push(user);
        }
        return acc;
    }, []);

    res.send({ok: true, schoolAdmins: users} as ApiSchema.Schools_Id_SchoolAdmin_GET_RES);
  }

  //school reps that are either pending or accepted
  //accepted first and pending follows
  getSchoolReps = async (req: Request, res: Response) => {
    const schoolId = parseInt(req.params.schoolId);

    const school = await this.repository.getSchool(schoolId);
    if (!school) {
      res.send({ok: false, reason: 'School not found.'});
      return;
    }

    let users = await this.repository.getUsers();

    users = users
      .filter(u => u.schoolId === schoolId && u.role === Roles.SCHOOL_REP)
      .reduce((acc: User[], user) => {
        //puts accepted school rep at head of list
        //and only takes accepted and pending users
        if (user.status === UserStatus.ACCEPTED) {
          acc.unshift(user);
        } else if (user.status === UserStatus.PENDING) {
          acc.push(user);
        }
        return acc;
    }, []);

    res.send({ok: true, schoolReps: users} as ApiSchema.Schools_Id_SchoolRep_GET_RES);
  }
  
  editSchoolRep = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const repId = parseInt(req.params.userId);
    const rep = await repo.getUser(repId);

    if (!school || !rep) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkEditRep(req.user!, school, rep);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    const teamIds_: number[] = req.body.teamIds;
    if (!Array.isArray(teamIds_)) {
      res.send({ok: false, reason: 'Bad request'});
      return;
    }

    const possibleTeamIds: number[] = school.teams.map(t => t.id);
    let teamIds = Array.from(new Set(teamIds_))
      .filter(tid => possibleTeamIds.indexOf(tid) >= 0);

    if (teamIds.length !== teamIds_.length) {
      res.send({ok: false, reason: 'Bad team id value'});
      return;
    }

    if (teamIds.length == 0) {
      res.send({ok: false, reason: 'School coach should be associated to one or more teams'});
      return;
    }

    await repo.updateSchoolRepTeamAssociations(repId, teamIds);

    res.send({ok: true});
  }
  
  acceptSchoolAdmin = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const schoolAdminId = parseInt(req.params.userId);
    const schoolAdmin = await repo.getUser(schoolAdminId);

    if (!school || !schoolAdmin) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkAcceptSchoolAdmin(req.user!, school, schoolAdmin);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(schoolAdminId, UserStatus.ACCEPTED);
    console.log('updated user status');

    await repo.updateSchool(schoolId, schoolAdminId);
    console.log('updated school');

    res.send({ok: true});
  }
  
  rejectSchoolAdmin = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const schoolAdminId = parseInt(req.params.userId);
    const schoolAdmin = await repo.getUser(schoolAdminId);

    if (!school || !schoolAdmin) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkRejectSchoolAdmin(req.user!, school, schoolAdmin);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(schoolAdminId, UserStatus.REJECTED);
    console.log('updated user status');

    res.send({ok: true});
  }
  
  removeSchoolAdmin = async (req: Request, res: Response) => {
    const repo = this.repository;

    const schoolId = parseInt(req.params.schoolId);
    const school = await repo.getSchool(schoolId);

    const schoolAdminId = parseInt(req.params.userId);
    const schoolAdmin = await repo.getUser(schoolAdminId);

    if (!school || !schoolAdmin) {
      res.send({ok: false, reason: 'Resource not found'});
      return;
    }

    const error = checkRemoveSchoolAdmin(req.user!, school, schoolAdmin);
    if (error) {
      res.send({ok: false, reason: error});
      return;
    }

    await repo.updateUser(schoolAdminId, UserStatus.REMOVED);
    console.log('updated user status');

    await repo.updateSchool(schoolId, null);
    console.log('updated school');

    res.send({ok: true});
  }  
}

const createTeamName = (schoolName: string, teamKind: TeamKind) => {
  return schoolName + ' ' + teamKind.toUpperCase();
}

const isDon = (user: User) => {
  return user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN;
}

//school rep checks
const checkRepFactory = (userStatus: UserStatus) => (requester: User, school: School, rep: User) => {
  if (!school.isLhsaa) {
    return 'No edits are allowed on a `temporary school`';
  }

  if (rep.status !== userStatus) {
    return `User should have ${userStatus} status.`;
  }

  if (rep.role !== Roles.SCHOOL_REP) {
    return 'User is not a school coach';
  }

  if (rep.schoolId !== school.id) {
    return 'User did not sign up for the school';
  }

  const hasPermission = isDon(requester) || requester.id === school.schoolAdminId;
  if (!hasPermission) {
    return 'Not enough privilege to make this request';
  }

  return null;
}

const checkAcceptRep = checkRepFactory(UserStatus.PENDING);

const checkRejectRep = checkRepFactory(UserStatus.PENDING);

const checkRemoveRep = checkRepFactory(UserStatus.ACCEPTED);

const checkEditRep = checkRepFactory(UserStatus.ACCEPTED);

//school admin checks
const checkSchoolAdminFactory = (userStatus: UserStatus) => (requester: User, school: School, sAdmin: User) => {
  if (!school.isLhsaa) {
    return 'No edits are allowed on a `temporary school`';
  }

  if (sAdmin.status !== userStatus) {
    return `User should have ${userStatus} status.`;
  }

  if (sAdmin.role !== Roles.SCHOOL_ADMIN) {
    return 'User is not a school admin.';
  }

  if (sAdmin.schoolId !== school.id) {
    return 'User did not signup for the school.';
  }

  const hasPermission = isDon(requester);
  if (!hasPermission) {
    return 'Not enough privilege to make this request.';
  }

  return null;
}

const checkAcceptSchoolAdmin = (() => {
  const check = checkSchoolAdminFactory(UserStatus.PENDING);

  return (requester: User, school: School, sAdmin: User) => {
    if (school.schoolAdminId) {
      return 'School already has a school admin';
    }

   return check(requester, school, sAdmin);
  }
})();

const checkRejectSchoolAdmin = checkSchoolAdminFactory(UserStatus.PENDING);

const checkRemoveSchoolAdmin = checkSchoolAdminFactory(UserStatus.ACCEPTED);