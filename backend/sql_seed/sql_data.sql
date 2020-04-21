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
  (3, 'schoolA_admin@test.net', 'password', 'School A Admin', 'school_admin'),
  (4, 'schoolA_rep1@test.net', 'password', 'School A Rep 1', 'school_rep'),
  (5, 'schoolA_rep2@test.net', 'password', 'School A Rep 2', 'school_rep'),
  (6, 'schoolB_rep1@test.net', 'password', 'School B Rep 1', 'school_rep');

INSERT INTO DISTRICT (id, name, assignorId) VALUES
  (1, 'districtA', 2);

INSERT INTO SCHOOL (id, name, isLhsaa, schoolAdminId, districtId) VALUES
  (1, 'schoolA', 1, 3, 1),
  (2, 'schoolB', 1, null, 1),
  (3, 'schoolC', 0, null, null),
  (4, 'schoolD', 0, null, null);

INSERT INTO SCHOOL_REP (id, userId, schoolId) VALUES
  (1, 4, 1),
  (2, 5, 1),
  (3, 6, 2);

INSERT INTO TEAM (id, name, isLhsaa, teamKind, schoolId) VALUES
  (1, 'schoolA VB',  1, 'vb', 1),
  (2, 'schoolA JVG', 1, 'jvg', 1),
  (3, 'schoolB VB',  1, 'vb', 2),
  (4, 'schoolB JVG', 1, 'jvg', 2),
  (5, 'schoolC JVG', 0, 'jvg', 3),
  (6, 'schoolD JVG', 0, 'jvg', 4);

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
  (2, 2, 4, '2020-03-16T18:00:00-05:00', 'WMHS', 'accepted', null),
  (3, 2, 5, '2020-03-16T18:00:00-05:00', 'WMHS', 'pending_assignor', null);

INSERT INTO GAME_HISTORY (id, gameId, start, location, status, timestamp, updateType, updaterId, updaterType) VALUES
  (1, 1, '2020-03-15T18:00:00-05:00', 'WOHS', 'accepted', '2020-03-16T18:00:00-05:00', 'create', 2, 'assignor'),
  (2, 2, '2020-03-16T18:00:00-05:00', 'WMHS', 'accepted', '2020-03-16T18:00:00-05:00', 'create', 2, 'assignor'),
  (3, 2, '2020-03-16T18:00:00-05:00', 'WMHS', 'accepted', '2020-03-16T18:00:00-05:00', 'create', 3, 'home');