CREATE Database IF NOT EXISTS SoccerSchedule;

USE SoccerSchedule;

DROP TABLE IF EXISTS GAME_HISTORY;
DROP TABLE IF EXISTS GAME;
DROP TABLE IF EXISTS SCHOOL_REP_TEAM_ASSN;
DROP TABLE IF EXISTS SCHOOL_REP;
DROP TABLE IF EXISTS TEAM;
DROP TABLE IF EXISTS SCHOOL;
DROP TABLE IF EXISTS DISTRICT;
DROP TABLE IF EXISTS USER;

CREATE TABLE USER (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  email varchar(55) NOT NULL,
  password varchar(55) NULL,
  role varchar(55) NOT NULL,

  PRIMARY KEY(id),
  UNIQUE(email)
);

CREATE TABLE DISTRICT (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  assignorId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(assignorId) REFERENCES USER(id)
);

CREATE TABLE SCHOOL (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  schoolAdminId int NULL,
  districtId int NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(schoolAdminId) REFERENCES USER(id),
  FOREIGN KEY(districtId) REFERENCES DISTRICT(id),
  UNIQUE(name)
);

CREATE TABLE SCHOOL_REP (
  id int NOT NULL AUTO_INCREMENT,
  userId int NOT NULL,
  schoolId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(userId) REFERENCES USER(id),
  FOREIGN KEY(schoolId) REFERENCES SCHOOL(id)
);

CREATE TABLE TEAM (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  teamKind varchar(55) NOT NULL,
  schoolId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(schoolId) REFERENCES SCHOOL(id),
  UNIQUE(name)
);

CREATE TABLE SCHOOL_REP_TEAM_ASSN (
  id int NOT NULL AUTO_INCREMENT,
  schoolRepId int NOT NULL,
  teamId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(schoolRepId) REFERENCES SCHOOL_REP(id),
  FOREIGN KEY(teamId) REFERENCES TEAM(id)
);

CREATE TABLE GAME (
  id int NOT NULL AUTO_INCREMENT,
  homeTeamId int NOT NULL,
  awayTeamId int NOT NULL,
  start DateTime NOT NULL,
  location varchar(55) NOT NULL,
  status varchar(55) NOT NULL,
  rejectionNote varchar(255) NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(homeTeamId) REFERENCES TEAM(id),
  FOREIGN KEY(awayTeamId) REFERENCES TEAM(id)
);

-- updateType: 'create'|  'update'| 'accept'| 'reject'
-- updaterType: 'home' | 'away' | 'assignor' | 'admin' (home and away are computed; deduced from school rep and school admin role)
CREATE TABLE GAME_HISTORY (
  id int NOT NULL AUTO_INCREMENT,
  gameId int NOT NULL,
  start DateTime NOT NULL,
  location varchar(55) NOT NULL,
  status varchar(55) NOT NULL,
  timestamp DateTime NOT NULL,
  updateType varchar(55) NOT NULL,
  updaterId int NOT NULL,
  updaterType varchar(55) NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(gameId) REFERENCES GAME(id),
  FOREIGN KEY(updaterId) REFERENCES USER(id)
);