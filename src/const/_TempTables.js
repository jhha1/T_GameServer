module.exports = { 
    init: () => {},
    initTempTables: () => {
        global.CONST_TABLE = {};

        CONST_TABLE["UserBattleStat"] = [
            /*hp:10, hpr:10hp회복, sp:1이속, cr:0.1치명타확률, cp:1*/
            {id:1, kind: 1/*ap*/, grade:1, level_max:100, stat:10, stat_max:1000, gold:100},
            {id:2, kind: 1, grade:2, level_max:500, stat:100, stat_max:51000, gold:1000},
            {id:3, kind: 1, grade:3, level_max:1000, stat:1000, stat_max:551000, gold:10000},
            {id:4, kind: 1, grade:4, level_max:1500, stat:5000, stat_max:5551000, gold:100000},
            {id:5, kind: 1, grade:5, level_max:2000, stat:10000, stat_max:55551000, gold:1000000},
            {id:6, kind: 2, grade:1, level_max:100, stat:10, stat_max:1000, gold:100},
            {id:7, kind: 3, grade:1, level_max:100, stat:10, stat_max:1000, gold:100},
            {id:8, kind: 4, grade:1, level_max:100, stat:10, stat_max:1000, gold:100},
        ];
        CONST_TABLE["Hero"] = [
            {id:1, grade:1, name:'hero_1'},
            {id:2, grade:2, name:'hero_2'},
            {id:3, grade:3, name:'hero_3'},
        ];
        CONST_TABLE["HeroBuff"] = [
            {id:1, hero_id: 1, level:1, ap_buff:1, hp_buff:1, gold_buff:1, sp_buff:1, cr_buff:0.1, cp_buff:1, skill:0},
            {id:2, hero_id: 1, level:10, ap_buff:10, hp_buff:10, gold_buff:10, sp_buff:2, cr_buff:0.2, cp_buff:2, skill:0},
            {id:3, hero_id: 1, level:25, ap_buff:10, hp_buff:10, gold_buff:10, sp_buff:2, cr_buff:0.2, cp_buff:2, skill:0},
            {id:4, hero_id: 1, level:35, ap_buff:0, hp_buff:0, gold_buff:0, sp_buff:0, cr_buff:0, cp_buff:0, skill:10},
            {id:5, hero_id: 1, level:50, ap_buff:10, hp_buff:10, gold_buff:10, sp_buff:2, cr_buff:0.2, cp_buff:2, skill:0},
            {id:6, hero_id: 1, level:75, ap_buff:10, hp_buff:10, gold_buff:10, sp_buff:2, cr_buff:0.2, cp_buff:2, skill:0},
            {id:7, hero_id: 1, level:100, ap_buff:10, hp_buff:10, gold_buff:10, sp_buff:2, cr_buff:0.2, cp_buff:2, skill:0},
            {id:8, hero_id: 1, level:101, ap_buff:100, hp_buff:0, gold_buff:0, sp_buff:0, cr_buff:0, cp_buff:0, skill:0},
            {id:9, hero_id: 2, level:1, ap_buff:1, hp_buff:1, gold_buff:1, sp_buff:1, cr_buff:0.1, cp_buff:1, skill:0},
        ];
        CONST_TABLE["LevelUpPiece"] = [
            {id:1, kind:1, level:1, piece_id:3, piece_count:30},
            {id:2, kind:1, level:2, piece_id:3, piece_count:34},
            {id:3, kind:1, level:3, piece_id:3, piece_count:40},
        ];
        CONST_TABLE["Pet"] = [
            {id:1, grade:1, tribe:1, kind:1, name:'pet_1'},
            {id:2, grade:2, tribe:2, kind:2, name:'pet_2'},
            {id:3, grade:3, tribe:3, kind:3, name:'pet_3'}
        ];
        CONST_TABLE["PetBuff"] = [
            {id:1, pet_id: 1, level:1, ap:1000, ap_speed:0.6, ap_buff:5},
            {id:2, pet_id: 1, level:2, ap:1100, ap_speed:0.6, ap_buff:6},
            {id:3, pet_id: 1, level:3, ap:1200, ap_speed:0.6, ap_buff:7},
            {id:4, pet_id: 2, level:1, ap:2000, ap_speed:0.6, ap_buff:6},
        ];
        CONST_TABLE["Skill"] = [
            {id:1, skill_id: 1, grade:1, cool_time:6, unlock_level:1, name:'skill_1'},
            {id:2, skill_id: 2, grade:2, cool_time:4, unlock_level:5,name:'skill_2'},
            {id:3, skill_id: 10, grade:3, cool_time:4, unlock_level:35,name:'skill_10'}, // hero_1 고유 스킬
        ];
        CONST_TABLE["SkillBuff"] = [
            {id:1, skill_id: 1, level:1, ap_buff:5},
            {id:2, skill_id: 1, level:2, ap_buff:6},
            {id:3, skill_id: 1, level:3, ap_buff:7},
            {id:4, skill_id: 2, level:1, ap_buff:6},
        ];
        CONST_TABLE["Monster"] = [
            {id:1, grade:1, level_max:10, ap:10, hp:10, hpr:0, sp:0, cr:0.1, cp:1, name:'monster_1'},
            {id:2, grade:2, level_max:20, ap:20, hp:20, hpr:0, sp:0, cr:0.1, cp:1, name:'monster_2'}
        ];
        CONST_TABLE["Stage"] = [
            {id:1, stageId:1, subStageId:1, goldAmount:100},
            {id:2, stageId:1, subStageId:2, goldAmount:200}
        ];
        CONST_TABLE["ItemEquipBuff"] = [
            {id:1, kind:1, grade:1, level:10, piece_count:2, ap_buff:30, hp_buff:0, cp_buff:0},
            {id:2, kind:1, grade:2, level:20, piece_count:3, ap_buff:50, hp_buff:0, cp_buff:0},
            {id:3, kind:2, grade:1, level:10, piece_count:2, ap_buff:0, hp_buff:30, cp_buff:0}
        ]; /*kind: 1:무기, 2:방어, 3,4,5*/
        CONST_TABLE["PieceHero"] = [
            {id:1, level:1, piece_cnt:2},
            {id:2, level:2, piece_cnt:4},
            {id:3, level:3, piece_cnt:6},
            {id:4, level:4, piece_cnt:8},
            {id:5, level:5, piece_cnt:10}
        ];
        CONST_TABLE["PieceSkill"] = [
            {id:1, level:1, piece_cnt:2},
            {id:2, level:2, piece_cnt:4},
            {id:3, level:3, piece_cnt:6},
            {id:4, level:4, piece_cnt:8},
            {id:5, level:5, piece_cnt:10}
        ];
        CONST_TABLE["Gacha"] = [
            {id:1, gacha_id:1, gacha_type: 1, pay_item_id:100001, gacha_count_1:11, pay_amount_1:500, gacha_count_2:35, pay_amount_2:1500, ad_gacha_count:11, ad_view_count:3, get_point:1, stage_limit:1, start_dt:'2023-08-01 10:00:00', end_dt:'2999-12-31 23:59:59'},
            {id:2, gacha_id:2, gacha_type: 2, pay_item_id:100001, gacha_count_1:11, pay_amount_1:500, gacha_count_2:35, pay_amount_2:1500, ad_gacha_count:11, ad_view_count:3, get_point:1, stage_limit:1, start_dt:'2023-08-01 10:00:00', end_dt:'2999-12-31 23:59:59'},
            {id:3, gacha_id:3, gacha_type: 3, pay_item_id:100001, gacha_count_1:11, pay_amount_1:500, gacha_count_2:35, pay_amount_2:1500, ad_gacha_count:11, ad_view_count:3, get_point:1, stage_limit:1, start_dt:'2023-08-01 10:00:00', end_dt:'2999-12-31 23:59:59'},
        ];
        CONST_TABLE["GachaLevel"] = [
            {id:1, type:1, level:1, point:0},
            {id:2, type:1, level:2, point:60},
            {id:3, type:1, level:3, point:140},
            {id:4, type:2, level:1, point:0},
            {id:5, type:2, level:2, point:60},
            {id:6, type:2, level:3, point:140},
        ];
        CONST_TABLE["GachaProb"] = [
            {id:1, gacha_id:1, gacha_level:1, grade:1, prob:5000000},
            {id:2, gacha_id:1, gacha_level:1, grade:2, prob:2500000},
            {id:3, gacha_id:1, gacha_level:1, grade:3, prob:1500000},
            {id:4, gacha_id:1, gacha_level:1, grade:4, prob:900000},
            {id:5, gacha_id:1, gacha_level:1, grade:5, prob:100000},
            {id:6, gacha_id:1, gacha_level:2, grade:1, prob:5000000},
        ];
        CONST_TABLE["KeyValues"] = [
            {id:1, key:'UserCreateItemFloatingPoint', value:[[1, 1.1e-70],[2, 1.1e-71]], type:2/* array */},
            {id:2, key:'UserCreateHero', value:1, type:1 /* primitive */},
            {id:3, key:'UserCreateItemEquip', value:[[200001, 1],[200002, 1]], type:2},
            {id:3, key:'UserCreateItemStackable', value:[[100001, 10000],[100002, 100]], type:2},
        ];
        CONST_TABLE["ItemStackble"] = [
            {id:100001, kind:1},
            {id:100002, kind:1},
            {id:100003, kind:2},
            {id:100004, kind:2},
            {id:100005, kind:3},
            {id:100006, kind:4},
            {id:100007, kind:6},
        ];
        CONST_TABLE["ItemEquip"] = [
            {id:200001, kind:1, grade:1},
            {id:200002, kind:1, grade:1},
            {id:200003, kind:1, grade:2},
            {id:200004, kind:1, grade:3},
            {id:200005, kind:2, grade:1},
            {id:200006, kind:2, grade:2},
            {id:200007, kind:2, grade:3},
        ];
        CONST_TABLE["ItemEquipLevelUp"] = [
            {id:1, grade:1, level:1, piece_count:2},
            {id:2, grade:1, level:2, piece_count:3},
            {id:3, grade:1, level:3, piece_count:4},
            {id:4, grade:2, level:1, piece_count:2},
            {id:5, grade:2, level:2, piece_count:3},
            {id:6, grade:2, level:3, piece_count:4},
            {id:7, grade:3, level:1, piece_count:2},
            {id:8, grade:3, level:2, piece_count:3},
            {id:9, grade:3, level:3, piece_count:4},
        ];
    }
}


