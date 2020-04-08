//note that for enums, right side are the actual values that would be visible in javascript
enum Role {
  ASSIGNOR = 'assignor',
  SCHOOL_ADMIN = 'school_admin',
  SCHOOL_REP = 'school_rep'
}

enum TeamKind {
  VB = 'vb',
  VG = 'vg',
  JVB  = 'jvb',
  JVG = 'jvg'
};

enum GameStatus {
  PENDING_HOME_TEAM = 'pending_home_team',
  PENDING_AWAY_TEAM = 'pending_away_team',
  PENDING_ASSIGNOR = 'pending_assignor',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
};

//what actions can a user take on a game (for edit purpose)
//show buttons appropriately
enum GameAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  EDIT = 'edit'
};

interface Game {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    teamKind: TeamKind;
  };
  awayTeam: {
    id: number;
    name: string;
    teamKind: TeamKind;
  };
  start: string;
  location: string;
  status: GameStatus;
}

interface GameDetail {
  game: Game,
  actions: GameAction[],
  history: GameHistory[]
}

interface GameHistory {
  start: string,
  location: string,
  status: GameStatus,

  //timestamp of when the update was made
  timestamp: string,
  
  updateType: 'create'|  'update'| 'accept'| 'reject',
  updater: {
    id: number,
    name: string
  },
  updaterType: 'home'| 'away'| 'assignor'| 'admin'
}

interface User {
  id: number,
  name: string,
  email: string,
  role: Role
}