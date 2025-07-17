"use server";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient.schema(
    z.object({
        doctorId: z.string(),
        date: z.date(),
    })
)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) {
            throw new Error("Unauthorized");
        }
        if (!session.user.clinic) {
            throw new Error("Você precisa estar logado em uma clínica.");
        }

        //Verificar se o médico está disponível nesse dia

        const doctor = await db.query.doctorsTable.findFirst({
            where: eq(doctorsTable.id, parsedInput.doctorId),
        });
        if (!doctor) {
            throw new Error("Médico não encontrado.");
        }

        const selectDayOfWeek = dayjs(parsedInput.date).day();
        const doctorIsAvaialable = selectDayOfWeek >= doctor.availableFromWeekDay &&
            selectDayOfWeek <= doctor.availableToWeekDay;

        if (!doctorIsAvaialable) {
            return [];
        }

        const appointments = await db.query.appointmentsTable.findMany({
            where: eq(appointmentsTable.doctorId, parsedInput.doctorId)
        })

        const appointmentsOnSelectedDate = appointments.filter((appointment) => {
            return dayjs(appointment.date).isSame(parsedInput.date, "day");
        }).map((appointment) => {
            return dayjs(appointment.date).format("HH:mm:ss")
        });

        const timeSlots = generateTimeSlots()

        const doctorAvailableFrom = dayjs().utc().set('hour', Number(doctor.availableFromTime.split(":")[0])).set('minute', Number(doctor.availableFromTime.split(":")[1])).set('second', 0).local();
        const doctorAvailableTo = dayjs().utc().set('hour', Number(doctor.availableToTime.split(":")[0])).set('minute', Number(doctor.availableToTime.split(":")[1])).set('second', 0).local();

        const doctorTimeSlots = timeSlots.filter((time) => {
            const date = dayjs().utc().set('hour', Number(time.split(":")[0])).set('minute', Number(time.split(":")[1])).set('second', 0).local();
            return (
                date.format('HH:mm:ss') >= doctorAvailableFrom.format('HH:mm:ss') &&
                date.format('HH:mm:ss') <= doctorAvailableTo.format('HH:mm:ss')
            )
        })
        return doctorTimeSlots
            .map((time) => ({
                time,
                isAvailable: !appointmentsOnSelectedDate.includes(time),
            }))
            .filter((slot) => slot.isAvailable); // Retorna apenas horários disponíveis

    })