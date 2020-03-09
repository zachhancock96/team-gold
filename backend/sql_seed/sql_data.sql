DELETE FROM GAME;
DELETE FROM TEAM;
DELETE FROM SCHOOL;
DELETE FROM TEAMS;
DELETE FROM USER;
DELETE FROM GENDER;
DELETE FROM DISTRICT;
DELETE FROM REP;
DELETE FROM ASSIGNOR;
DELETE FROM SCHOOL_ADMIN;

INSERT INTO GENDER (id, name, abbrevName) VALUES
  (1, 'Girls', 'G'),
  (2, 'Boys', 'B'),
  (3, 'Co-Ed', 'X');

INSERT INTO SCHOOL (id, name, abbrevName, distId) VALUES
  (1, 'Neville High School', 'Neville H.S.', 1),
  (2, 'Ginsburg High School', 'Ginsburg H.S.', 2),
  (3, 'West Monroe High School', 'West Monroe H.S.', 1);

INSERT INTO TEAM (id, schoolId, classification, abbrevClass, genId) VALUES
  (1, 1, 'Varsity', 'Var', 1),
  (2, 1, 'Varsity', 'Var', 2),
  (3, 1, 'Junior Varsity', 'JV', 1),
  (4, 1, 'Junior Varsity', 'JV', 2),
  (5, 2, 'Varsity', 'Var', 1),
  (6, 2, 'Varsity', 'Var', 2),
  (7, 2, 'Junior Varsity', 'JV', 1),
  (8, 2, 'Junior Varsity', 'JV', 2),
  (9, 3, 'Varsity', 'Var', 1),
  (10, 3, 'Varsity', 'Var', 2),
  (11, 3, 'Junior Varsity', 'JV', 1),
  (12, 3, 'Junior Varsity', 'JV', 2);

INSERT INTO GAME (id, homeTeamId, awayTeamId, start, location, status) VALUES
  (1, 1, 2, '2020-03-15T18:00:00-05:00', 'WOHS', 'pend_team'),
  (2, 2, 1, '2020-03-16T18:00:00-05:00', 'WMHS', 'pend_team'),
  (3, 1, 3, '2020-03-17T18:00:00-05:00', 'OPHS', 'pend_team');

NSERT INTO USER (email, lastSignedIn, fName, Lname, role, password) VALUES
  ('systema@test.net', 2020-03-01, 'systema', 'systema', 'School Admin', 'systema'),
  ('assignor@test.net', 2020-03-01, 'assignor', 'assignor', 'Assignor', 'assignor'),
  ('schoola@test.net', 2020-03-01, 'schoola', 'schoola', 'School Admin', 'schoola'),
  ('rep@test.net', 2020-03-01, 'rep', 'rep', 'School Representative', 'rep'),
  ('assignor2@test.net', 2020-03-01, 'assignor', 'assignor', 'Assignor', 'assignor'),
  ('schoola2@test.net', 2020-03-01, 'schoola', 'schoola', 'School Admin', 'schoola'),
  ('rep2@test.net', 2020-03-01, 'rep', 'rep', 'School Representative', 'rep');

INSERT INTO REP (email, schoolId) VALUES
  ('rep@test.net', 1),
  ('rep2@test.net', 2);

INSERT INTO SCHOOL_ADMIN (email, schoolId) VALUES
  ('schoola@test.net', 1),
  ('schoola2@test.net', 2);

INSERT INTO ASSIGNOR (email, districtId) VALUES
  ('assignor@test.net', 1),
  ('assignor2@test.net', 2);

INSERT INTO DISTRICT (id, name) VALUES
  (1, 'Ouachita'),
  (2, 'Morehouse');
