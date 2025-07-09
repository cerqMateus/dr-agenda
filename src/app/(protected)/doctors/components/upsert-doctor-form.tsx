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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  speciality: z.string().min(1, "Especialidade é obrigatória"),
  appointmentPrice: z.number().min(1, "Preço da consulta é obrigatório"),
  avaiableFromWeekday: z.number().min(1, "Dia da semana é obrigatório"),
  avaiableToWeekday: z.number().min(1, "Dia da semana é obrigatório"),
  avaiableFromTime: z.string().min(1, "Horário de início é obrigatório"),
  avaiableToTime: z.string().min(1, "Horário de término é obrigatório"),
});

const UpsertDoctorForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      speciality: "",
      appointmentPrice: 0,
      avaiableFromWeekday: 0,
      avaiableToWeekday: 0,
      avaiableFromTime: "",
      avaiableToTime: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <DialogContent>
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>Adicionar Médico</DialogTitle>
          <DialogDescription>Adicione um novo médico</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter></DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertDoctorForm;
