import mysql from "mysql2/promise";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password', 
  database: 'Penzi_Dating_Site'
});

// List of valid counties
const validCounties = [
  "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kisii", "Kisumu", "Kitui", "Kwale",
  "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru",
  "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Narus",
  "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River",
  "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir",
  "West Pokot", "Wote"
];

const logQueryParameters = (params) => {
  console.log("Query Parameters:", params);
};

// Send SMS function
const sendSMS = (message) => {
  console.log(`Sending SMS: ${message}`);
};

// Activate Service
const activateService = async (req, res) => {
  const { phoneNumber } = req.body;

  // Check if phoneNumber is provided
  if (!phoneNumber) {
    console.error("Phone number is missing.");
    return res.status(400).send("Phone number is missing.");
  }

  // Validate phoneNumber format
  const phoneRegex = /^(07|01)\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    console.error("Invalid phone number format.");
    return res.status(400).send("Invalid phone number format. Ensure it starts with 07 or 01 and is 10 digits long.");
  }

  console.log('Received phoneNumber:', phoneNumber);

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT COUNT(*) AS count FROM users WHERE phone = ?',
      [phoneNumber]
    );
    connection.release();

    const phoneExists = rows[0].count > 0;

    if (phoneExists) {
      console.log("Phone number already activated.");
      res.status(200).send("Your phone number is already activated.");
    } else {
      console.log("Activating service");
      sendSMS(
        `Welcome to our dating service with 6000 potential dating partners! To register SMS start#name#age#gender#county#town to 22141. E.g., start#John Doe#26#Male#Nakuru#Naivasha`
      );
      res.status(200).send("Welcome to our dating service with 6000 potential dating partners! To register SMS start#name#age#gender#county#town to 22141. E.g., start#John Doe#26#Male#Nakuru#Naivasha");
    }
  } catch (err) {
    console.error("Error during activation:", err);
    res.status(500).send(`Error during activation: ${err.message}`);
  }
};

// Register User
const registerUser = async (req, res) => {
  console.log("Received request body:", req.body);

  const { payload, phoneNumber } = req.body;

  // Check if 'payload' is undefined or null
  if (!payload) {
    console.error("Payload is missing in the request body.");
    return res.status(400).send("Payload is missing.");
  }

  console.log(`Payload: ${payload}`);
  
  const [command, name, age, gender, county, town] = payload.split("#");

  // Additional validation to ensure the correct number of parameters
  if (command !== "start" || !name || !age || !gender || !county || !town) {
    console.error("Invalid payload format.");
    return res.status(400).send("Invalid payload format.");
  }

  console.log(command, name, age, gender, county, town);

  try {
    const connection = await pool.getConnection();
    const query = `
      INSERT INTO users (phone, name, age, gender, county, town) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [phoneNumber, name, parseInt(age), gender, county, town]);
    connection.release();

    // Log the query parameters
    logQueryParameters({
      phone: phoneNumber,
      name: name,
      age: age,
      gender: gender,
      county: county,
      town: town,
    });

    console.log(`User ${name} registered successfully.`);
    sendSMS(
      "User registered and details request message sent."
    );
    res.status(200).send(`Your profile has been created successfully ${name}. SMS details#levelOfEducation#profession#maritalStatus#religion#ethnicity to 22141. E.g., details#diploma#driver#single#christian#mijikenda`);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send(`Error registering user: ${err.message}`);
  }
};

