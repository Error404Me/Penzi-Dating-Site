import sql from "mssql";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());
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

// Helper function to log query parameters
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
    // Check if the phone number already exists in the database
    const checkQuery = `SELECT COUNT(*) AS count FROM users WHERE phone = @phone`;
    const checkRequest = new sql.Request();
    checkRequest.input("phone", sql.VarChar, phoneNumber);
    const checkResult = await checkRequest.query(checkQuery);
    const phoneExists = checkResult.recordset[0].count > 0;

    if (phoneExists) {
      console.log("Phone number already activated.");
      res.status(200).send("Your phone number is already activated.");
    } else {
      console.log("Activating service");
      sendSMS(
        phoneNumber,
        "Welcome to our dating service with 6000 potential dating partners! To register SMS start#name#age#gender#county#town to 22141. E.g., start#John Doe#26#Male#Nakuru#Naivasha"
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

  const { payload,phoneNumber } = req.body;

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
    const query = `
      INSERT INTO users (phone,name, age, gender, county, town) 
      VALUES (@phone,@name, @age, @gender, @county, @town)`;

    const request = new sql.Request();
    request.input("phone", sql.VarChar, phoneNumber);

    request.input("name", sql.VarChar, name);
    request.input("age", sql.Int, parseInt(age)); 
    request.input("gender", sql.VarChar, gender);
    request.input("county", sql.VarChar, county);
    request.input("town", sql.VarChar, town);

    // Log the query parameters
    logQueryParameters({
      phone: phoneNumber,
      name: name,
      age: age,
      gender: gender,
      county: county,
      town: town,
    });

    await request.query(query);

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
  const { payload, phoneNumber } = req.body; // Extract payload and phoneNumber from request body
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
    // Check if the user exists
    const checkQuery = `SELECT COUNT(*) AS count FROM users WHERE phone = @phoneNumber`;
    const checkRequest = new sql.Request();
    checkRequest.input("phoneNumber", sql.VarChar, phoneNumber); // Use phoneNumber to check user existence
    const checkResult = await checkRequest.query(checkQuery);
    const userExists = checkResult.recordset[0].count > 0;

    if (!userExists) {
      console.log("User does not exist.");
      return res.status(400).send("No user found.");
    }

    // Update user details
    const query = `
      UPDATE users 
      SET level_of_education = @levelOfEducation, 
          profession = @profession, 
          marital_status = @maritalStatus, 
          religion = @religion, 
          ethnicity = @ethnicity 
      WHERE phone = @phoneNumber`;

    const request = new sql.Request();
    request.input("levelOfEducation", sql.VarChar, levelOfEducation);
    request.input("profession", sql.VarChar, profession);
    request.input("maritalStatus", sql.VarChar, maritalStatus);
    request.input("religion", sql.VarChar, religion);
    request.input("ethnicity", sql.VarChar, ethnicity);
    request.input("phoneNumber", sql.VarChar, phoneNumber); // Add phoneNumber input

    // Log the query parameters
    logQueryParameters({
      levelOfEducation: levelOfEducation,
      profession: profession,
      maritalStatus: maritalStatus,
      religion: religion,
      ethnicity: ethnicity,
      phoneNumber: phoneNumber, // Log phoneNumber
    });

    await request.query(query);

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
    const request = new sql.Request();
    request.input("description", sql.VarChar, description);
    request.input("phoneNumber", sql.VarChar, phoneNumber);

    // Log the query parameters
    logQueryParameters({
      description: description,
      phoneNumber: phoneNumber,
    });

    const query = `
      UPDATE users 
      SET description = @description 
      WHERE phone = @phoneNumber`;

    await request.query(query);

    console.log("Self-description updated successfully.");

    // Send confirmation SMS
    sendSMS(
      "Self-description registered successfully. To search for a MPENZI, SMS match#age#town to 22141."

    );

    res.status(200).send( "You are now registered for dating. To search for a MPENZI, SMS match#age#town to 22141 and meet the person of your dreams. E.g., match#23-25#Kisumu");
  } catch (err) {
    console.error("Error updating self-description:", err);
    res.status(500).send(`Error updating self-description: ${err.message}`);
  }
};



