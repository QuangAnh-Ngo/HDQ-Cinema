# HDQ Cinema - Full-stack Movie Booking System 

<br />

## 1. Description

**HDQ Cinema** is a full-stack movie booking system project, built to simulate a complete business workflow from selecting a movie, viewing showtimes, holding seats, to processing payments.

The project consists of a **Backend** (Spring Boot) providing RESTful APIs to manage movies, theaters, users, and handle complex booking logic. The **Frontend** (JavaScript/React) provides the user interface for interacting with the system. The entire application (Backend, Frontend, Database) is containerized using **Docker** and **Nginx** (as a reverse proxy) to create a unified deployment environment.

<br />

## 2. Demo (Youtube Link)

**[(Frontend Demo)](https://www.youtube.com/watch?v=oGBiFYyYaqQ)**

<br />

## 3. Table of Contents

1.  [Key Features](#4-key-features)
2.  [Technologies in Use](#5-technologies-in-use)
3.  [Flow Chart](#6-flow-chart)
4.  [Prerequisites](#7-prerequisites)
5.  [Installation](#8-installation)
6.  [API Documentation](#9-api-documentation)
7.  [Contributors](#10-contributors)

<br />

## 4. Key Features

* **Authentication & Authorization:** The backend uses **Spring Security** with **JWT** (JSON Web Token) for authentication. The system supports Role-based Authorization for `ADMIN` and `USER` roles.
* **Booking Logic:** Handles complex booking logic, allowing users for **Seat Holding**. Held seats are given `HOLD` and `PENDING` statuses.
* **Race Condition Handling:** Uses `@UniqueConstraint` at the database layer (combining `seat_id` and `showtime_id`) to ensure a single seat cannot be booked by two users simultaneously.
* **Automatic Seat Release:** A `@Scheduled` Task runs in the background to automatically cancel `PENDING` (unpaid) bookings after 15 minutes, releasing the seats for other users.
* **Dynamic Pricing:** Ticket prices are dynamically calculated based on **Seat Type** (VIP, Classic) and **Day Type** (Holiday, Weekend) using a complex Native SQL Query.
* **VNPAY Integration:** Integrates with the VNPAY payment gateway to process transactions.
* **Admin Management:** Provides APIs for Admins to manage Movies, Theaters, Rooms, and Showtimes.

<br />

## 5. Technologies in Use

This project is built with a modern tech stack:

| Area | Technology |
| :--- | :--- |
| **Backend** | **Java 21**, **Spring Boot 3**, Spring Data JPA, **Spring Security (JWT)**, MapStruct |
| **Frontend** | **React.js** (or JavaScript, CSS, HTML), `npm` |
| **Database** | **PostgreSQL** 17 |
| **DevOps** | **Docker**, **Docker Compose**, **Nginx** (Reverse Proxy) |

<br />

## 6. Flow Chart

<br />

## 7. Prerequisites

To run this project, you only need:

* **Docker Desktop:** Installed and running on your machine.
* **`.env` File:** A file named `.env` must be placed in the project's root directory to provide environment variables (like DB passwords, JWT keys).

**Minimal `.env` file content:**
```env
# Postgres Variables
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=hdq_cinema_db

# Backend (JWT) Variables
JWT_SIGNER_KEY=YourVeryLongAndComplexSecretKeyForJWT