// Register Details
const registerDetails = async (req, res) => {
  const { payload, phoneNumber } = req.body;
  const [
    command,
    levelOfEducation,
    profession,
    maritalStatus,
    religion,
    ethnicity,
  ] = payload.split("#");

  console.log(`Registering details: ${payload}`);

  if (command !== "details") {
    console.log("Invalid command.");
    return res.status(400).send(`Invalid command received: ${command}`);
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT COUNT(*) AS count FROM users WHERE phone = ?',
      [phoneNumber]
    );
    
    const userExists = rows[0].count > 0;

    if (!userExists) {
      console.log("User does not exist.");
      return res.status(400).send("No user found.");
    }

    const query = `
      UPDATE users 
      SET level_of_education = ?, 
          profession = ?, 
          marital_status = ?, 
          religion = ?, 
          ethnicity = ? 
      WHERE phone = ?
    `;

    await connection.execute(query, [levelOfEducation, profession, maritalStatus, religion, ethnicity, phoneNumber]);
    connection.release();

    // Log the query parameters
    logQueryParameters({
      levelOfEducation: levelOfEducation,
      profession: profession,
      maritalStatus: maritalStatus,
      religion: religion,
      ethnicity: ethnicity,
      phoneNumber: phoneNumber,
    });

    console.log("Details updated successfully.");
    sendSMS(
      "Details registered and self-description request message sent."
    );
    res.status(200).send("This is the last stage of registration. SMS a brief description of yourself to 22141 starting with the word MYSELF. E.g., MYSELF#chocolate, lovely, sexy etc.");
  } catch (err) {
    console.error("Error updating details:", err);
    res.status(500).send(`Error updating details: ${err.message}`);
  }
};

// Register Self-Description
const registerSelfDescription = async (req, res) => {
  const { payload, phoneNumber } = req.body;

  // Ensure 'payload' and 'phoneNumber' are provided
  if (!payload || !phoneNumber) {
    console.error("Missing payload or phone number.");
    return res.status(400).send("Payload or phone number is missing.");
  }

  // Parse the payload
  const parts = payload.split("#");
  
  if (parts.length !== 2) {
    console.error("Invalid payload format.");
    return res.status(400).send("Invalid payload format. Expected format: MYSELF#description");
  }

  const [command, description] = parts;

  console.log(`Registering self-description: ${payload}`);

  if (command !== "MYSELF") {
    console.error(`Invalid command received: ${command}`);
    return res.status(400).send(`Invalid command received: ${command}. Expected 'MYSELF'.`);
  }

  try {
    const connection = await pool.getConnection();
    const query = `
      UPDATE users 
      SET description = ? 
      WHERE phone = ?
    `;
    await connection.execute(query, [description, phoneNumber]);
    connection.release();

    console.log("Self-description updated successfully.");

    // Send confirmation SMS
    sendSMS(
      "Self-description registered successfully. To search for a MPENZI, SMS match#age#town to 22141."
    );

    res.status(200).send("You are now registered for dating. To search for a MPENZI, SMS match#age#town to 22141 and meet the person of your dreams. E.g., match#23-25#Kisumu");
  } catch (err) {
    console.error("Error updating self-description:", err);
    res.status(500).send(`Error updating self-description: ${err.message}`);
  }
};

