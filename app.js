const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const loadModelBtn = document.getElementById("loadModelBtn");
const container = document.getElementById("container");

const status = document.getElementById("status");
const handsDetected = document.getElementById("hands-detected");

let model = null;

// Set up the webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Load the handpose model
async function loadHandposeModel() {
  model = await handpose.load();
  status.textContent = "Status: Model Loaded";
}

// Detect hands in the video feed
async function detectHands() {
  if (!model) return;

  const predictions = await model.estimateHands(video);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    handsDetected.textContent = `Hands Detected: ${predictions.length}`;

    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;

      // Calculate bounding box
      const xValues = landmarks.map((point) => point[0]);
      const yValues = landmarks.map((point) => point[1]);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      // Draw bounding box
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

      // Draw label
      ctx.fillStyle = "white";
      ctx.font = "15px Arial";
      ctx.fillText("Hand Detected", xMin, yMin - 10);
    });
  } else {
    handsDetected.textContent = "Hands Detected: 0";
  }

  requestAnimationFrame(detectHands);
}

// Initialize the application after the model is loaded
async function initialize() {
  loadModelBtn.disabled = true;
  status.textContent = "Status: Loading model...";

  await loadHandposeModel();
  await setupCamera();

  // Adjust canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  container.style.display = "block"; // Show the video and canvas container
  status.textContent = "Status: Model Loaded and Live";
  detectHands();
}

// Add event listener to the button
loadModelBtn.addEventListener("click", initialize);
