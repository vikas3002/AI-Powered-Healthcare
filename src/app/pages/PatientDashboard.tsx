import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { LogOut, Pill, MessageSquare, Calendar, Activity } from "lucide-react";
import MedicationCard from "../components/MedicationCard";
import ChatPanel from "../components/ChatPanel";
import { mockMedications, mockPatients } from "../data/mockData";
import { Patient, Medication } from "../types";
import { Toaster } from "../components/ui/sonner";

export default function PatientDashboard() {
  const navigate = useNavigate();
  
  // Using the first patient as the logged-in user
  const [currentPatient, setCurrentPatient] = useState<Patient>({
    ...mockPatients[0],
    medications: mockMedications,
  });

  // NEW: Listen for real-time medication additions from the Doctor
  useEffect(() => {
    if (!currentPatient.id) return;
    
    const socket = io("http://localhost:5000");
    socket.emit("join_room", currentPatient.id);

    socket.on("new_medication", (medication: Medication) => {
      setCurrentPatient(prev => ({
        ...prev, 
        medications: [medication, ...prev.medications]
      }));
      toast.success(`Your doctor prescribed a new medicine: ${medication.name}!`);
    });

    return () => { 
      socket.disconnect(); 
    };
  }, [currentPatient.id]);

  const handleLogout = () => {
    navigate("/");
  };

  const handleLogIntake = (medicationId: string) => {
    setCurrentPatient((prev) => ({
      ...prev,
      medications: prev.medications.map((med) => {
        if (med.id === medicationId) {
          // Update the last day's intake
          const newTaken = [...med.taken];
          const lastIndex = newTaken.length - 1;
          if (!newTaken[lastIndex]) {
            newTaken[lastIndex] = true;
          }
          return {
            ...med,
            taken: newTaken,
            lastTaken: new Date().toISOString(),
          };
        }
        return med;
      }),
    }));

    // Recalculate adherence rate
    setTimeout(() => {
      setCurrentPatient((prev) => {
        const totalTaken = prev.medications.reduce(
          (sum, med) => sum + med.taken.filter((t) => t).length,
          0
        );
        const totalDoses = prev.medications.reduce((sum, med) => sum + med.taken.length, 0);
        return {
          ...prev,
          adherenceRate: Math.round((totalTaken / totalDoses) * 100),
        };
      });
    }, 100);
  };

  const upcomingDoses = currentPatient.medications.length;
  const todaysTaken = currentPatient.medications.filter(
    (med) => med.taken[med.taken.length - 1]
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Health Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {currentPatient.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Adherence Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPatient.adherenceRate}%</div>
              <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todaysTaken}/{upcomingDoses}
              </div>
              <p className="text-xs text-muted-foreground">Doses taken today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPatient.medications.length}</div>
              <p className="text-xs text-muted-foreground">Current medications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Medications</CardTitle>
                <CardDescription>
                  Track and manage your prescribed medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPatient.medications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onLogIntake={handleLogIntake}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>My Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p>{currentPatient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p>{currentPatient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Type</p>
                    <p>{currentPatient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{currentPatient.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500 mb-2">Medical History</p>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {currentPatient.medicalHistory}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[700px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Health Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your health and medications
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)] p-0">
                <ChatPanel
                  patient={currentPatient}
                  userType="patient"
                  onClose={() => {}}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}