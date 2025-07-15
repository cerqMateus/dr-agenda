"use client";

import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import AppointmentsTableActions from "./table-actions";
import { formatCurrencyInCents } from "@/helpers/currency";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
  {
    id: "patient",
    header: "Paciente",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.patient.name;
    },
  },
  {
    id: "doctor",
    header: "Médico",
    cell: (params) => {
      const appointment = params.row.original;
      return `${appointment.doctor.name}`;
    },
  },
  {
    id: "date",
    header: "Data",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.date.toLocaleDateString("pt-BR");
    },
  },
  {
    id: "specialty",
    header: "Especialidade",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.doctor.specialty || "Não especificada";
    },
  },

  {
    id: "time",
    header: "Horário",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    id: "price",
    header: "Valor",
    cell: (params) => {
      const appointment = params.row.original;
      return formatCurrencyInCents(appointment.doctor.appointmentPriceInCents);
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];
