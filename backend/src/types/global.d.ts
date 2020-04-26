import {  Roles, GameStatus, TeamKind, UserStatus } from '../enums';
import User from '../user';
import{ GameHistory as GameHistoryX } from '../game';

declare global {
  type GameHistoryUpdaterType = 'home'| 'away'| 'assignor'| 'admin';
  type GameHistoryUpdateType = 'create'|  'update'| 'accept'| 'reject';
  type EmailSubscriptionType = 'game_update' | 'team_game_day';

  //either mail or mailDispatcher arg should be provided
  //if both are provided then mailDispatcher is used, and mail is ignored
  interface ServerConfig {
    sql: {
      host: string;
      user: string;
      password: string;
      timezone: string;
      database: string;
    };
    http: {
      port: number;
    };
    mail?: {
      apiKey: string;
      domain: string;
      from: string;
    };
    mailDispatcher?: MailDispatcher
  }  

  export type MailDispatcher = (msg: { to: string; subject: string; html: string; }) => Promise<void>;

  interface EmailSubscription {
    id: number;
    subscriberId: number;
    subscriptionType: EmailSubscriptionType;
    teamId?: number | null;
    gameId?: number | null;
  }

  namespace ApiSchema {
    interface Team {
      id: number;
      name: string;
      isLhsaa: boolean;
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
      isLhsaa: boolean;
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
      status: UserStatus;
      schoolId?: number | null;
    }
  
    interface Game {
      id: number;
      homeTeam: {
        id: number;
        name: string;
        teamKind: TeamKind;
        isLhsaa: boolean;
        school: {
          id: number;
          name: string;
        };
      };
      awayTeam: {
        id: number;
        name: string;
        teamKind: TeamKind;
        isLhsaa: boolean;
        school: {
          id: number;
          name: string;
        };
      };
      start: string;
      location: string;
      status: GameStatus;
    }

    interface GameHistory extends GameHistoryX {
      start: string;
      timestamp: string;
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

    interface CsvExport {
      id: number;
      timestamp: string;
      downloadUrl: string;
      filename: string;
      gameCount: number;
      note: string | null;
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
    //POST /signup
    interface Signup_POST_REQ {
      email: string;
      password: string;
      schoolId: number;
      role: Roles;
    }
    interface Signup_POST_RES {
      ok: true;
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
    //query: {schoolAdmin: number}  | {schoolRep: number} | {assignor: number} | nothing
    interface Teams_GET_RES {
      ok: true;
      teams: Team[];
    }
    //GET /teams/:id
    interface Teams_GET_ID_RES {
      ok: true;
      team: Team | null;
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
    //POST /schools/non-lhsaa
    interface Schools_NonLhsaa_REQ {
      name: string;
    }
    interface Schools_NonLhsaa_RES {
      ok: true;
      schoolId: number;
    }

    //GET /schools/:schoolId/school-admins
    interface Schools_Id_SchoolAdmin_GET_RES {
      ok: true,
      schoolAdmins: User[];
    }
    //GET /schools/:schoolId/school-reps
    interface Schools_Id_SchoolRep_GET_RES {
      ok: true,
      schoolReps: User[];
    }

    //POST /schools/:schoolId/school-reps/:userId/accept
    interface Accept_SchoolRep_POST_REQ {
      //empty body
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-reps/:userId/reject
    interface Reject_SchoolRep_POST_REQ {
      //empty body
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-reps/:userId/remove
    interface Remove_SchoolRep_POST_REQ {
      //empty body
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-reps/:userId/edit
    interface Edit_SchoolRep_POST_REQ {
      teamIds: number[]
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-admins/:userId/accept
    interface Accept_SchoolAdmin_POST_REQ {
      //empty body
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-admins/:userId/reject
    interface Reject_SchoolAdmin_POST_REQ {
      //empty body
      //{ok: true} response if success
    }
    //POST /schools/:schoolId/school-admins/:userId/remove
    interface Remove_SchoolAdmin_POST_REQ {
      //empty body
      //{ok: true} response if success
    }

    //GET /csv-export
    interface CsvExport_GET_RES {
      ok: true;
      exports: CsvExport[];
    }

    //GET /csv-export/:id
    interface CsvExport_Id_GET_RES {
      ok: true;
      export: CsvExport | null;
    }

    //POST /csv-export
    interface CsvExport_POST_REQ {
      //only non rejected games are exported
      //if gameIds paramter is missing, export all non-rejected games
      gameIds: number[] | null;
      note: string | null;

      //this is ignored if the requester wasn't an assignor/admin
      shouldApprovePendingGames?: boolean;
    }
    interface CsvExport_POST_RES {
      ok: true;
      exportId: number;
    }

    //POST /csv-export/:id/remove
    interface CsvExport_Id_Remove_POST_REQ {
      //empty body
    }
    interface CsvExport_Id_Remove_POST_RES {
      ok: true;
    }

    //POST csv-export/:id/note
    interface CsvExport_Id_Note_POST_REQ {
      note: string | null;
    }
    interface CsvExport_Id_Note_POST_RES {
      ok: boolean;
    }

    //POST /subscriptions/team-game-day/subscribe
    interface Subscription_TeamGameDay_SUB_POST_REQ {
      teamId: number;
    }
    interface Subscription_TeamGameDay_SUB_POST_RES {
      ok: boolean;
      subscriptionId: number;
    }

    //POST /subscriptions/game-update/subscribe
    interface Subscription_GameUpdate_SUB_POST_REQ {
      gameId: number;
    }
    interface Subscription_GameUpdate_SUB_POST_RES {
      ok: boolean;
      subscriptionId: number;
    }

    //POST /subscriptions/{subscriptionId}/unsubscribe
    interface Subscription_Id_UNSUB_POST_REQ {
      //empty body
    }
    interface Subscription_Id_UNSUB_POST_RES {
      ok: boolean;
    }

    //GET /subscriptions/team-game-day
    interface Subscription_TeamGameDay_RES {
      ok: boolean;
      subscriptions: {subscriptionId: number, teamId: number}[];
    }
    //GET /subscriptions/game-update
    interface Subscription_GameUpdate_RES {
      ok: boolean;
      subscriptions: {subscriptionId: number, gameId: number}[];
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
