# SolarLightCare — Solar Streetlight Fault Reporting and Maintenance Management System

## Project Overview
SolarLightCare is an AWS-hosted web application designed to help citizens report faults in solar streetlights and help maintenance teams track and manage complaints.

## Objectives
- Allow citizens to submit streetlight fault complaints.
- Store and retrieve complaint information.
- Track complaints using complaint IDs and status.
- Provide web pages for complaint reporting and management.
- Demonstrate deployment of a web application using AWS cloud infrastructure.

## Technology Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA

**Database**
- MariaDB
- MySQL-compatible database connectivity

**Cloud and Deployment**
- Amazon EC2 — application hosting
- Amazon S3 — project artifact storage
- AWS IAM — permissions for EC2 access to S3
- Nginx — serves the frontend and proxies API requests
- systemd — manages backend startup and restart

## Main Features
- Submit new streetlight fault complaints.
- Retrieve saved complaints through a REST API.
- View submitted complaints.
- Record complaint details such as streetlight ID, location, fault type, priority, description, and status.
- Access the deployed application through a public web address.

## Application Architecture
1. A user accesses the frontend through a web browser.
2. Nginx serves the frontend pages.
3. Frontend API requests are forwarded to the Spring Boot backend.
4. The backend uses Spring Data JPA to interact with MariaDB.
5. The application runs on an Amazon EC2 instance.

## Project Structure
```text
SolarLightCare/
└── SolarLightCare-Backup/
    ├── SolarLightCareBackend/
    └── frontend/
```

## Deployment Verification
The deployed website has been tested successfully. Complaint submission returned a success message, and a submitted complaint appeared on the My Complaints page. The complaints API also returned HTTP 200 with stored complaint data.

## Future Enhancements
- Store and display complaint photographs using Amazon S3.
- Add stronger authentication and role-based authorization.
- Improve monitoring, backup, and production security.
- Configure a domain name and HTTPS.

## Disclaimer
This is an academic cloud-computing project. Features and integrations should be considered implemented only where verified in the deployed application.

## Author
Student Project — SolarLightCare
