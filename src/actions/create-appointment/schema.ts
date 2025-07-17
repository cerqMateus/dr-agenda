import { z } from "zod";

export const upsertAppointmentSchema = z.object({
    id: z.string().uuid().optional(),
    patientId: z.string().min(1, "Paciente é obrigatório."),
    doctorId: z.string().min(1, "Médico é obrigatório."),
    appointmentPriceInCents: z.number().int().positive({
        message: "Valor da consulta deve ser maior que zero.",
    }),
    date: z.date(),
});

export type UpsertAppointmentData = z.infer<typeof upsertAppointmentSchema>;
