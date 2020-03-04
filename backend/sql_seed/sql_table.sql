CREATE Database IF NOT EXISTS SoccerSchedule;

USE SoccerSchedule;

DROP TABLE IF EXISTS GAME;
DROP TABLE IF EXISTS TEAM;
DROP TABLE IF EXISTS SCHOOL;
DROP TABLE IF EXISTS TEAMS;
DROP TABLE IF EXISTS USER;
DROP TABLE IF EXISTS GENDER;
DROP TABLE IF EXISTS DISTRICT;
DROP TABLE IF EXISTS REP;
DROP TABLE IF EXISTS ASSIGNOR;
DROP TABLE IF EXISTS SCHOOL_ADMIN;

CREATE TABLE SCHOOL (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  abbrevName varchar(55) NOT NULL,
  distId int NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(distId) REFERENCES DISTRICT(id),
  UNIQUE (name),
  UNIQUE (abbrevName)
);

CREATE TABLE TEAM (
  id int NOT NULL AUTO_INCREMENT,
  schoolId int NOT NULL,
  classification varchar(25) NOT NULL,
  abbrevClass varchar(10) NOT NULL,
  genId int NOT NULL,
  
  PRIMARY KEY(id),
  FOREIGN KEY(schoolId) REFERENCES SCHOOL(id),
  FOREIGN KEY(genId) REFERENCES GENDER(id)
);

CREATE TABLE GAME (
  id int NOT NULL AUTO_INCREMENT,
  homeTeamId int,
  awayTeamId int,
  start DateTime NOT NULL,
  location varchar(55),
  status varchar(15),

  PRIMARY KEY(id),
  FOREIGN KEY(homeTeamId) REFERENCES TEAM(id),
  FOREIGN KEY(awayTeamId) REFERENCES TEAM(id)
);

CREATE TABLE TEAM_CLASS (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(25) NOT NULL,
  abbrevName varchar(10) NOT NULL,

  PRIMARY KEY(id)
);

CREATE TABLE GENDER (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(15),
  abbrevName char,

  PRIMARY KEY(id)
);

CREATE TABLE USER (
  email varchar(50) NOT NULL,
  lastSignedIn DateTime,
  fName varchar(30),
  lName varchar(30),
  role varchar(40),
  password varchar(30),

  PRIMARY KEY(email),
);

CREATE TABLE REP (
  email varchar(50) NOT NULL,
  schoolId int,

  PRIMARY KEY(email),
  FOREIGN KEY(email) REFERENCES USER(email),
  FOREIGN KEY(schoolId) REFERENCES SCHOOL(id),
);

CREATE TABLE SCHOOL_ADMIN (
  email varchar(50) NOT NULL,
  schoolId int NOT NULL,

  PRIMARY KEY(email),
  FOREIGN KEY(email) REFERENCES USER(email),
  FOREIGN KEY(schoolId) REFERENCES SCHOOL(id)
);

CREATE TABLE ASSIGNOR (
  email varchar(50) NOT NULL,
  districtId int NOT NULL,

  PRIMARY KEY(email),
  FOREIGN KEY(email) REFERENCES USER(email),
  FOREIGN KEY(districtId) REFERENCES DISTRICT(id)
);

CREATE TABLE DISTRICT (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(30),

  PRIMARY KEY(id)
);