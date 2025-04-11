-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2025 at 06:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `park_conservation`
--

-- --------------------------------------------------------

--
-- Table structure for table `admintable`
--

CREATE TABLE `admintable` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `park_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admintable`
--

INSERT INTO `admintable` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `park_name`, `avatar_url`, `created_at`, `updated_at`, `last_login`) VALUES
(2, 'John', 'Doe', 'admin@ecopark.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '(555) 123-4567', 'admin', 'Yellowstone', NULL, '2025-04-08 00:24:06', '2025-04-09 17:36:42', '2025-04-09 17:36:42');

-- --------------------------------------------------------

--
-- Table structure for table `auditors`
--

CREATE TABLE `auditors` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('auditor') DEFAULT 'auditor',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auditors`
--

INSERT INTO `auditors` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `last_login`, `created_at`) VALUES
(1, 'Sarah', 'Williams', 'sarah.williams@auditgov.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-456-7890', 'auditor', '2025-04-09 19:44:34', '2025-03-01 06:30:00'),
(2, 'James', 'Rodriguez', 'james.rodriguez@auditgov.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-321-6547', 'auditor', '2025-04-06 16:20:00', '2025-02-20 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `donation_type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`id`, `donation_type`, `amount`, `park_name`, `first_name`, `last_name`, `email`, `message`, `is_anonymous`, `created_at`) VALUES
(1, 'oneTime', 500.00, 'Mayumba National Park', 'Jiwdhw', 'wuehwi', 'weuibweui', 'iwedhwedi', 0, '2025-04-07 17:37:40'),
(2, 'oneTime', 500.00, 'Mayumba National Park', 'sdfghj', 'dfghjk', 'm.david@gmail.com', 'fghjk', 0, '2025-04-07 17:57:37'),
(3, 'oneTime', 500.00, 'Birougou National Park', 'wert', 'fgh', 'sdfgh', 'dfghj', 0, '2025-04-07 19:03:35'),
(4, 'oneTime', 500.00, 'Bateke Plateau National Park', 'y2e23ediu', 'edhweuid', 'm.david@alustudent.com', 'grfh34uih4uifh34ui', 0, '2025-04-07 19:32:13');

-- --------------------------------------------------------

--
-- Table structure for table `finance_officers`
--

CREATE TABLE `finance_officers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `park_name` varchar(100) DEFAULT NULL,
  `role` enum('finance') DEFAULT 'finance',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_officers`
--

INSERT INTO `finance_officers` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `park_name`, `role`, `last_login`, `created_at`) VALUES
(3, 'Emily', 'Johnson', 'emily.johnson@parkfinance.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-123-4567', 'Yellowstone National Park', 'finance', '2025-04-08 14:30:00', '2025-01-15 07:00:00'),
(4, 'Michael', 'Chen', 'michael.chen@parkfinance.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-987-6543', 'Yosemite National Park', 'finance', '2025-04-07 10:15:00', '2025-02-10 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `fund_requests`
--

CREATE TABLE `fund_requests` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `parkname` varchar(255) NOT NULL,
  `urgency` enum('low','medium','high') NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fund_requests`
--

INSERT INTO `fund_requests` (`id`, `title`, `description`, `amount`, `category`, `parkname`, `urgency`, `status`, `created_at`, `created_by`) VALUES
(1, 'Trail Maintenance Equipment', 'We want salaries for the Luango National Park', 124.00, 'Salaries', 'Luango National Park', 'high', 'pending', '2025-04-09 20:19:20', 2),
(2, 'Funding', 'we want funding for the Moukalaba-Doudou National Park associatiion initiative', 50534.00, 'Other', 'Moukalaba-Doudou National Park', 'medium', 'pending', '2025-04-09 21:19:50', 2);

-- --------------------------------------------------------

--
-- Table structure for table `government_officers`
--

CREATE TABLE `government_officers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('government') DEFAULT 'government',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `government_officers`
--

INSERT INTO `government_officers` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `last_login`, `created_at`) VALUES
(1, 'Laura', 'Davis', 'laura.davis@gov.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-654-3210', 'government', '2025-04-09 11:00:00', '2025-01-25 08:00:00'),
(2, 'Robert', 'Patel', 'robert.patel@gov.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '555-789-1234', 'government', '2025-04-08 13:10:00', '2025-03-15 13:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parkstaff`
--

CREATE TABLE `parkstaff` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `park_name` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'park-staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parkstaff`
--

INSERT INTO `parkstaff` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `park_name`, `role`, `created_at`, `last_login`) VALUES
(2, 'glo', ' gisa ', 'Ganza.dany@yahoo.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Moukalaba-Doudou National Park', 'park-staff', '2025-04-07 21:48:16', '2025-04-09 19:33:36'),
(4, 'Bob', 'Johnson', 'bob.audit@park.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Moukalaba-Doudou National Park', 'park-staff', '2025-04-09 16:45:43', NULL),
(5, 'Carol', 'Williams', 'carol.gov@park.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Moukalaba-Doudou National Park', 'park-staff', '2025-04-09 16:45:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `payment_type` enum('donation','tour') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `card_name` varchar(100) NOT NULL,
  `card_number_last4` char(4) NOT NULL,
  `expiry_date` varchar(7) NOT NULL,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `park_name` varchar(100) DEFAULT NULL,
  `customer_email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `transaction_id`, `payment_type`, `amount`, `card_name`, `card_number_last4`, `expiry_date`, `status`, `created_at`, `park_name`, `customer_email`) VALUES
(1, 'TR-250407213603-618', 'tour', 900.00, 'Debo Wills', '5432', '20/2025', 'completed', '2025-04-07 19:36:03', 'Loango National Park', 'themanzi.david@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_type` varchar(100) NOT NULL,
  `provided_service` varchar(100) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `company_registration` longblob DEFAULT NULL,
  `application_letter` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tax_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `tour_name` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `guests` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`id`, `park_name`, `tour_name`, `date`, `time`, `guests`, `first_name`, `last_name`, `email`, `phone`, `special_requests`, `created_at`) VALUES
(1, 'Loango National Park', '', '2025-04-18', '00:00:00', 12, 'Manzi ', 'David', 'themanzi.david@gmail.com', '(+250) 791 291 003', 'f23ev23e', '2025-04-07 19:35:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admintable`
--
ALTER TABLE `admintable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `auditors`
--
ALTER TABLE `auditors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `finance_officers`
--
ALTER TABLE `finance_officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `government_officers`
--
ALTER TABLE `government_officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `parkstaff`
--
ALTER TABLE `parkstaff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admintable`
--
ALTER TABLE `admintable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `auditors`
--
ALTER TABLE `auditors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `finance_officers`
--
ALTER TABLE `finance_officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `fund_requests`
--
ALTER TABLE `fund_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `government_officers`
--
ALTER TABLE `government_officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parkstaff`
--
ALTER TABLE `parkstaff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD CONSTRAINT `fund_requests_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `parkstaff` (`id`);

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admintable` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;