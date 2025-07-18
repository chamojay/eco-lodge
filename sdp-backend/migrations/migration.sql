-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ecolodge;
USE ecolodge;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `restaurant_order_items`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `reservation_activities`;
DROP TABLE IF EXISTS `extra_charges`;
DROP TABLE IF EXISTS `restaurant_orders`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `menu_categories`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `activities`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `room_types`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `extra_charge_types`;
DROP TABLE IF EXISTS `package_types`;
DROP TABLE IF EXISTS `users`;

-- Create tables in order of dependencies
-- CreateTable: customers
CREATE TABLE `customers` (
    `CustomerID` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` ENUM('Mr', 'Mrs', 'Ms') NULL,
    `FirstName` VARCHAR(50) NOT NULL,
    `LastName` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `Phone` VARCHAR(20) NOT NULL,
    `Country` VARCHAR(50) NOT NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `NIC` VARCHAR(12) NULL,
    `PassportNumber` VARCHAR(15) NULL,

    PRIMARY KEY (`CustomerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: package_types
CREATE TABLE `package_types` (
    `PackageID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL,
    `Description` TEXT NULL,
    `PriceMultiplier` DECIMAL(3, 2) NOT NULL,
    `ImagePath` VARCHAR(255) NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Name`(`Name`),
    PRIMARY KEY (`PackageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: room_types
CREATE TABLE `room_types` (
    `TypeID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL,
    `Description` TEXT NULL,
    `ImagePath` VARCHAR(255) NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Name`(`Name`),
    PRIMARY KEY (`TypeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: rooms
CREATE TABLE `rooms` (
    `RoomID` INTEGER NOT NULL AUTO_INCREMENT,
    `RoomNumber` INTEGER NOT NULL,
    `LocalPrice` DECIMAL(10, 2) NOT NULL,
    `Description` TEXT NULL,
    `ForeignPrice` DECIMAL(10, 2) NOT NULL,
    `MaxPeople` INTEGER NOT NULL,
    `TypeID` INTEGER NULL,

    UNIQUE INDEX `RoomNumber`(`RoomNumber`),
    INDEX `TypeID`(`TypeID`),
    PRIMARY KEY (`RoomID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: activities
CREATE TABLE `activities` (
    `ActivityID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Description` TEXT NULL,
    `LocalPrice` DECIMAL(10, 2) NOT NULL,
    `ForeignPrice` DECIMAL(10, 2) NOT NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`ActivityID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: reservations
CREATE TABLE `reservations` (
    `ReservationID` INTEGER NOT NULL AUTO_INCREMENT,
    `CustomerID` INTEGER NOT NULL,
    `CheckInDate` DATE NOT NULL,
    `CheckOutDate` DATE NOT NULL,
    `TotalAmount` DECIMAL(10, 2) NOT NULL,
    `Room_Status` ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending',
    `Adults` INTEGER NULL,
    `Children` INTEGER NULL,
    `SpecialRequests` TEXT NULL,
    `ArrivalTime` TIME(0) NULL,
    `DepartureTime` TIME(0) NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `RoomID` INTEGER NOT NULL,
    `PackageID` INTEGER NULL,

    INDEX `CustomerID`(`CustomerID`),
    INDEX `RoomID`(`RoomID`),
    INDEX `PackageID`(`PackageID`),
    PRIMARY KEY (`ReservationID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: extra_charge_types
CREATE TABLE `extra_charge_types` (
    `TypeID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `DefaultAmount` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`TypeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: extra_charges
CREATE TABLE `extra_charges` (
    `ChargeID` INTEGER NOT NULL AUTO_INCREMENT,
    `ReservationID` INTEGER NOT NULL,
    `TypeID` INTEGER NULL,
    `Description` VARCHAR(255) NULL,
    `Amount` DECIMAL(10, 2) NOT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ReservationID`(`ReservationID`),
    INDEX `TypeID`(`TypeID`),
    PRIMARY KEY (`ChargeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: menu_categories
CREATE TABLE `menu_categories` (
    `CategoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`CategoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: menu_items
CREATE TABLE `menu_items` (
    `ItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Price` DECIMAL(10, 2) NOT NULL,
    `CategoryID` INTEGER NULL,
    `ImagePath` VARCHAR(255) NULL,
    `IsActive` BOOLEAN NULL DEFAULT true,

    INDEX `CategoryID`(`CategoryID`),
    PRIMARY KEY (`ItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: restaurant_orders
CREATE TABLE `restaurant_orders` (
    `OrderID` INTEGER NOT NULL AUTO_INCREMENT,
    `OrderDate` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TotalAmount` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`OrderID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: restaurant_order_items
CREATE TABLE `restaurant_order_items` (
    `OrderItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `OrderID` INTEGER NOT NULL,
    `ItemID` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,

    INDEX `ItemID`(`ItemID`),
    INDEX `OrderID`(`OrderID`),
    PRIMARY KEY (`OrderItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: payments
CREATE TABLE `payments` (
    `PaymentID` INTEGER NOT NULL AUTO_INCREMENT,
    `Amount` DECIMAL(10, 2) NOT NULL,
    `PaymentDate` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `PaymentMethod` ENUM('Cash', 'Card', 'Online') NOT NULL,
    `ReservationID` INTEGER NULL,
    `OrderID` INTEGER NULL,
    `Source` ENUM('Web', 'Reception', 'Restaurant') NOT NULL DEFAULT 'Web',

    INDEX `OrderID`(`OrderID`),
    INDEX `ReservationID`(`ReservationID`),
    PRIMARY KEY (`PaymentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: users
CREATE TABLE `users` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(50) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Role` ENUM('ADMIN', 'RECEPTION', 'RESTAURANT') NOT NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `UpdatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Username`(`Username`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add all foreign key constraints
ALTER TABLE `rooms` 
    ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`TypeID`) REFERENCES `room_types`(`TypeID`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `reservations`
    ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customers`(`CustomerID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`RoomID`) REFERENCES `rooms`(`RoomID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`PackageID`) REFERENCES `package_types`(`PackageID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `extra_charges`
    ADD CONSTRAINT `extra_charges_ibfk_1` FOREIGN KEY (`ReservationID`) REFERENCES `reservations`(`ReservationID`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `extra_charges_ibfk_2` FOREIGN KEY (`TypeID`) REFERENCES `extra_charge_types`(`TypeID`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `reservation_activities`
    ADD CONSTRAINT `reservation_activities_ibfk_1` FOREIGN KEY (`ReservationID`) REFERENCES `reservations`(`ReservationID`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `reservation_activities_ibfk_2` FOREIGN KEY (`ActivityID`) REFERENCES `activities`(`ActivityID`) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE `payments`
    ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`ReservationID`) REFERENCES `reservations`(`ReservationID`) ON DELETE SET NULL ON UPDATE NO ACTION,
    ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`OrderID`) REFERENCES `restaurant_orders`(`OrderID`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `restaurant_order_items`
    ADD CONSTRAINT `restaurant_order_items_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `restaurant_orders`(`OrderID`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `restaurant_order_items_ibfk_2` FOREIGN KEY (`ItemID`) REFERENCES `menu_items`(`ItemID`) ON DELETE RESTRICT ON UPDATE NO ACTION;

