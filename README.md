# 🏥 AI-Powered Healthcare Dashboard

A comprehensive full-stack healthcare application featuring real-time doctor-patient communication, an intelligent voice-enabled AI assistant, and live medication syncing. 

This project bridges the gap between healthcare providers and patients through real-time WebSockets and advanced LLM integrations (Groq/OpenRouter), supporting seamless bilingual (English and Hindi) voice interactions.
---

## ✨ Key Features

*   **👨‍⚕️ Dual Dashboards:** Dedicated, role-based interfaces for Doctors (managing multiple patients) and Patients (viewing personal health data and medications).
*   **💬 Real-Time Live Chat:** Instant messaging between doctors and patients using WebSockets (`socket.io`).
*   **🤖 Context-Aware AI Assistant:** An integrated chatbot that reads the patient's medical history and active prescriptions to provide safe, personalized health advice.
*   **🎙️ Auto-Voice AI Chatbot (Bilingual):** 
    *   Speak directly to the AI using your microphone.
    *   Automatically detects when you stop speaking and sends the message.
    *   Responds aloud using Text-to-Speech.
    *   Supports both **English** and **Hindi** based on a simple UI toggle.
*   **💊 Live Medication Prescriptions:** Doctors can upload a picture of a medication, set dosages, and prescribe it. It instantly pops up on the patient's dashboard without refreshing the page.
*   **📊 Adherence Tracking:** Patients can log their daily intakes, and the system automatically calculates their adherence rate.

---

## 🛠️ Tech Stack

**Frontend**
*   [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/) for styling
*   [Radix UI](https://www.radix-ui.com/) / shadcn-ui components
*   [Socket.io-client](https://socket.io/) for real-time events
*   Web Speech API (Native browser STT & TTS)

**Backend**
*   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
*   [Socket.io](https://socket.io/) for WebSocket management
*   [OpenAI SDK](https://github.com/openai/openai-node) (Configured for Groq/OpenRouter)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
```bash
   cd backend
