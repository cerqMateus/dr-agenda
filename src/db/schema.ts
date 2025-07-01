import { create } from "domain";
import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
    usersToClinics: many(usersToClinicsTable),
}))

export const clinicsTable = pgTable("clinics", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
})

export const usersToClinicsTable = pgTable("users_to_clinics", {
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
})

export const usersToClinicsTableRelations = relations(usersToClinicsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [usersToClinicsTable.userId],
        references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
        fields: [usersToClinicsTable.clinicId],
        references: [clinicsTable.id],
    }),
}))

export const clinicTableRelations = relations(clinicsTable, ({ many }) => {
    return {
        doctors: many(doctorsTable),
        patients: many(patientsTable),
        appointments: many(appointmentsTable),
        userToClinics: many(usersToClinicsTable),
    }
})

export const doctorsTable = pgTable("doctors", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    avatarImageUrl: text("avatar_image_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    speciality: text("speciality").notNull(),
    //1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 0 - Sunday
    avaiableFromWeekDay: integer("avaiable_from_weekday").notNull(),
    avaiableToWeekDay: integer("avaiable_to_weekday").notNull(),
    avaiableFromTime: time("avaiable_from_time").notNull(),
    avaiableToTime: time("avaiable_to_time").notNull(),
    appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
    clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "cascade" }),
})

export const doctorTableRelations = relations(doctorsTable, ({ one, many }) => ({
    clinic: one(clinicsTable, {
        fields: [doctorsTable.clinicId],
        references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
}))

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    sex: patientSexEnum("sex").notNull(),
    clinicId: uuid("clinic_id").references(() => clinicsTable.id),
})

export const appointmentsTable = pgTable("appointments", {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date").notNull(),
    patientId: uuid("patient_id").references(() => patientsTable.id),
    doctorId: uuid("doctor_id").references(() => doctorsTable.id),
    clinicId: uuid("clinic_id").references(() => clinicsTable.id),
})

export const appointmentTableRelations = relations(appointmentsTable, ({ one }) => ({
    patient: one(patientsTable, {
        fields: [appointmentsTable.patientId],
        references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
        fields: [appointmentsTable.doctorId],
        references: [doctorsTable.id],
    }),
    clinic: one(clinicsTable, {
        fields: [appointmentsTable.clinicId],
        references: [clinicsTable.id],
    }),
}));