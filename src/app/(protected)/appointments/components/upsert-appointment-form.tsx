"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, ChevronDownIcon } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DialogDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { upsertAppointment } from "@/actions/upsert-appointment";
import {
  upsertAppointmentSchema,
  type UpsertAppointmentSchema,
} from "@/actions/upsert-appointment/schema";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  appointmentPriceInCents: number;
}

interface UpsertAppointmentFormProps {
  patients: Patient[];
  doctors: Doctor[];
  onClose: () => void;
}

export function UpsertAppointmentForm({
  patients,
  doctors,
  onClose,
}: UpsertAppointmentFormProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<UpsertAppointmentSchema>({
    resolver: zodResolver(upsertAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPriceInCents: 0,
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId,
  );

  // Atualiza o valor da consulta quando o médico é selecionado
  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPriceInCents",
        selectedDoctor.appointmentPriceInCents,
      );
    }
  }, [selectedDoctor, form]);

  const { execute, isPending } = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      onClose();
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error("Erro ao criar agendamento. Tente novamente.");
    },
  });

  const onSubmit = (data: UpsertAppointmentSchema) => {
    execute(data);
  };

  const isDoctorSelected = Boolean(selectedDoctorId);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Preencha os dados para criar um novo agendamento.
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
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
                <FormLabel>Valor da consulta</FormLabel>
                <NumericFormat
                  value={field.value / 100}
                  onValueChange={(value) => {
                    const cents = Math.round((value.floatValue || 0) * 100);
                    field.onChange(cents);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  allowNegative={false}
                  allowLeadingZeros={false}
                  thousandSeparator="."
                  customInput={Input}
                  prefix="R$"
                  disabled={!isDoctorSelected}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3">
                <FormLabel>Data do agendamento</FormLabel>
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
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsDatePickerOpen(false);
                      }}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <FormLabel>Horário</FormLabel>
            <Select disabled={!isDoctorSelected}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {/* Será implementado futuramente */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar agendamento"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