// Handle Matching Request
const handleMatchingRequest = async (req, res) => {
  const { payload } = req.body;

  // Ensure 'payload' is provided
  if (!payload) {
    console.error("Payload is missing.");
    return res.status(400).send("Payload is missing.");
  }

  const [command, ageRange, town] = payload.split("#");

  if (command !== "match" || !ageRange || !town) {
    console.error("Invalid payload format.");
    return res.status(400).send("Invalid payload format.");
  }

  console.log(`Handling matching request: ${payload}`);

  // Validate town
  if (!validCounties.includes(town)) {
    console.error("Invalid town.");
    return res.status(400).send("Invalid town. Please provide a valid town from the list of valid counties.");
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `
      SELECT name, age, gender, county, town, description 
      FROM users 
      WHERE age BETWEEN ? AND ? AND town = ? AND gender != (SELECT gender FROM users WHERE phone = ?)
      `,
      [...ageRange.split("-").map(Number), town, phoneNumber]
    );
    connection.release();

    // Log the query parameters
    logQueryParameters({
      ageRange: ageRange,
      town: town,
      phoneNumber: phoneNumber,
    });

    if (rows.length === 0) {
      console.log("No matches found.");
      return res.status(200).send("No matches found.");
    }

    console.log("Matches found:", rows);
    sendSMS("Matches found. Check your profile for details.");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error handling matching request:", err);
    res.status(500).send(`Error handling matching request: ${err.message}`);
  }
};
// Handle Subsequent Details
const handleSubsequentDetails = async (req, res) => {
  const { payload } = req.body; 
  const [command, page] = payload.split("#"); 

  if (command !== "NEXT") {
    return res.status(400).send(`Invalid command received: ${command}`);
  }

  // Default page size and page number
  const pageSize = 3; 
  const pageNumber = parseInt(page, 10) || 1; 

  // Calculate offset
  const offset = (pageNumber - 1) * pageSize;

  try {
    const connection = await pool.getConnection();

    // Fetch subsequent matches with dynamic pagination
    const [rows] = await connection.execute(
      `
      SELECT name, age
      FROM users
      WHERE age BETWEEN ? AND ?
        AND town = ?
      ORDER BY name
      LIMIT ? OFFSET ?;
      `,
      [23, 25, "Kisumu", pageSize, offset] 
    );

    connection.release();

    // Check if there are no more matches to show
    if (rows.length === 0) {
      const message = "No more matches available.";
      sendSMS(message);
      return res.status(200).send(message);
    }

    // Send SMS with match details
    const message = `
      ${rows.map(match => `${match.name} aged ${match.age}.`).join("\n")}
      Send NEXT to 22141 to receive details of more matches.
    `;

    sendSMS(message);
    res.status(200).send(message);
  } catch (err) {
    console.error("Error fetching subsequent users:", err);
    res.status(500).send(`Error fetching subsequent users: ${err.message}`);
  }
};




// Handle User Confirmation
const handleUserConfirmation = async (req, res) => {
  const { payload } = req.body;
  const [command, phoneNumber] = payload.split("#"); 
  console.log(`Handling user confirmation: ${payload}`);

  if (command !== "YES") {
    console.log("Invalid command.");
    return res.status(400).send(`Invalid command received: ${command}`);
  }

  try {
    const connection = await pool.getConnection();

    // Fetch user details from the database
    const [rows] = await connection.execute(
      `
      SELECT name, age, county, town, level_of_education, profession, marital_status, religion, ethnicity
      FROM users
      WHERE phone = ?
      `,
      [phoneNumber]
    );

    connection.release();

    const user = rows[0];

    if (!user) {
      console.log("User not found.");
      return res.status(404).send("User not found.");
    }

    // Format the user information
    const userInfo = `
      ${user.name} aged ${user.age}, ${user.county}, ${user.town}
      Level of Education: ${user.level_of_education}
      Profession: ${user.profession}
      Marital Status: ${user.marital_status}
      Religion: ${user.religion}
      Ethnicity: ${user.ethnicity}
    `;

    // Send SMS with user details
    const smsMessage = `
      User confirmation processed.
      ${userInfo}
      Send DESCRIBE to get more details about ${user.name}.
    `;

    sendSMS(smsMessage);

    // Send response
    res.status(200).send(smsMessage);
  } catch (err) {
    console.error("Error handling user confirmation:", err);
    res.status(500).send(`Error handling user confirmation: ${err.message}`);
  }
};


// Fetch messages
const fetchMessages = async (req, res) => {
  try {
    const messages = [
      { text: 'Congratulations👏Welcome To Our Dating Service! Please enter your phone number, ensuring it starts with 07 or 01 and is exactly 10 digits long e.g., 0712345678 or 0112345678 To Get Started' , sender: 'Onfon' },
      
    ];
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
};

// Send message
const sendMessage = async (req, res) => {
  const { text } = req.body;

  try {
    let response = 'Message received';

    // Example logic; replace with actual message handling
    if (text.startsWith('match')) {
      response = 'Matching request processed.';
    } else if (text.startsWith('NEXT')) {
      response = 'Here are more details...';
    }

    res.status(200).json({ response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error sending message');
  }
};
// Export functions
export {
  activateService,
  registerUser,
  registerDetails,
  registerSelfDescription,
  handleMatchingRequest,
  handleSubsequentDetails,
  handleUserConfirmation,
  fetchMessages,
  sendMessage
};
