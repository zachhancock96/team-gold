export enum  Roles {
  ADMIN = 'admin',
  ASSIGNOR = 'assignor',
  SCHOOL_ADMIN = 'school_admin',
  SCHOOL_REP = 'school_rep',
};

export enum GameStatus {
  PENDING_HOME_TEAM = 'pending_home_team',
  PENDING_AWAY_TEAM = 'pending_away_team',
  PENDING_ASSIGNOR = 'pending_assignor',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
};

export enum UserStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PENDING = 'pending',
  REMOVED = 'removed'
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