CREATE Database IF NOT EXISTS SoccerSchedule;

USE SoccerSchedule;

DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS School;

CREATE TABLE School (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  abbrevName varchar(55) NOT NULL,

  PRIMARY KEY(id),
  UNIQUE (name),
  UNIQUE (abbrevName)
);

CREATE TABLE Team (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(55) NOT NULL,
  abbrevName varchar(55) NOT NULL,
  schoolId int NOT NULL,
  
  PRIMARY KEY(id),
  FOREIGN KEY(schoolId) REFERENCES School(id),
  UNIQUE (name),
  UNIQUE (abbrevName)
);

CREATE TABLE Game (
  id int NOT NULL AUTO_INCREMENT,
  homeTeamId int,
  awayTeamId int,
  start DateTime NOT NULL,
  location varchar(55),

  PRIMARY KEY(id),
  FOREIGN KEY(homeTeamId) REFERENCES Team(id),
  FOREIGN KEY(awayTeamId) REFERENCES Team(id)
);

