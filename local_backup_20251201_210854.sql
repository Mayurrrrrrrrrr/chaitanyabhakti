-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: vaishnavbhakti
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audio_files`
--

DROP TABLE IF EXISTS `audio_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_files` (
  `audio_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `family_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `category` varchar(50) DEFAULT 'other',
  `is_public` tinyint(1) DEFAULT '0',
  `file_size` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audio_id`),
  KEY `user_id` (`user_id`),
  KEY `family_id` (`family_id`),
  CONSTRAINT `audio_files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `audio_files_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_files`
--

LOCK TABLES `audio_files` WRITE;
/*!40000 ALTER TABLE `audio_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `audio_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `breath_records`
--

DROP TABLE IF EXISTS `breath_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `breath_records` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `technique_id` varchar(50) DEFAULT NULL,
  `technique_name` varchar(100) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `breath_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `breath_records`
--

LOCK TABLES `breath_records` WRITE;
/*!40000 ALTER TABLE `breath_records` DISABLE KEYS */;
INSERT INTO `breath_records` VALUES (1,1,'4-7-8','Relaxing Breath (4-7-8)',9,'2025-11-29 10:24:10');
/*!40000 ALTER TABLE `breath_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_posts`
--

DROP TABLE IF EXISTS `community_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `family_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `content` text,
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `post_type` enum('text','image','video','pdf') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `family_id` (`family_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `community_posts_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE CASCADE,
  CONSTRAINT `community_posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_posts`
--

LOCK TABLES `community_posts` WRITE;
/*!40000 ALTER TABLE `community_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `families`
--

