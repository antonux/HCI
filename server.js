const fs = require("fs");
const path = require("path");
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

// Set up your PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "HCI",
  password: "12345",
  port: 5432,
});

app.use(express.static("./public"));

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Or your specific frontend origin
}));
app.use("/photos", express.static(path.join(__dirname, "public", "photos")));

app.post("/api/images", async (req, res) => {
  const { file_path, face_snippet, face_descriptor } = req.body;

  // Decode Base64 string to a binary buffer
  const base64Data = face_snippet.replace(/^data:image\/jpeg;base64,/, "");
  const fileName = path.basename(file_path); // Extract just the file name
  const savePath = path.join(__dirname, "public", "photos", fileName);

  // Ensure the 'photos' directory exists
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    // Save the file to the specified path
    await fs.promises.writeFile(savePath, base64Data, "base64");
    console.log("File saved successfully:", savePath);

    if (!file_path || !face_descriptor) {
      return res
        .status(400)
        .send("Missing required fields: file_path and face_descriptor");
    }

    // Insert the new face into the faces table
    const result = await pool.query(
      "INSERT INTO faces (file_path, face_descriptor) VALUES ($1, $2) RETURNING face_id",
      [file_path, face_descriptor]
    );

    // Return the ID of the newly inserted face
    res.status(201).json({
      message: "Face added successfully",
      face_id: result.rows[0].face_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving file or adding a new face");
  }
});


app.get("/api/images", async (req, res) => {
  try {
    // Fetch face IDs, file paths, and face descriptors from the faces table
    const result = await pool.query(
      "SELECT face_id, file_path, face_descriptor FROM faces"
    );

    // Map the result rows to an array of face ID, file path, and descriptor
    const imagePaths = result.rows.map((row) => ({
      face_id: row.face_id, // Include the face ID for identification
      file_path: row.file_path, // The file path for the image
      face_descriptor: row.face_descriptor, // The face descriptor (in BYTEA format)
    }));

    // Send the image paths and descriptors as a JSON response
    res.json(imagePaths);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching image paths and descriptors");
  }
});

app.post("/api/profiles", async (req, res) => {
  const {
    face_id,
    first_name,
    last_name,
    middle_name,
    age,
    birth_date,
    gender,
    nationality,
    religion,
    civil_status,
    phone_number,
    email,
    present_address,
    permanent_address,
    parent_first_name,
    parent_last_name,
    parent_middle_name,
    parent_phone_number,
    emergency_first_name,
    emergency_last_name,
    emergency_phone_number,
  } = req.body;

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Insert profile data
    const profileResult = await pool.query(
      `INSERT INTO profiles (
        face_id, first_name, last_name, middle_name, age, birth_date, gender, nationality, 
        religion, civil_status, phone_number, email, present_address, permanent_address
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING profile_id`,
      [
        face_id,
        first_name,
        last_name,
        middle_name,
        age,
        birth_date,
        gender,
        nationality,
        religion,
        civil_status,
        phone_number,
        email,
        present_address,
        permanent_address,
      ]
    );
    const profileId = profileResult.rows[0].profile_id;

    // Insert parent data
    await pool.query(
      `INSERT INTO parents (profile_id, first_name, last_name, middle_name, phone_number)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        profileId,
        parent_first_name,
        parent_last_name,
        parent_middle_name,
        parent_phone_number,
      ]
    );

    // Insert emergency contact data
    await pool.query(
      `INSERT INTO emergency_contacts (profile_id, first_name, last_name, phone_number)
      VALUES ($1, $2, $3, $4)`,
      [
        profileId,
        emergency_first_name,
        emergency_last_name,
        emergency_phone_number,
      ]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    res.status(201).json({
      message: "Profile information added successfully",
      profile_id: profileId,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error adding profile information" });
  }
});

app.post("/api/profiles-with-image", async (req, res) => {
  const { file_path, face_snippet, face_descriptor, profileData } = req.body;

  // Decode Base64 string to a binary buffer
  const base64Data = face_snippet.replace(/^data:image\/jpeg;base64,/, "");
  const fileName = path.basename(file_path); // Extract just the file name
  const savePath = path.join(__dirname, "public", "photos", fileName);

  // Ensure the 'photos' directory exists
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    // Save the file to the specified path
    await fs.promises.writeFile(savePath, base64Data, "base64");
    console.log("File saved successfully:", savePath);

    if (!file_path || !face_descriptor || !profileData) {
      return res
        .status(400)
        .send("Missing required fields: file_path, face_descriptor, or profile data");
    }

    // Start a transaction
    await pool.query("BEGIN");

    // Insert the face data into the faces table
    const faceResult = await pool.query(
      "INSERT INTO faces (file_path, face_descriptor) VALUES ($1, $2) RETURNING face_id",
      [file_path, face_descriptor]
    );
    const faceId = faceResult.rows[0].face_id;

    // Insert profile data into the profiles table
    const profileResult = await pool.query(
      `INSERT INTO profiles (
        face_id, first_name, last_name, middle_name, age, birth_date, gender, nationality, 
        religion, civil_status, phone_number, email, present_address, permanent_address
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING profile_id`,
      [
        faceId,
        profileData.first_name,
        profileData.last_name,
        profileData.middle_name,
        profileData.age,
        profileData.birth_date,
        profileData.gender,
        profileData.nationality,
        profileData.religion,
        profileData.civil_status,
        profileData.phone_number,
        profileData.email,
        profileData.present_address,
        profileData.permanent_address,
      ]
    );
    const profileId = profileResult.rows[0].profile_id;

    // Insert parent data
    await pool.query(
      `INSERT INTO parents (profile_id, first_name, last_name, middle_name, phone_number)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        profileId,
        profileData.parent_first_name,
        profileData.parent_last_name,
        profileData.parent_middle_name,
        profileData.parent_phone_number,
      ]
    );

    // Insert emergency contact data
    await pool.query(
      `INSERT INTO emergency_contacts (profile_id, first_name, last_name, phone_number)
      VALUES ($1, $2, $3, $4)`,
      [
        profileId,
        profileData.emergency_first_name,
        profileData.emergency_last_name,
        profileData.emergency_phone_number,
      ]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    res.status(201).json({
      message: "Face and profile information added successfully",
      profile_id: profileId,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error saving file or adding profile information" });
  }
});

app.get("/api/profiles-by-face-id/:faceId", async (req, res) => {
  const { faceId } = req.params;

  try {
    // Fetch profile data by face_id
    const profileResult = await pool.query(
      `SELECT 
        profiles.profile_id,
        profiles.first_name, 
        profiles.last_name, 
        profiles.middle_name, 
        profiles.age, 
        profiles.birth_date, 
        profiles.gender, 
        profiles.nationality, 
        profiles.religion, 
        profiles.civil_status, 
        profiles.phone_number, 
        profiles.email, 
        profiles.present_address, 
        profiles.permanent_address,
        parents.first_name AS parent_first_name,
        parents.last_name AS parent_last_name,
        parents.middle_name AS parent_middle_name,
        parents.phone_number AS parent_phone_number,
        emergency_contacts.first_name AS emergency_first_name,
        emergency_contacts.last_name AS emergency_last_name,
        emergency_contacts.phone_number AS emergency_phone_number
      FROM profiles
      LEFT JOIN parents ON profiles.profile_id = parents.profile_id
      LEFT JOIN emergency_contacts ON profiles.profile_id = emergency_contacts.profile_id
      WHERE profiles.face_id = $1`,  // Use face_id in WHERE clause
      [faceId]
    );

    // Check if profile exists
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = profileResult.rows[0];

    // Send the profile data
    res.status(200).json({
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ message: "Error retrieving profile" });
  }
});



// Set the server to listen on a port (e.g., port 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







// POST API to insert a new face
// app.post('/api/images', async (req, res) => {
//     try {
//         const { file_path, face_descriptor } = req.body;

//         // Validate input
//         if (!file_path || !face_descriptor) {
//             return res.status(400).send('Missing required fields: file_path and face_descriptor');
//         }

//         // Insert the new face into the faces table
//         const result = await pool.query(
//             'INSERT INTO faces (file_path, face_descriptor) VALUES ($1, $2) RETURNING face_id',
//             [file_path, face_descriptor]
//         );

//         // Return the ID of the newly inserted face
//         res.status(201).json({ message: 'Face added successfully', face_id: result.rows[0].face_id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error adding a new face');
//     }
// });





// app.get("/api/images", (req, res) => {
//   const photosPath = path.join(__dirname, "public", "photos");

//   // Read all files in the photos folder
//   fs.readdir(photosPath, (err, files) => {
//     if (err) {
//       console.error("Error reading photos directory:", err);
//       return res.status(500).send("Error reading photos directory");
//     }

//     // Filter out non-image files (optional)
//     const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

//     res.json(imageFiles); // Send image file names as a response
//   });
// });
