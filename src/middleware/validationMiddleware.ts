// Caminho: ERP-BACK-main/src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Este middleware recebe um schema Zod e o usa para validar o corpo da requisição
export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros para serem mais legíveis no frontend
        const errorMessages = error.errors.map((issue) => ({
            message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
        }));
        res.status(400).json({ error: 'Dados de entrada inválidos', details: errorMessages });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  };
};