/*
create database t_auth character set utf8mb4 COLLATE utf8mb4_bin;
create database t_game01 character set utf8mb4 COLLATE utf8mb4_bin;
create database t_game02 character set utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE `User` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `shard_id` int NOT NULL,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin default '',
  `is_leave` int DEFAULT '0',
  `last_login_dt` bigint DEFAULT '0',
  `created_dt` bigint DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `ShardStatus` (
  `shard_id` int NOT NULL COMMENT '게임디비 샤드 갯수에 따라 1부터 id가 시작',
  `user_count` int NOT NULL,
  PRIMARY KEY (`shard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
insert into ShardStatus (shard_id, user_count) values (1, 0),(2, 0); -- 샤드 개수만큼 

CREATE TABLE `Account` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `platform_type` int NOT NULL COMMENT 'guest:1, google:2, facebook:3',
  `platform_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `device_type` int DEFAULT '0' COMMENT 'aos:1, ios:2',
  `is_leave` int DEFAULT '0' COMMENT 'join:0, leave:1',
  `shard_id` int NOT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `platform_type` (`platform_type`,`platform_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `ItemDouble` (
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `item_id` int(11) NOT NULL,
  `amount` double DEFAULT '0',
  PRIMARY KEY (`user_id`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `Equip` (
  `seq` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `kind` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `ItemEquip` (
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `item_id` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `piece_count` int(11) DEFAULT '0',
  PRIMARY KEY (`user_id`, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE jhha_game01.`Hero` (
   `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `hero_id` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  PRIMARY KEY (`user_id`, hero_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `GachaLevel` (
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `gacha_id` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `point` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`gacha_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `ItemStackable` (
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `item_id` int(11) NOT NULL,
  `count` bigint(20) NOT NULL,
  PRIMARY KEY (`user_id`, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
 */