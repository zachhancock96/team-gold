DELETE FROM GAME_HISTORY;
DELETE FROM GAME;
DELETE FROM SCHOOL_REP_TEAM_ASSN;
DELETE FROM SCHOOL_REP;
DELETE FROM TEAM;
DELETE FROM SCHOOL;
DELETE FROM DISTRICT;
DELETE FROM USER;

INSERT INTO USER (id, email, password, name, role) VALUES
  (1, 'admin@test.net', 'password', 'Admin', 'admin'),
  (2, 'assignor@test.net', 'password', 'Assignor', 'assignor'),
  (3, 'schooladmin@test.net', 'password', 'School Admin', 'school_admin'),
  (4, 'schoolrepa@test.net', 'password', 'School Representative A', 'school_rep'),
  (5, 'schoolrepb@test.net', 'password', 'School Representative B', 'school_rep'),
  (6, 'schoolrepc@test.net', 'password', 'School Representative C', 'school_rep');

INSERT INTO DISTRICT (id, name, assignorId) VALUES
  (1, 'districtA', 2);

INSERT INTO SCHOOL (id, name, schoolAdminId, districtId) VALUES
  (1, 'schoolA', 3, 1),
  (2, 'schoolB', null, 1);

INSERT INTO SCHOOL_REP (id, userId, schoolId) VALUES
  (1, 4, 1),
  (2, 5, 1),
  (3, 6, 2);

INSERT INTO TEAM (id, name, teamKind, schoolId) VALUES
  (1, 'schoolA VB', 'vb', 1),
  (2, 'schoolA JVG', 'jvg', 1),
  (3, 'schoolB VB', 'vb', 2),
  (4, 'schoolB JVG', 'jvg', 2);

-- school rep 1: both teams of schoolA
-- school rep 2: team vb of schoolA
-- school rep 3: both teams of schoolB
INSERT INTO SCHOOL_REP_TEAM_ASSN (id, schoolRepId, teamId) VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 2, 1),
  (4, 3, 3),
  (5, 3, 4);

INSERT INTO GAME (id, homeTeamId, awayTeamId, start, location, status, rejectionNote) VALUES
  (1, 1, 3, '2020-03-15T18:00:00-05:00', 'WOHS', 'accepted', null),
  (2, 3, 4, '2020-03-16T18:00:00-05:00', 'WMHS', 'accepted', null);

INSERT INTO GAME_HISTORY (id, gameId, start, location, status, timestamp, updateType, updaterId, updaterType) VALUES
  (1, 1, '2020-03-15T18:00:00-05:00', 'WOHS', 'accepted', '2020-03-16T18:00:00-05:00', 'create', 2, 'assignor'),
  (2, 2, '2020-03-16T18:00:00-05:00', 'WMHS', 'accepted', '2020-03-16T18:00:00-05:00', 'create', 2, 'assignor');