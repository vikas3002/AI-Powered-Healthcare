import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageSquare, Eye } from "lucide-react";
import { Patient, Medication } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import AddMedicationDialog from "./AddMedicationDialog";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddMedication: (patientId: string, medication: Medication) => void;
}

export default function PatientTable({ patients, onSelectPatient, onAddMedication }: PatientTableProps) {
  
  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Blood Type</TableHead>
            <TableHead>Medications</TableHead>
            <TableHead>Adherence Rate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{patient.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell><Badge variant="outline">{patient.bloodType}</Badge></TableCell>
              <TableCell>
                <div className="space-y-1">
                  {patient.medications.slice(0, 2).map((med) => (
                    <div key={med.id} className="text-sm">{med.name}</div>
                  ))}
                  {patient.medications.length > 2 && <div className="text-sm text-gray-500">+{patient.medications.length - 2} more</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getAdherenceColor(patient.adherenceRate)}`} style={{ width: `${patient.adherenceRate}%` }} />
                  </div>
                  <Badge>{patient.adherenceRate}%</Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{patient.name}'s File</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div><p className="text-sm text-gray-500">Phone</p><p>{patient.phone}</p></div>
                          <div><p className="text-sm text-gray-500">Medical History</p><p>{patient.medicalHistory}</p></div>
                        </div>
                        
                        {/* MEDICATION SECTION WITH ADD BUTTON */}
                        <div>
                          <div className="flex items-center justify-between mb-4 mt-6 border-t pt-4">
                            <p className="font-semibold text-lg text-gray-800">Prescribed Medications</p>
                            <AddMedicationDialog patientId={patient.id} onAdd={(med) => onAddMedication(patient.id, med)} />
                          </div>
                          <div className="space-y-3">
                            {patient.medications.map((med) => (
                              <div key={med.id} className="flex items-center gap-4 p-3 border rounded-lg bg-white shadow-sm">
                                <img src={med.imageUrl} alt={med.name} className="w-16 h-16 rounded-md object-cover border" />
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900">{med.name} <span className="font-normal text-sm text-gray-500">({med.dosage})</span></p>
                                  <p className="text-sm text-gray-600">{med.frequency} • {med.instructions}</p>
                                </div>
                              </div>
                            ))}
                            {patient.medications.length === 0 && <p className="text-sm text-gray-500">No medications prescribed yet.</p>}
                          </div>
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={() => onSelectPatient(patient)}><MessageSquare className="w-4 h-4 mr-1" /> Chat</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}