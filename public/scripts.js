function openModal() {
  document.getElementById("myModal").style.display = "block";
}
function closeModal() {
  document.getElementById("myModal").style.display = "none";
}
function showRegister() {
  document.getElementById("register-button").style.display = "block";
  document.getElementById("regist").style.display = "none";
}
const fetchImages = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/images");
    if (!response.ok) {
      throw new Error("Failed to fetch images from the server");
    }

    const imageFiles = await response.json();
    if (imageFiles.length === 0) {
      console.warn(
        "No images found on the server. Proceeding to registration."
      );
      return []; // Return an empty array instead of throwing an error
    }

    return imageFiles; // Return the full list of image objects
  } catch (error) {
    console.error("Error fetching images:", error);
    console.warn("Proceeding to registration despite the error.");
    return [];
  }
};

const run = async () => {
  const imageFiles = await fetchImages(); // Get the array of image objects
  console.log(imageFiles);

  let currentImageIndex = 0;
  let recognizedCount = 0;
  let unrecognizedCount = 0;
  const maxAttempts = 10;
  const registerButton = document.getElementById("register-button");
  const openModal = document.getElementById("regist");
  document.getElementById("myModal").style.display = "none";
  // registerButton.style.display = "none"; // Hide register button initially

  let capturedFace = null;
  const videoFeedEl = document.getElementById("video-feed");
  const canvas = document.getElementById("canvas");

  // Start video feed
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  videoFeedEl.srcObject = stream;

  // Load faceapi models
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.ageGenderNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  ]);

  const videoWidth = videoFeedEl.videoWidth;
  const videoHeight = videoFeedEl.videoHeight;

  // Setup canvas
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  canvas.style.left = `${videoFeedEl.offsetLeft}px`;
  canvas.style.top = `${videoFeedEl.offsetTop}px`;

  const processFace = async () => {
    if (imageFiles.length === 0) {
      if (document.getElementById("register-button").style.display === "none") {
      openModal.style.display = "block";
      }

      if (document.getElementById("myModal").style.display === "none") {
        const videoFeedFaceData = await faceapi
          .detectAllFaces(videoFeedEl)
          .withFaceLandmarks()
          .withFaceDescriptors();

        canvas
          .getContext("2d", { willReadFrequently: true })
          .clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, videoFeedFaceData);
        faceapi.draw.drawFaceLandmarks(canvas, videoFeedFaceData);
        console.log("rendering");

        videoFeedFaceData.forEach((face) => {
          const { detection, descriptor } = face;
          capturedFace = { descriptor, detection };
          const drawBox = new faceapi.draw.DrawBox(detection.box);
          drawBox.draw(canvas);
        });
      }
      return setTimeout(processFace, 200);
    } else {
      if (currentImageIndex >= imageFiles.length) return; // Exit if all images have been processed

      const imageFile = imageFiles[currentImageIndex];
      const refFace = await faceapi.fetchImage(`./${imageFile.file_path}`);

      const refFaceAiData = await faceapi
        .detectAllFaces(refFace)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const faceMatcher = new faceapi.FaceMatcher(refFaceAiData);

      const videoFeedFaceData = await faceapi
        .detectAllFaces(videoFeedEl)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (document.getElementById("myModal").style.display === "none") {
        canvas
          .getContext("2d", { willReadFrequently: true })
          .clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, videoFeedFaceData);
        faceapi.draw.drawFaceLandmarks(canvas, videoFeedFaceData);

        videoFeedFaceData.forEach((face) => {
          const { detection, descriptor } = face;
          let bestMatch = null;
          let minDistance = Infinity; // Initialize the minimum distance

          // Iterate through labeled descriptors to find the closest match
          faceMatcher.labeledDescriptors.forEach((labeledDescriptor) => {
            labeledDescriptor.descriptors.forEach((knownDescriptor) => {
              const distance = faceapi.euclideanDistance(
                descriptor,
                knownDescriptor
              );
              if (distance < minDistance) {
                minDistance = distance;
                bestMatch = labeledDescriptor.label;
              }
            });
          });

          // Define a custom threshold for recognizing faces
          const THRESHOLD = 0.4; // Adjust this based on accuracy needs
          const label = minDistance <= THRESHOLD ? bestMatch : "unknown";
          const options =
            label === "unknown"
              ? { label: "Unknown subject..." }
              : { label: `${label} (${minDistance.toFixed(2)})` };

          // Update recognized/unrecognized counts
          if (label === "unknown") {
            unrecognizedCount++;
            console.log(`Not recognized (Distance: ${minDistance.toFixed(2)})`);
            capturedFace = { descriptor, detection };

            if (unrecognizedCount >= maxAttempts) {
              currentImageIndex++;
              unrecognizedCount = 0; // Reset unrecognized count
            }
          } else {
            recognizedCount++;
            console.log(
              `Recognized: ${label} (Distance: ${minDistance.toFixed(2)})`
            );

            if (recognizedCount >= 10) {
              console.log("Recognized face 10 times");
              // console.log(imageFile)
              fetchProfile(imageFile.face_id);
              document.getElementById("myModal").style.display = "block";
              return;
            }
          }

          // Draw the bounding box with the label
          const drawBox = new faceapi.draw.DrawBox(detection.box, options);
          drawBox.draw(canvas);
        });
      }
      // If we've processed all images and none have been recognized 10 times
      if (currentImageIndex >= imageFiles.length && recognizedCount < 10) {
        openModal.style.display = "block";
      }
    }
  };

  // Start the face detection process
  setInterval(processFace, 200);

  // Handle the registration button click event
  registerButton.addEventListener("click", async () => {
    if (!capturedFace) return;

    const formData = {
      first_name: document.getElementById("first_name").value.trim(),
      last_name: document.getElementById("last_name").value.trim(),
      middle_name: document.getElementById("middle_name").value.trim(),
      age: parseInt(document.getElementById("age").value.trim()) || null,
      birth_date: document.getElementById("birth_date").value.trim(),
      gender: document.getElementById("gender").value.trim(),
      nationality: document.getElementById("nationality").value.trim(),
      religion: document.getElementById("religion").value.trim(),
      civil_status: document.getElementById("civil_status").value.trim(),
      phone_number: document.getElementById("phone_number").value.trim(),
      email: document.getElementById("email").value.trim(),
      present_address: document.getElementById("present_address").value.trim(),
      permanent_address: document
        .getElementById("permanent_address")
        .value.trim(),
      parent_first_name: document
        .getElementById("parent_first_name")
        .value.trim(),
      parent_last_name: document
        .getElementById("parent_last_name")
        .value.trim(),
      parent_middle_name: document
        .getElementById("parent_middle_name")
        .value.trim(),
      parent_phone_number: document
        .getElementById("parent_phone_number")
        .value.trim(),
      emergency_first_name: document
        .getElementById("emergency_first_name")
        .value.trim(),
      emergency_last_name: document
        .getElementById("emergency_last_name")
        .value.trim(),
      emergency_phone_number: document
        .getElementById("emergency_phone_number")
        .value.trim(),
    };

    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = videoFeedEl.videoWidth;
    snapshotCanvas.height = videoFeedEl.videoHeight;
    snapshotCanvas
      .getContext("2d", { willReadFrequently: true })
      .drawImage(
        videoFeedEl,
        0,
        0,
        snapshotCanvas.width,
        snapshotCanvas.height
      );

    const faceSnippet = snapshotCanvas.toDataURL("image/jpeg");

    try {
      const response = await fetch(
        "http://localhost:3000/api/profiles-with-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_path: `photos/face_${Date.now()}.jpg`,
            face_snippet: faceSnippet,
            face_descriptor: Array.from(capturedFace.descriptor),
            profileData: formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save profile with face data");
      }

      const data = await response.json();
      console.log("Profile registered successfully:", data);
      alert("Profile registered successfully!");
    } catch (error) {
      alert("Profile registered successfully!");
    } finally {
      unrecognizedCount = 0;
      recognizedCount = 0;
      isPaused = false;
      registerButton.style.display = "none";
    }
  });
};

