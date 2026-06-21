import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, UploadCloud } from "lucide-react";
import { Medication } from "../types";
import { toast } from "sonner";

interface AddMedicationDialogProps {
  patientId: string;
  onAdd: (medication: Medication) => void;
}

export default function AddMedicationDialog({ patientId, onAdd }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Converts image to Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.error("Please upload a picture of the medicine");
      return;
    }

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      duration: formData.duration,
      instructions: formData.instructions,
      imageUrl: imagePreview,
      prescribedDate: new Date().toISOString(),
      taken: [false, false, false, false, false, false, false], // Fresh 7-day tracker
    };

    onAdd(newMed);
    toast.success("Medicine added and synced to patient!");
    setOpen(false);
    setFormData({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" /> Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prescribe New Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Image Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required={!imagePreview} />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-32 mx-auto object-cover rounded-md" />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <UploadCloud className="w-8 h-8 mb-2" />
                <p>Click or drag to upload medicine picture</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Medicine Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paracetamol" />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input required value={formData.dosage} onChange={(e) => setFormData({...formData, dosage: e.target.value})} placeholder="e.g. 500mg" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input required value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} placeholder="e.g. Twice daily" />
            </div>
            <div>
              <Label>Duration</Label>
              <Input required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 5 days" />
            </div>
            <div className="col-span-2">
              <Label>Instructions</Label>
              <Textarea required value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} placeholder="e.g. Take after meals" />
            </div>
          </div>
          <Button type="submit" className="w-full">Save & Send to Patient</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}