// Handle Matching Request
const handleMatchingRequest = async (req, res) => {
  const { payload } = req.body;

  // Ensure payload is provided
  if (!payload) {
    console.error("Payload is missing.");
    return res.status(400).send("Payload is missing.");
  }

  // Split payload into parts
  const parts = payload.split("#");
  if (parts.length !== 3) {
    console.error("Invalid payload format.");
    return res.status(400).send("Invalid payload format. Expected format: match#ageRange#town");
  }

  const [command, ageRange, town] = parts;

  // Validate command
  if (command !== "match") {
    console.error(`Invalid command received: ${command}`);
    return res.status(400).send(`Invalid command received: ${command}. Expected 'match'.`);
  }

  // Validate and parse age range
  const [minAge, maxAge] = ageRange.split("-");
  if (!minAge || !maxAge || isNaN(minAge) || isNaN(maxAge)) {
    console.error("Invalid age range format.");
    return res.status(400).send("Invalid age range format. Expected format: minAge-maxAge");
  }

  try {
    // Fetch initial matches
    const query = `
      SELECT TOP 3 name, age
      FROM users
      WHERE age BETWEEN @minAge AND @maxAge
        AND town = @town
      ORDER BY NEWID(); -- Randomize results if needed
    `;

    const request = new sql.Request();
    request.input("minAge", sql.Int, parseInt(minAge));
    request.input("maxAge", sql.Int, parseInt(maxAge));
    request.input("town", sql.VarChar, town);

    const result = await request.query(query);
    const matches = result.recordset;

    if (matches.length === 0) {
      console.log("No matches found.");
      return res.status(200).send("No matches found for the given criteria.");
    }

    // Construct SMS message with match details
    const message = `
      We have ${matches.length} matches for you! Here are the details of 3 of them:
      ${matches.map(match => `${match.name} aged ${match.age}.`).join("\n")}
      Send NEXT to 22141 to receive details of more matches.
    `;

    // Send SMS with match details
    sendSMS(message);
    res.status(200).send(message);
  } catch (err) {
    console.error("Error fetching matching users:", err);
    res.status(500).send(`Error fetching matching users: ${err.message}`);
  }
};
// Handle Subsequent Details
const handleSubsequentDetails = async (req, res) => {
  const { payload } = req.body; // Extract payload from request body
  const [command, page] = payload.split("#"); // Assume page is passed to determine offset

  if (command !== "NEXT") {
    return res.status(400).send(`Invalid command received: ${command}`);
  }

  // Default page size and page number
  const pageSize = 3; // Number of results per page
  const pageNumber = parseInt(page, 10) || 1; // Page number, defaults to 1

  // Calculate offset
  const offset = (pageNumber - 1) * pageSize;

  try {
    // Fetch subsequent matches with dynamic pagination
    const query = `
      SELECT name, age
      FROM users
      WHERE age BETWEEN @minAge AND @maxAge
        AND town = @town
      ORDER BY name
      OFFSET @offset ROWS
      FETCH NEXT @fetch ROWS ONLY;
    `;

    const request = new sql.Request();
    request.input("minAge", sql.Int, 23); 
    request.input("maxAge", sql.Int, 25); 
    request.input("town", sql.VarChar, "Kisumu"); 
    request.input("offset", sql.Int, offset); // Dynamic offset
    request.input("fetch", sql.Int, pageSize); // Fetch the number of results per page

    const result = await request.query(query);
    const matches = result.recordset;

    // Check if there are no more matches to show
    if (matches.length === 0) {
      const message = "No more matches available.";
      sendSMS(message);
      return res.status(200).send(message);
    }

    // Send SMS with match details
    const message = `
      ${matches.map(match => `${match.name} aged ${match.age}.`).join("\n")}
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
  const [command, phoneNumber] = payload.split("#"); // Expecting phoneNumber in the payload for user identification

  console.log(`Handling user confirmation: ${payload}`);

  if (command !== "YES") {
    console.log("Invalid command.");
    return res.status(400).send(`Invalid command received: ${command}`);
  }

  try {
    // Fetch user details from the database
    const query = `
      SELECT name, age, county, town, level_of_education, profession, marital_status, religion, ethnicity
      FROM users
      WHERE phone = @phoneNumber
    `;

    const request = new sql.Request();
    request.input("phoneNumber", sql.VarChar, phoneNumber);

    const result = await request.query(query);
    const user = result.recordset[0];

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
    // Example messages; replace with actual database logic
    const messages = [
      { text: 'Congratulations👏Welcome To Our Dating Service! Please enter your phone number, ensuring it starts with 07 or 01 and is exactly 10 digits long e.g., 0712345678 or 0112345678 To Get Started' , sender: 'Onfon' },
      // Add more example messages or fetch from database
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
