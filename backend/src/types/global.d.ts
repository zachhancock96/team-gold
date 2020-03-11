import { Privileges as P, Roles, GameStatus, TeamKind } from '../enums';
import User from '../user';

declare global {
  namespace ApiSchema {
    interface Team {
      id: number;
      name: string;
      school: {
        id: number,
        name: string
      };
      schoolReps: {
        id: number,
        name: string
      }[];
      teamKind: TeamKind;
    }
  
    interface School {
      id: number;
      name: string;
      schoolReps: {
        id: number,
        name: string
      }[];
      teams: {
        id: number;
        name: string;
        teamKind: TeamKind;
      }[];
      schoolAdmin: {
        id: number,
        name: string
      } | null;
      district: {
        id: number,
        name: string
      } | null;
      assignor: {
        id: number,
        name: string
      } | null;
    }
  
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
    }
  
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
  
    interface District {
      id: number;
      name: string;
      schools: [{
        id: number;
        name: string;
      }];
      assignor?: {
        id: number;
        name: string;
      };
    }
  
    interface Privileges {
      game: P.GamePrivilege[];
      school: P.SchoolPrivilege[];
      district: P.DistrictPrivilege[];
      team: P.TeamPrivilege[];
    }

    interface Game_ADD {
      homeTeamId: number,
      awayTeamId: number,
      start: string,
      location: string
    }

    interface Game_EDIT {
      start: string;
      location: string;
    }
    
    interface Game_REJECT {
      rejectionNote?: string
    }

    //POST /login
    interface Login_POST_REQ {
      email: string;
      password: string;
    }
    interface Login_POST_RES {
      ok: true;
      sessionId: number
    }

    //GET /users
    interface Users_GET_RES {
      ok: true;
      users: User[]
    }
    //GET /users/:id
    interface Users_Id_GET_RES {
      ok: true,
      user: User | null
    }

    //GET /games
    interface Games_GET_RES {
      ok: true;
      games: Game[]
    }
    //GET /games/:id
    interface Games_Id_GET_RES {
      ok: true;
      game: Game | null;
    }
    //GET /users/:userId/privileges/:privileges/games
    interface Users_UserId_Privileges_Games_GET_RES {
      ok: true;
      games: Game[];
    }
    //POST /games
    interface Games_POST_REQ {
      homeTeamId: number;
      awayTeamId: number;
      start: string;
      location: string;
    }
    interface Games_POST_RES {
      ok: boolean;
      gameId: number;
    }
    //POST /games/:id/edit
    interface Games_Id_Edit_POST_REQ {
      start: string;
      location: string;
    }
    interface Games_Id_Edit_POST_RES {
      ok: true;
    }
    //POST /games/:id/accept
    interface Games_Id_Accept_POST_REQ {
      //no body
    }
    interface Games_Id_Accept_POST_RES {
      ok: true;
    }
    //POST /games/:id/reject
    interface Games_Id_Reject_POST_REQ {
      //no body
    }
    interface Games_Id_Reject_POST_RES {
      ok: true;
    }
    //POST /games/:id/approve
    interface Games_Id_Approve_POST_REQ {
      //no body
    }
    interface Games_Id_Approve_POST_RES {
      ok: true
    }

    //GET /teams
    interface Teams_GET_RES {
      ok: true;
      teams: Team[];
    }
    //GET /teams/:id
    interface Teams_GET_ID_RES {
      ok: true;
      team: Team | null;
    }
    //GET /users/:userId/privileges/:privileges/teams
    interface Users_UserId_Privileges_Teams_GET_RES {
      ok: true;
      teams: Team[];
    }

    //GET /schools
    interface Schools_GET_RES {
      ok: true;
      schools: School[];
    }
    //GET /schools/:id
    interface Schools_GET_ID_RES {
      ok: true;
      school: School | null;
    }
    //GET /users/:userId/privileges/:privileges/schools
    interface Users_UserId_Privileges_Schools_GET_RES {
      ok: true;
      schools: School[]
    }

    //All the responses that could not pass because of business rule
    interface Ok_False_RES {
      ok: false;
      reason: string;
    }
  }
}

declare module 'express' {
  interface Request {

    //authorization middleware adds user parameter to request object
    user?: User
  }
}