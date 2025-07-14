import { z } from "zod";

export const upsertPatientSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, {
        message: "Nome é obrigatório.",
    }),
    email: z.string().email({
        message: "Email deve ser válido.",
    }),
    phoneNumber: z.string().trim().min(10, {
        message: "Número de telefone deve ter pelo menos 10 dígitos.",
    }).max(11, {
        message: "Número de telefone deve ter no máximo 11 dígitos.",
    }).regex(/^\d+$/, {
        message: "Número de telefone deve conter apenas números.",
    }),
    sex: z.enum(["male", "female"], {
        required_error: "Sexo é obrigatório.",
    }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
