-- RUN THIS FIRST, ONLY ONCE.

DROP TABLE IF EXISTS `mm`.`game`;
DROP TABLE IF EXISTS `mm`.`player`;
DROP TABLE IF EXISTS `mm`.`team`;
DROP TABLE IF EXISTS `mm`.`owner`;


CREATE TABLE `mm`.`team` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `school` VARCHAR(45) NULL,
  `mascot` VARCHAR(45) NULL,
  `espn_id` VARCHAR(45) NULL,
  `seed` INT,
  `region` VARCHAR(10) NULL,
  `eliminated` INT NULL DEFAULT 0,
  `created` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated` DATETIME NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `espn_id_UNIQUE` (`espn_id` ASC));

  CREATE TABLE `mm`.`owner` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `display_name` VARCHAR(45) NULL,
  `draft_position` INT NULL DEFAULT NULL,
  `secret` VARCHAR(45) NULL,
  `created` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated` DATETIME NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

  CREATE TABLE `mm`.`player` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(45) NULL,
  `espn_id` VARCHAR(45) NULL,
  `owner_id` INT NULL,
  `team_id` INT NULL,
  `jersey` INT NULL,
  `scoring_average` FLOAT NULL,
  `projected_score` FLOAT NULL,
  `position` VARCHAR(45) NULL,
  `class` VARCHAR(45) NULL,
  `round1` INT NULL DEFAULT 0,
  `round2` INT NULL DEFAULT 0,
  `round3` INT NULL DEFAULT 0,
  `round4` INT NULL DEFAULT 0,
  `round5` INT NULL DEFAULT 0,
  `round6` INT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `team_id_idx` (`team_id` ASC),
  INDEX `owner_id_idx` (`owner_id` ASC),
  CONSTRAINT `owner_id`
    FOREIGN KEY (`owner_id`)
    REFERENCES `mm`.`owner` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `team_id`
    FOREIGN KEY (`team_id`)
    REFERENCES `mm`.`team` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `espn_id_UNIQUE` (`espn_id` ASC));

CREATE TABLE `mm`.`game` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `home_team_id` INT NULL,
  `away_team_id` INT NULL,
  `espn_id` INT NULL,
  `round` INT NULL,
  `active` INT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

USE `mm`;
CREATE  OR REPLACE VIEW `scoreboard` AS
SELECT o.name, o.display_name, o.id, count(case when t.eliminated = 0 then 1 else null end) as players_remaining, sum(round1) as round1, sum(round2) as round2, sum(round3) as round3, sum(round4) as round4, sum(round5) as round5, sum(round6) as round6, (sum(round1) + sum(round2) + sum(round3) + sum(round4) + sum(round5) + sum(round6)) as 'Total'  FROM mm.owner o, mm.player p, mm.team t WHERE p.owner_id = o.id AND p.team_id = t.id group by o.id order by Total desc;

USE `mm`;
CREATE  OR REPLACE VIEW `top_player` AS
SELECT o.id as owner_id, o.name, o.display_name, full_name, p.id, t.eliminated, (round1 + round2 + round3 + round4 + round5 + round6) as Total FROM mm.player p, mm.owner o, mm.team t WHERE p.owner_id = o.id AND p.team_id = t.id order by Total desc;

USE `mm`;
CREATE  OR REPLACE VIEW `draft_randomizer` AS
SELECT id, name, display_name, draft_position FROM mm.owner o ORDER BY RAND();

SET SQL_SAFE_UPDATES = 0;
set global max_connections = 2000;

-- Only use for local development
-- ALTER USER root IDENTIFIED WITH mysql_native_password BY 'abc123';
