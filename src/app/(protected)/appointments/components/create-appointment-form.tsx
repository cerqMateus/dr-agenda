"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { createAppointment } from "@/actions/create-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { patientsTable, doctorsTable } from "@/db/schema";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getAvailableTimes } from "@/actions/get-available-times";
import dayjs from "dayjs";

const formSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório."),
  doctorId: z.string().min(1, "Médico é obrigatório."),
  appointmentPriceInCents: z
    .number()
    .positive("Valor deve ser maior que zero."),
  date: z.date().optional(),
  time: z.string().min(1, "Horário é obrigatório."),
});

interface CreateAppointmentFormProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const CreateAppointmentForm = ({
  patients,
  doctors,
  onSuccess,
}: CreateAppointmentFormProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPriceInCents: 0,
      date: undefined,
      time: "",
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");
  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId,
  );
  const selectedDate = form.watch("date");

  const { data: availableTimes, isLoading: isLoadingTimes } = useQuery({
    queryKey: ["available-times", selectedDoctorId, selectedDate],
    queryFn: () =>
      getAvailableTimes({
        date: selectedDate!,
        doctorId: selectedDoctorId,
      }),
    enabled: !!selectedDoctorId && !!selectedDate,
  });
  // Atualiza o valor da consulta quando o médico é selecionado
  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      form.setValue("appointmentPriceInCents", doctor.appointmentPriceInCents);
    }
  };

  const createAppointmentAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      form.reset();
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar agendamento.");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.date) {
      toast.error("Data é obrigatória.");
      return;
    }

    if (!data.time) {
      toast.error("Horário é obrigatório.");
      return;
    }

    // Combinar data e horário em um único Date
    const [hours, minutes] = data.time.split(":").map(Number);
    const appointmentDateTime = new Date(data.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    createAppointmentAction.execute({
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentPriceInCents: data.appointmentPriceInCents,
      date: appointmentDateTime,
    });
  };

  const isDoctorSelected = !!selectedDoctorId;
  const isPatientAndDoctorSelected = !!selectedPatientId && !!selectedDoctorId;

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Novo Agendamento</DialogTitle>
        <DialogDescription>
          Crie um novo agendamento para sua clínica.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleDoctorChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="R$ "
                    placeholder="R$ 0,00"
                    disabled={!isDoctorSelected}
                    value={field.value / 100}
                    onValueChange={(values) => {
                      const { floatValue } = values;
                      field.onChange((floatValue || 0) * 100);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                        disabled={!isDoctorSelected}
                      >
                        {field.value
                          ? field.value.toLocaleDateString()
                          : "Selecione uma data"}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsDatePickerOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isPatientAndDoctorSelected || !selectedDate}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimes?.data?.map((timeSlot: any) => (
                      <SelectItem key={timeSlot.time} value={timeSlot.time}>
                        {timeSlot.time.slice(0, 5)} {/* Remove os segundos */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
                  {!isPatientAndDoctorSelected
                    ? "Selecione um paciente e médico para habilitar os horários"
                    : !selectedDate
                      ? "Selecione uma data para ver os horários disponíveis"
                      : availableTimes?.data?.length === 0
                        ? "Nenhum horário disponível para esta data"
                        : "Selecione um horário disponível"}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={createAppointmentAction.isPending || !selectedDate}
              className="w-full"
            >
              {createAppointmentAction.isPending
                ? "Criando..."
                : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateAppointmentForm;
