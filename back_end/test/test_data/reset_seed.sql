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

--data seed

INSERT INTO USER (id, email, password, name, role, status, schoolId) VALUES
  (1,'admin@test.net','password','Sir Admin','admin','accepted',null),
  (2,'assignor@test.net','password','Sir Assignor','assignor','accepted',null);


INSERT INTO DISTRICT (id, name, assignorId) VALUES
  (1,'District A',2);


INSERT INTO SCHOOL (id, name, isLhsaa, schoolAdminId, districtId) VALUES
(1,'Acadiana HomeSchool',1,null,1),
(2,'Adams County Christian School',1,null,1),
(3,'Airline High School',1,null,1);

INSERT INTO TEAM (id, name, exportName, isLhsaa, teamKind, schoolId) VALUES
(1,'Acadiana HomeSchool - VB','Acadiana HomeSchool',1,'vb',1),
(2,'Acadiana HomeSchool - VG','Acadiana HomeSchool',1,'vg',1),
(3,'Acadiana HomeSchool - JVG','Acadiana HomeSchool',1,'jvb',1),
(4,'Acadiana HomeSchool - JVB','Acadiana HomeSchool',1,'jvg',1),

(5,'Adams County Christian School - VB','Adams County Christian School - VB',1,'vb',2),
(6,'Adams County Christian School - VG','Adams County Christian School - VG',1,'vg',2),
(7,'Adams County Christian School - JVG','Adams County Christian School',1,'jvb',2),
(8,'Adams County Christian School - JVB','Adams County Christian School',1,'jvg',2),

(9,'Airline High School - VB','Airline High School - VB',1,'vb',3),
(10,'Airline High School - VG','Airline High School - VG',1,'vg',3),
(11,'Airline High School - JVG','Airline High School',1,'jvb',3),
(12,'Airline High School - JVB','Airline High School',1,'jvg',3);