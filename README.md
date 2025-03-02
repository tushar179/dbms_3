# dbms_3

## About
The `dbms_3` project is a web-based application developed as part of a Database Management System (DBMS) course. It serves as a comprehensive platform for managing various aspects of student and event information within an educational institution.

## Features
- **Student Management**: Allows administrators to add, view, and update student details.
- **Event Management**: Facilitates the registration and management of events within the institution.
- **User Authentication**: Provides secure login and signup functionalities for users.

## Technologies Used
- **Frontend**:
  - HTML
  - CSS
- **Backend**:
  - Node.js
- **Database**:
  - MySQL (or any other database, update as required)

## Project Structure
Here is an overview of the project structure:

```
dbms_3/
│
├── home.html      # Homepage of the application
├── login.html     # User login page
├── signup.html    # User registration page
├── student.html   # Page to view and manage student details
├── events.html    # Page to view and manage events
├── server.js      # Backend server file
├── package.json   # Node.js project configuration file
└── style.css      # Stylesheet for the frontend
```

## Setup Instructions
Follow these steps to set up the project on your local machine:

### 1. Clone the Repository
Clone the repository to your local machine by running the following command in your terminal:

```bash
git clone https://github.com/tushar179/dbms_3.git
```

### 2. Navigate to the Project Directory
After cloning the repository, navigate to the project directory:

```bash
cd dbms_3
```

### 3. Install Dependencies
Ensure you have Node.js installed. Then, install the required Node.js packages by running:

```bash
npm install
```
This will install all the necessary dependencies defined in the package.json file.

### 4. Set Up the Database
Create a Database: Set up a MySQL (or another database system) database for this project.

Example for MySQL:

```sql
CREATE DATABASE dbms_3;
```

Import Database Schema: Use the provided SQL schema (or create one based on the project requirements) to create the necessary tables and relationships in the database.

Example SQL query:

```sql
USE dbms_3;

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    age INT,
    department VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE,
    description TEXT
);

-- Add any other necessary tables here
```

### 5. Configure Environment Variables
Create a .env file in the root of the project directory and add your database connection details:

```ini
DB_HOST=your_database_host
DB_USER=your_database_username
DB_PASS=your_database_password
DB_NAME=your_database_name
```

### 6. Run the Application
Start the server by running the following command:

```bash
node server.js
```
This will start the backend server, and you can access the application through your web browser.
