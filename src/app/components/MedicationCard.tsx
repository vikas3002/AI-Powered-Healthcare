import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle2, Circle, Clock, Info } from "lucide-react";
import { Medication } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";

interface MedicationCardProps {
  medication: Medication;
  onLogIntake: (medicationId: string) => void;
}

export default function MedicationCard({ medication, onLogIntake }: MedicationCardProps) {
  const takenCount = medication.taken.filter((t) => t).length;
  const totalDoses = medication.taken.length;
  const adherenceRate = Math.round((takenCount / totalDoses) * 100);

  const handleLogIntake = () => {
    onLogIntake(medication.id);
    toast.success(`Logged intake for ${medication.name}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={medication.imageUrl}
            alt={medication.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{medication.name}</h3>
                <p className="text-sm text-gray-600">{medication.dosage}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{medication.name}</DialogTitle>
                    <DialogDescription>Medication Details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img
                      src={medication.imageUrl}
                      alt={medication.name}
                      className="w-full h-48 rounded-lg object-cover"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Dosage</p>
                        <p>{medication.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Frequency</p>
                        <p>{medication.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Prescribed Date</p>
                        <p>{new Date(medication.prescribedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p>{medication.duration}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Instructions</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{medication.instructions}</p>
                    </div>
                    {medication.lastTaken && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Taken</p>
                        <p className="text-sm">{new Date(medication.lastTaken).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{medication.frequency}</Badge>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {medication.duration}
                </Badge>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Adherence</span>
                  <span className="font-medium">{adherenceRate}%</span>
                </div>
                <Progress value={adherenceRate} className="h-2" />
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {medication.taken.map((taken, index) => (
                  <div key={index} title={`Day ${index + 1}`}>
                    {taken ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleLogIntake} className="w-full mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Log Medication Taken
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
