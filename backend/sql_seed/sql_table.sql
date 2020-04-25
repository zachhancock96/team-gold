DROP Database IF EXISTS SoccerSchedule;
CREATE Database SoccerSchedule;

USE SoccerSchedule;

CREATE TABLE USER (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  email varchar(55) NOT NULL,
  password varchar(55) NULL,
  role varchar(55) NOT NULL,
  status varchar(55) NOT NULL,
  schoolId int NULL,

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
  isLhsaa boolean NOT NULL,
  schoolAdminId int NULL,
  districtId int NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(schoolAdminId) REFERENCES USER(id) ON DELETE CASCADE,
  FOREIGN KEY(districtId) REFERENCES DISTRICT(id),
  UNIQUE(name)
);

ALTER TABLE USER ADD CONSTRAINT fk_schoolId FOREIGN KEY (schoolId) REFERENCES School(id) ON DELETE CASCADE;

CREATE TABLE TEAM (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  exportName varchar(55) NOT NULL,
  isLhsaa boolean NOT NULL,
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
  FOREIGN KEY(schoolRepId) REFERENCES USER(id),
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

CREATE TABLE CSV_EXPORT (
  id int NOT NULL AUTO_INCREMENT,
  timestamp DateTime NOT NULL,
  filename varchar(255) NOT NULL,
  gameCount int NOT NULL,
  note text NULL,
  creatorId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(creatorId) REFERENCES User(id)
);

CREATE TABLE EMAIL_SUBSCRIPTION (
  id int NOT NULL AUTO_INCREMENT,
  subscriberId int NOT NULL,
  subscriptionType varchar(55) NOT NULL,
  teamId int NULL,
  gameId int NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(subscriberId) REFERENCES User(id),
  FOREIGN KEY(teamId) REFERENCES Team(id),
  FOREIGN KEY(gameId) REFERENCES Game(id)
);