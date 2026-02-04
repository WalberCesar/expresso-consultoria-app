import { z } from 'zod';

export const launchFormSchema = z.object({
  tipo: z.enum(['entrada', 'saida'], {
    required_error: 'O tipo é obrigatório',
  }),
  descricao: z.string({
    required_error: 'A descrição é obrigatória',
  }).min(10, {
    message: 'A descrição precisa ter pelo menos 10 caracteres',
  }),
  dataHora: z.date({
    required_error: 'A data e hora são obrigatórias',
  }),
});

export type LaunchFormData = z.infer<typeof launchFormSchema>;
