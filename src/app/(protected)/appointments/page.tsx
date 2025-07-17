import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable, patientsTable, appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { PageContainer } from "@/components/ui/page-container";
import { DataTable } from "@/components/data-table";
import { appointmentsTableColumns } from "./components/table-columns";
import AddAppointmentButton from "./components/add-appointment-button";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session.user.clinic.id),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: desc(appointmentsTable.date),
    }),
  ]);

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <AddAppointmentButton patients={patients} doctors={doctors} />
      </div>
      <DataTable data={appointments} columns={appointmentsTableColumns} />
    </PageContainer>
  );
}