DROP TABLE IF EXISTS `families`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `families` (
  `family_id` int NOT NULL AUTO_INCREMENT,
  `family_name` varchar(100) NOT NULL,
  `family_code` varchar(20) NOT NULL,
  `description` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`family_id`),
  UNIQUE KEY `family_code` (`family_code`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `families_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `families`
--

LOCK TABLES `families` WRITE;
/*!40000 ALTER TABLE `families` DISABLE KEYS */;
INSERT INTO `families` VALUES (1,'Test Family','ZXK9EG','Test Description',1,'2025-11-30 16:49:25'),(2,'Bhopal','RDTBHN',NULL,1,'2025-11-30 17:05:43'),(3,'jai','MO92UB',NULL,2,'2025-11-30 17:33:58');
/*!40000 ALTER TABLE `families` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `family_leaderboard`
--

DROP TABLE IF EXISTS `family_leaderboard`;
/*!50001 DROP VIEW IF EXISTS `family_leaderboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `family_leaderboard` AS SELECT 
 1 AS `family_id`,
 1 AS `user_id`,
 1 AS `name`,
 1 AS `spiritual_name`,
 1 AS `profile_photo`,
 1 AS `total_malas`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `family_members`
--

DROP TABLE IF EXISTS `family_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `family_members` (
  `family_id` int NOT NULL,
  `user_id` int NOT NULL,
  `relation_label` varchar(50) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`family_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE CASCADE,
  CONSTRAINT `family_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family_members`
--

LOCK TABLES `family_members` WRITE;
/*!40000 ALTER TABLE `family_members` DISABLE KEYS */;
INSERT INTO `family_members` VALUES (1,1,'Admin',1,'2025-11-30 16:49:25'),(2,1,'Admin',1,'2025-11-30 17:05:43'),(3,2,'Admin',1,'2025-11-30 17:33:58');
/*!40000 ALTER TABLE `family_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_events`
--

DROP TABLE IF EXISTS `global_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `global_events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_events`
--

LOCK TABLES `global_events` WRITE;
/*!40000 ALTER TABLE `global_events` DISABLE KEYS */;
INSERT INTO `global_events` VALUES (1,'Rama Navami','festival','2025-04-06 00:00:00',NULL,'Appearance day of Lord Rama',NULL,NULL,'2025-11-29 09:15:12'),(2,'Gaura Purnima','festival','2025-03-14 00:00:00',NULL,'Appearance day of Sri Chaitanya Mahaprabhu',NULL,NULL,'2025-11-29 09:15:12'),(3,'New festival','festival','2025-12-01 14:00:00',NULL,NULL,NULL,2,'2025-11-30 17:11:23');
/*!40000 ALTER TABLE `global_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `global_leaderboard`
--

DROP TABLE IF EXISTS `global_leaderboard`;
/*!50001 DROP VIEW IF EXISTS `global_leaderboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `global_leaderboard` AS SELECT 
 1 AS `user_id`,
 1 AS `name`,
 1 AS `spiritual_name`,
 1 AS `profile_photo`,
 1 AS `total_japa_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `japa_records`
--

DROP TABLE IF EXISTS `japa_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `japa_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `family_id` int DEFAULT NULL,
  `mala_count` int DEFAULT '0',
  `japa_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`japa_date`),
  KEY `family_id` (`family_id`),
  CONSTRAINT `japa_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `japa_records_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `japa_records`
--

LOCK TABLES `japa_records` WRITE;
/*!40000 ALTER TABLE `japa_records` DISABLE KEYS */;
INSERT INTO `japa_records` VALUES (1,1,NULL,1,'2025-11-30','2025-11-30 17:07:54'),(2,2,NULL,1,'2025-11-30','2025-11-30 17:38:31');
/*!40000 ALTER TABLE `japa_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_logs`
--

DROP TABLE IF EXISTS `medicine_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `taken_at` datetime DEFAULT NULL,
  `status` enum('taken','skipped') DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `medicine_id` (`medicine_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `medicine_logs_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE,
  CONSTRAINT `medicine_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_logs`
--

LOCK TABLES `medicine_logs` WRITE;
/*!40000 ALTER TABLE `medicine_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicine_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `medicine_name` varchar(100) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `times` json DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text,
  `reminder_enabled` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `medicines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `otp_id` int NOT NULL AUTO_INCREMENT,
  `mobile_number` varchar(15) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`otp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
INSERT INTO `otp_verifications` VALUES (1,'9999999999','221542','2025-11-25 23:26:42',1,'2025-11-25 17:46:42'),(2,'9999999999','435140','2025-11-25 23:27:51',1,'2025-11-25 17:47:51'),(3,'9999999999','881564','2025-11-25 23:34:50',1,'2025-11-25 17:54:50'),(4,'1234567890','842083','2025-11-28 19:59:19',0,'2025-11-28 14:19:19'),(5,'1234567890','588857','2025-11-28 20:02:14',0,'2025-11-28 14:22:13'),(6,'9999999999','980569','2025-11-28 21:00:42',0,'2025-11-28 15:20:41'),(7,'1234567890','184602','2025-11-28 21:12:00',0,'2025-11-28 15:32:00'),(8,'9999999999','209485','2025-11-28 21:14:49',1,'2025-11-28 15:34:48'),(9,'1234567890','881057','2025-11-28 22:15:25',0,'2025-11-28 16:35:25'),(10,'1234567890','549041','2025-11-28 22:16:12',0,'2025-11-28 16:36:12'),(11,'9999999999','114991','2025-11-29 16:03:17',1,'2025-11-29 10:23:16'),(12,'1234567890','647646','2025-11-30 12:59:09',0,'2025-11-30 07:19:09'),(13,'1234567890','881823','2025-11-30 12:59:18',0,'2025-11-30 07:19:17');
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reading_list`
--

DROP TABLE IF EXISTS `reading_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reading_list` (
  `user_id` int NOT NULL,
  `scripture_id` int NOT NULL,
  `status` enum('reading','completed','plan_to_read') DEFAULT 'plan_to_read',
  `progress_percentage` int DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`scripture_id`),
  KEY `scripture_id` (`scripture_id`),
  CONSTRAINT `reading_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reading_list_ibfk_2` FOREIGN KEY (`scripture_id`) REFERENCES `scriptures` (`scripture_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reading_list`
--

LOCK TABLES `reading_list` WRITE;
/*!40000 ALTER TABLE `reading_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `reading_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scriptures`
--

DROP TABLE IF EXISTS `scriptures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scriptures` (
  `scripture_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text,
  `content_url` varchar(255) DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `audio_url` varchar(255) DEFAULT NULL,
  `added_by` int DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`scripture_id`),
  KEY `added_by` (`added_by`),
  CONSTRAINT `scriptures_ibfk_1` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scriptures`
--

LOCK TABLES `scriptures` WRITE;
/*!40000 ALTER TABLE `scriptures` DISABLE KEYS */;
INSERT INTO `scriptures` VALUES (1,'Bhagavad Gita As It Is',NULL,'A.C. Bhaktivedanta Swami Prabhupada',NULL,'The timeless science of yoga.',NULL,NULL,NULL,NULL,1,'2025-11-29 09:15:10'),(2,'Srimad Bhagavatam',NULL,'Vyasa',NULL,'The spotless Purana.',NULL,NULL,NULL,NULL,1,'2025-11-29 09:15:10');
/*!40000 ALTER TABLE `scriptures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_assignments`
--

DROP TABLE IF EXISTS `task_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `assigned_to_user_id` int DEFAULT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `task_id` (`task_id`),
  KEY `assigned_to_user_id` (`assigned_to_user_id`),
  CONSTRAINT `task_assignments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE,
  CONSTRAINT `task_assignments_ibfk_2` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_assignments`
--

LOCK TABLES `task_assignments` WRITE;
/*!40000 ALTER TABLE `task_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `task_id` int NOT NULL AUTO_INCREMENT,
  `family_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `due_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`),
  KEY `family_id` (`family_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `user_id` int NOT NULL,
  `language` varchar(10) DEFAULT 'en',
  `font_size` varchar(20) DEFAULT 'medium',
  `high_contrast` tinyint(1) DEFAULT '0',
  `voice_commands` tinyint(1) DEFAULT '0',
  `text_to_speech` tinyint(1) DEFAULT '0',
  `notifications_enabled` tinyint(1) DEFAULT '1',
  `daily_reminder_time` time DEFAULT NULL,
  `theme` varchar(20) DEFAULT 'light',
  `daily_japa_goal` int DEFAULT '16',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
INSERT INTO `user_preferences` VALUES (1,'en','medium',0,0,0,1,NULL,'light',16),(3,'en','medium',0,0,0,1,NULL,'light',16);
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `mobile_number` varchar(15) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `spiritual_name` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `is_super_admin` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `total_japa_count` int DEFAULT '0',
  `current_streak` int DEFAULT '0',
  `longest_streak` int DEFAULT '0',
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `mobile_number` (`mobile_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'9999999999','test prabhu','vaishanav',NULL,NULL,0,1,'2025-11-29 15:53:24',0,1,1,NULL,'2025-11-25 17:48:04'),(2,'1234567890','Super Admin',NULL,'$2a$10$NXLjk5B7OA/1/rWyHW46cegMZQkhxW7POSbrerQeB7kIAWoWoJzgu',NULL,1,1,NULL,0,1,1,NULL,'2025-11-30 03:44:03'),(3,'9644771118','Mayur Dubey','Mayur','$2a$10$UOML4LDxdeYI7MN1T/BDheivfxI2iRGf/TLmlKEpuIbLk5bgireN2',NULL,0,1,NULL,0,0,0,NULL,'2025-11-30 17:12:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_links`
--

DROP TABLE IF EXISTS `video_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_links` (
  `video_id` int NOT NULL AUTO_INCREMENT,
  `added_by` int DEFAULT NULL,
  `family_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `youtube_url` varchar(255) NOT NULL,
  `youtube_id` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'other',
  `is_public` tinyint(1) DEFAULT '1',
  `description` text,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`video_id`),
  KEY `added_by` (`added_by`),
  KEY `family_id` (`family_id`),
  CONSTRAINT `video_links_ibfk_1` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `video_links_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_links`
--

LOCK TABLES `video_links` WRITE;
/*!40000 ALTER TABLE `video_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `family_leaderboard`
--

/*!50001 DROP VIEW IF EXISTS `family_leaderboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`vaishnav_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `family_leaderboard` AS select `f`.`family_id` AS `family_id`,`u`.`user_id` AS `user_id`,`u`.`name` AS `name`,`u`.`spiritual_name` AS `spiritual_name`,`u`.`profile_photo` AS `profile_photo`,sum(`j`.`mala_count`) AS `total_malas` from (((`families` `f` join `family_members` `fm` on((`f`.`family_id` = `fm`.`family_id`))) join `users` `u` on((`fm`.`user_id` = `u`.`user_id`))) left join `japa_records` `j` on((`u`.`user_id` = `j`.`user_id`))) group by `f`.`family_id`,`u`.`user_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `global_leaderboard`
--

/*!50001 DROP VIEW IF EXISTS `global_leaderboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`vaishnav_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `global_leaderboard` AS select `users`.`user_id` AS `user_id`,`users`.`name` AS `name`,`users`.`spiritual_name` AS `spiritual_name`,`users`.`profile_photo` AS `profile_photo`,`users`.`total_japa_count` AS `total_japa_count` from `users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-01 21:08:55
