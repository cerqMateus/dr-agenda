import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { PageContainer } from "@/components/ui/page-container";
import { AddAppointmentButton } from "./components/add-appointment-button";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const [patients, doctors] = await Promise.all([
    db
      .select({
        id: patientsTable.id,
        name: patientsTable.name,
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        appointmentPriceInCents: doctorsTable.appointmentPriceInCents,
      })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, session.user.clinic.id)),
  ]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <AddAppointmentButton patients={patients} doctors={doctors} />
      </div>
    </PageContainer>
  );
}