const fetchProfile = async (faceId) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/profiles-by-face-id/${faceId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    console.log("Profile Data:", data.profile);

    // Populate the form fields with the retrieved data
    document.getElementById("first_name").value = data.profile.first_name || "";
    document.getElementById("last_name").value = data.profile.last_name || "";
    document.getElementById("middle_name").value =
      data.profile.middle_name || "";
    document.getElementById("age").value = data.profile.age || "";
    document.getElementById("birth_date").value = data.profile.birth_date || "";
    document.getElementById("gender").value = data.profile.gender || "";
    document.getElementById("nationality").value =
      data.profile.nationality || "";
    document.getElementById("religion").value = data.profile.religion || "";
    document.getElementById("civil_status").value =
      data.profile.civil_status || "";
    document.getElementById("phone_number").value =
      data.profile.phone_number || "";
    document.getElementById("email").value = data.profile.email || "";
    document.getElementById("present_address").value =
      data.profile.present_address || "";
    document.getElementById("permanent_address").value =
      data.profile.permanent_address || "";
    document.getElementById("parent_first_name").value =
      data.profile.parent_first_name || "";
    document.getElementById("parent_last_name").value =
      data.profile.parent_last_name || "";
    document.getElementById("parent_middle_name").value =
      data.profile.parent_middle_name || "";
    document.getElementById("parent_phone_number").value =
      data.profile.parent_phone_number || "";
    document.getElementById("emergency_first_name").value =
      data.profile.emergency_first_name || "";
    document.getElementById("emergency_last_name").value =
      data.profile.emergency_last_name || "";
    document.getElementById("emergency_phone_number").value =
      data.profile.emergency_phone_number || "";
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

run();
