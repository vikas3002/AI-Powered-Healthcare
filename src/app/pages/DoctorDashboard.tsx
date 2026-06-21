import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { LogOut, Users, MessageSquare, Activity, TrendingUp } from "lucide-react";
import AddPatientDialog from "../components/AddPatientDialog";
import PatientTable from "../components/PatientTable";
import ChatPanel from "../components/ChatPanel";
import { mockPatients } from "../data/mockData";
import { Patient } from "../types";
import { Toaster } from "../components/ui/sonner";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("patients");

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([...patients, newPatient]);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const totalPatients = patients.length;
  const averageAdherence = Math.round(
    patients.reduce((sum, p) => sum + p.adherenceRate, 0) / patients.length
  );
  const criticalPatients = patients.filter((p) => p.adherenceRate < 75).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Dr. Smith</p>
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
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patient records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Adherence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageAdherence}%</div>
              <p className="text-xs text-muted-foreground">Medication compliance rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalPatients}</div>
              <p className="text-xs text-muted-foreground">Patients below 75% adherence</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Management</CardTitle>
                    <CardDescription>
                      Track and manage patient records and medications
                    </CardDescription>
                  </div>
                  <AddPatientDialog onAddPatient={handleAddPatient} />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="patients">
                      <Users className="w-4 h-4 mr-2" />
                      All Patients
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                      <Activity className="w-4 h-4 mr-2" />
                      Alerts
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="patients">
<PatientTable
                      patients={patients}
                      onSelectPatient={(patient) => {
                        setSelectedPatient(patient);
                        setActiveTab("chat");
                      }}
                      onAddMedication={(patientId, medication) => {
                         // Update local doctor UI
                         setPatients(patients.map(p => 
                           p.id === patientId ? { ...p, medications: [medication, ...p.medications] } : p
                         ));
                         // Send to patient globally
                         import("socket.io-client").then(({ io }) => {
                           const socket = io("http://localhost:5000");
                           socket.emit("add_medication", { patientId, medication });
                         });
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="alerts">
                    <div className="space-y-4">
                      {patients
                        .filter((p) => p.adherenceRate < 75)
                        .map((patient) => (
                          <div
                            key={patient.id}
                            className="p-4 border border-red-200 bg-red-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{patient.name}</h4>
                                <p className="text-sm text-gray-600">
                                  Adherence: {patient.adherenceRate}%
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                Contact
                              </Button>
                            </div>
                          </div>
                        ))}
                      {patients.filter((p) => p.adherenceRate < 75).length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No critical alerts at this time
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Patient Communication
                </CardTitle>
                <CardDescription>Real-time messaging with patients</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] p-0">
                <ChatPanel
                  patient={selectedPatient}
                  userType="doctor"
                  onClose={() => setSelectedPatient(null)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
