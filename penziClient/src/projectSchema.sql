-- Create the database
CREATE DATABASE Penzi_Dating_Site;

-- Use the database
USE Penzi_Dating_Site;

-- Create users table
CREATE TABLE users (
    phone VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    county VARCHAR(100),
    town VARCHAR(100),
    level_of_education VARCHAR(100),
    profession VARCHAR(100),
    marital_status VARCHAR(10) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    religion VARCHAR(100),
    ethnicity VARCHAR(100),
    description TEXT
);

-- Create matching_requests table
CREATE TABLE matching_requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    requester_phone VARCHAR(15),
    age_range VARCHAR(50),
    town VARCHAR(100),
    FOREIGN KEY (requester_phone) REFERENCES users(phone)
);

-- Create matches table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_phone VARCHAR(15),
    matched_user_phone VARCHAR(15),
    FOREIGN KEY (user_phone) REFERENCES users(phone),
    FOREIGN KEY (matched_user_phone) REFERENCES users(phone)
);

-- Create user_requests table
CREATE TABLE user_requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_phone VARCHAR(15),
    request_type VARCHAR(20) CHECK (request_type IN ('details', 'self_description', 'match', 'next', 'confirm')),
    request_body TEXT,
    FOREIGN KEY (user_phone) REFERENCES users(phone)
);

-- Create user_responses table
CREATE TABLE user_responses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    request_id INT,
    response_body TEXT,
    FOREIGN KEY (request_id) REFERENCES user_requests(id)
);

-- Example Insert Statements

-- Insert sample users
INSERT INTO users (phone, name, age, gender, county, town) VALUES
('0712345678', 'Kevin Kiptum', 30, 'Male', 'Nairobi', 'Westlands'),
('0722010203', 'Emily Moraa', 28, 'Female', 'Nairobi', 'Karen');

-- Insert sample matching requests
INSERT INTO matching_requests (requester_phone, age_range, town) VALUES
('0712345678', '25-30', 'Nairobi');

-- Insert sample matches
INSERT INTO matches (user_phone, matched_user_phone) VALUES
('0712345678', '0722010203');

-- Insert sample user requests
INSERT INTO user_requests (user_phone, request_type, request_body) VALUES
('0712345678', 'details', 'details#graduate#doctor#single#christian#luo'),
('0712345678', 'self_description', 'MYSELF outgoing, enthusiastic, loves traveling');

-- Insert sample user responses
INSERT INTO user_responses (request_id, response_body) VALUES
(1, 'Your details have been updated.'),
(2, 'Self-description received.');