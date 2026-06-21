const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());

// Increase payload size to allow for base64 image uploads
app.use(express.json({ limit: '10mb' })); 

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Configure Groq / OpenRouter based on .env
let aiClient;
let aiModel;

if (process.env.DEFAULT_AI_PROVIDER === 'openrouter') {
  aiClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  });
  aiModel = process.env.DEFAULT_OPENROUTER_MODEL;
} else {
  aiClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  aiModel = process.env.DEFAULT_GROQ_MODEL;
}

const db = {
  patients: [],
  messages: {} 
};

// --- REST API ENDPOINTS ---
app.post('/api/ai-chat', async (req, res) => {
  const { message, patientData } = req.body;
  
  try {
    const completion = await aiClient.chat.completions.create({
      model: aiModel,
      messages: [
        { 
          role: "system", 
          content: `You are an AI Health Assistant talking directly to the patient: ${patientData?.name || 'Patient'}.
          THEIR MEDICAL CONTEXT:
          - Age: ${patientData?.age}, Gender: ${patientData?.gender}, Blood Type: ${patientData?.bloodType}
          - History: ${patientData?.medicalHistory || 'None'}
          - Active Medications: ${patientData?.medications?.map(m => m.name + " (" + m.dosage + ")").join(', ') || 'None'}.
          
          CRITICAL INSTRUCTIONS: 
          1. Answer their health/medication questions directly using their context.
          2. LANGUAGE RULE: If the user speaks in Hindi, you MUST reply entirely in fluent Hindi. If they speak in English, reply in English. Match their language perfectly.
          3. Keep responses helpful, natural, and concise.` 
        },
        { role: "user", content: message }
      ],
    });
    
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

// --- WEBSOCKETS (Live Syncing) ---
io.on('connection', (socket) => {
  
  socket.on('join_room', (patientId) => {
    socket.join(patientId);
    const history = db.messages[patientId] || [];
    socket.emit('chat_history', history);
  });

  socket.on('send_message', (data) => {
    const { patientId, sender, message, timestamp } = data;
    const newMessage = { id: Date.now().toString(), sender, message, timestamp, patientId };
    
    if (!db.messages[patientId]) db.messages[patientId] = [];
    db.messages[patientId].push(newMessage);

    io.to(patientId).emit('receive_message', newMessage);
  });

  // NEW: Sync medication instantly when Doctor uploads
  socket.on('add_medication', (data) => {
    io.to(data.patientId).emit('new_medication', data.medication);
  });

});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));