import { z } from 'zod';

export const launchFormSchema = z.object({
  tipo: z.enum(['entrada', 'saida'], {
    error: (issue) => issue.input === undefined 
      ? 'O tipo é obrigatório'
      : 'Tipo inválido',
  }),
  descricao: z.string({
    error: (issue) => issue.input === undefined 
      ? 'A descrição é obrigatória'
      : 'A descrição deve ser um texto',
  }).min(10, {
    message: 'A descrição precisa ter pelo menos 10 caracteres',
  }),
  dataHora: z.date({
    error: (issue) => issue.input === undefined 
      ? 'A data e hora são obrigatórias'
      : 'Data e hora inválidas',
  }),
});

export type LaunchFormData = z.infer<typeof launchFormSchema>;
