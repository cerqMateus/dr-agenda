"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
    .schema(upsertAppointmentSchema)
    .action(async ({ parsedInput: appointment }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.clinic) {
            throw new Error("Você precisa estar logado em uma clínica.");
        }

        if (appointment.id) {
            await db
                .update(appointmentsTable)
                .set({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    date: appointment.date,
                    updatedAt: new Date(),
                })
                .where(eq(appointmentsTable.id, appointment.id));
        } else {
            await db.insert(appointmentsTable).values({
                clinicId: session.user.clinic.id,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                date: appointment.date,
            });
        }

        revalidatePath("/appointments");
    });
