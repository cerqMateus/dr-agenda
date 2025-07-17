"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  appointmentPriceInCents: number;
}

interface AddAppointmentButtonProps {
  patients: Patient[];
  doctors: Doctor[];
}

export function AddAppointmentButton({
  patients,
  doctors,
}: AddAppointmentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <UpsertAppointmentForm
          patients={patients}
          doctors={doctors}
          onClose={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
