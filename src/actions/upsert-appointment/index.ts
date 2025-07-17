"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
    .schema(upsertAppointmentSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        if (!session?.user.clinic?.id) {
            throw new Error("Clinic not found");
        }

        await db
            .insert(appointmentsTable)
            .values({
                ...parsedInput,
                clinicId: session.user.clinic.id,
            })
            .onConflictDoUpdate({
                target: [appointmentsTable.id],
                set: {
                    ...parsedInput,
                },
            });

        revalidatePath("/appointments");
    });
