export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  medicalHistory: string;
  medications: Medication[];
  adherenceRate: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  imageUrl: string;
  prescribedDate: string;
  duration: string;
  instructions: string;
  taken: boolean[];
  lastTaken?: string;
}

export interface ChatMessage {
  id: string;
  sender: "doctor" | "patient" | "ai";
  message: string;
  timestamp: string;
  patientId?: string;
}