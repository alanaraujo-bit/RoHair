import { z } from 'zod';

/**
 * Validação de ambiente.
 *
 * Princípio: a aplicação não sobe com configuração inválida. Descobrir que
 * faltava uma variável em produção, meia hora depois do deploy, é o tipo de
 * falha que este arquivo existe para tornar impossível.
 *
 * Separado em servidor e cliente de propósito — o schema do servidor contém
 * segredos e nunca pode ser avaliado no navegador.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** Ambiente lógico. Distingue preview de produção, que o NODE_ENV não separa. */
  APP_ENV: z.enum(['local', 'preview', 'staging', 'production']).default('local'),

  // As variáveis abaixo passam a ser obrigatórias nas fases que as introduzem.
  // Mantê-las opcionais agora é honesto: o serviço ainda não existe.
  //
  // O protocolo é verificado explicitamente porque `z.url()` sozinha aceita
  // `localhost:5432` — o parser de URL lê "localhost" como esquema. Uma string
  // de conexão sem protocolo passaria na validação e só falharia ao conectar.
  /** Fase 3 — PostgreSQL no Railway */
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\/.+/, 'deve começar com postgresql://')
    .optional(),
  /** Fase 4 — Redis no Railway (limite de tentativas e sessão) */
  REDIS_URL: z
    .string()
    .regex(/^rediss?:\/\/.+/, 'deve começar com redis:// ou rediss://')
    .optional(),
  /** Fase 4 — chave HMAC de busca por CPF (DEC-009) */
  CPF_HASH_SECRET: z.string().min(32).optional(),
  /** Fase 4 — chave AES-256-GCM de criptografia do CPF (DEC-009) */
  CPF_ENCRYPTION_KEY: z.string().length(64).optional(),
  /** Fase 6 — Cloudflare R2 (DEC-010) */
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .regex(/^https?:\/\/.+/, 'deve começar com http:// ou https://')
    .default('http://localhost:3000'),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function format(error: z.ZodError): string {
  const lines = error.issues.map(
    (issue) => `  · ${issue.path.join('.') || '(raiz)'}: ${issue.message}`,
  );
  return `\n❌ Variáveis de ambiente inválidas:\n${lines.join('\n')}\n`;
}

function parse<T>(schema: z.ZodType<T>, source: unknown, scope: string): T {
  const result = schema.safeParse(source);

  if (!result.success) {
    // Falhar aqui, no boot, é intencional: melhor não subir do que subir errado.
    throw new Error(`[env:${scope}]${format(result.error)}`);
  }

  return result.data;
}

/**
 * Variáveis do cliente. Seguras para o navegador — só prefixos NEXT_PUBLIC_.
 *
 * O objeto é escrito campo a campo porque o Next substitui `process.env.X` em
 * tempo de build apenas quando o acesso é literal. Desestruturar quebraria isso.
 */
export const clientEnv: ClientEnv = parse(
  clientSchema,
  { NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL },
  'client',
);

/**
 * Análise pura do ambiente do servidor. Exposta para que o comportamento possa
 * ser testado sem depender de `process.env` nem do cache do processo.
 */
export function parseServerEnv(source: unknown): ServerEnv {
  return parse(serverSchema, source, 'server');
}

let cachedServerEnv: ServerEnv | undefined;

/**
 * Variáveis do servidor. Avaliação preguiçosa e com guarda explícita para que
 * um import acidental em componente de cliente falhe alto, e não em silêncio.
 */
export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[env:server] Ambiente do servidor acessado no navegador. ' +
        'Isto vazaria segredos — use clientEnv.',
    );
  }

  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}
