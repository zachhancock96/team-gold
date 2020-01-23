CREATE Database IF NOT EXISTS SoccerSchedule;

USE SoccerSchedule;

DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS Team;

CREATE TABLE Team (
  id int NOT NULL AUTO_INCREMENT,
  teamName varchar(55) NOT NULL,
  
  PRIMARY KEY(id),
  UNIQUE (teamName)
);

CREATE TABLE Game (
  id int NOT NULL AUTO_INCREMENT,
  homeTeamId int,
  awayTeamId int,
  start DateTime NOT NULL,
  end DateTime NOT NULL,
  location varchar(55),

  PRIMARY KEY(id),
  FOREIGN KEY(homeTeamId) REFERENCES Team(id),
  FOREIGN KEY(awayTeamId) REFERENCES Team(id)
);

