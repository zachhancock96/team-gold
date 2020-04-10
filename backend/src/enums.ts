export enum  Roles {
  ADMIN = 'admin',
  ASSIGNOR = 'assignor',
  SCHOOL_ADMIN = 'school_admin',
  SCHOOL_REP = 'school_rep',
};

//privileges are the access a user/role has over particular "resource"
//privileges have easy correspondence with roles
//this example helps clarify why there are similar privileges over different resource
//say District d with school s1, s2
//say school_admin sAdmin of school s1
//school_admin has MANAGE_GAME privilege over district d
//school_admin has MANAGE_GAME privilege over school s1
//but school_admin doesnt have MANAGE_GAME privilege over school s2 
export namespace Privileges {
  export enum GamePrivilege {
    //allows accept/reject/edit this game
    //admin: all games in system
    //assignor: all games of the teams in his dist
    //school_admin: all games of the teams in his school
    //school_rep: all games of the teams he is assigned
    UPDATE_GAME = 'update_game',

    //allows approving this game
    //admin: all games in system
    //assignor: games of teams in his dist
    APPROVE_GAME = 'approve_game'
  };
  
  export enum TeamPrivilege {
    //allows add/accept/reject/edit games for this team
    //admin: all teams in system
    //assignor: all teams in district
    //school_admin: all teams of school
    //school_rep: teams he is assigned with
    MANAGE_GAME = 'manage_game'
  };

  export enum SchoolPrivilege {
    //allows add/remove team for this school
    //admin: all schools in system
    //assignor: all schools in district
    //school_admin: school he is admin of
    MANAGE_TEAM = 'manage_team',

    //allows add/remove/assign school reps for teams in this school
    //admin: all schools in system
    //assignor: all schools in district
    //school_admin: school he is admin of
    MANAGE_SCHOOL_REP = 'manage_school_rep',

    //allows add/accept/reject/edit games of this school
    //admin: all schools in system
    //assignor: all schools in district
    //school_admin: school he is admin of
    //school_rep: school he represents
    MANAGE_GAME = 'manage_game'
  };
  
  export enum DistrictPrivilege {
    //allows add/accept/reject/edit games for teams in this district
    //admin: all districts in system
    //assignor: districts he is assignor of
    //school_admin: district his school belongs to
    //school_rep: district his school belongs to
    MANAGE_GAME = 'manage_game',

    //allows add/remove team for schools in this district
    //admin: all districts in system
    //assignor: districts he is assignor of
    //school_admin: district his school belongs to
    MANAGE_TEAM = 'manage_team',

    //allows add/remove school(s) in this district
    //admin: all districts in system
    //assignor: districts he is assignor of
    MANAGE_SCHOOL = 'manage_school',

    //allows add/remove/assign school_rep(s) for schools in this district
    //admin: all districts in system
    //assignor: districts he is assignor of
    //school_admin: district his school belongs to
    MANAGE_SCHOOL_REP = 'manage_school_rep',

    //allows add/remove/assign school_admin(s) for schools in this district
    //admin: all districts in system
    //assignor: districts he is assignor of
    MANAGE_SCHOOL_ADMIN = 'manage_school_admin',

    //allows approving games for teams in this district
    //admin: all districts in system
    //assignro: districts he is assignor of
    APPROVE_GAME = 'approve_game'
  };  
};

export enum GameStatus {
  PENDING_HOME_TEAM = 'pending_home_team',
  PENDING_AWAY_TEAM = 'pending_away_team',
  PENDING_ASSIGNOR = 'pending_assignor',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
};

export enum TeamKind {
  VB = 'vb',
  VG = 'vg',
  JVB  = 'jvb',
  JVG = 'jvg'
};

export enum GameAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  EDIT = 'edit'
};