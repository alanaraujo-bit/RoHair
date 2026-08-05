import { createInterface } from 'node:readline/promises';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/core/db/generated/client';
import { normalizeIdentifier } from '../src/features/auth/domain/identifier';
import {
  checkPasswordShape,
  describePasswordProblem,
} from '../src/features/auth/domain/password-policy';
import { argon2Hasher } from '../src/features/auth/infrastructure/argon2-hasher';
import { checkLeakedPassword } from '../src/features/auth/infrastructure/leaked-passwords';
import { loadEnvLocal } from './load-env';

loadEnvLocal();

/**
 * Cria a primeira conta OWNER (DEC-008).
 *
 * Existe porque **não há autocadastro de equipe**: se a tela de login pudesse
 * criar contas, qualquer pessoa na internet viraria dona do salão. A primeira
 * conta é a única que nasce fora do produto, e nasce aqui, por quem tem acesso
 * ao banco.
 *
 * A senha entra pela **entrada padrão**, nunca por argumento de linha de
 * comando: argumento fica no histórico do shell e aparece na lista de processos
 * da máquina inteira.
 *
 *   echo "a-senha" | npm run db:owner -- roziele roziele@exemplo.com "Roziele"
 *
 * Idempotente no que importa: rodar de novo para o mesmo usuário **troca a
 * senha** em vez de duplicar a conta — o que também o torna a ferramenta de
 * recuperação de senha da OWNER, que por definição não tem a quem pedir.
 */

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL ausente.');

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function lerSenha(): Promise<string> {
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const senha = await rl.question(
      'Senha da OWNER (fica visível, use um terminal seu): ',
    );
    rl.close();
    return senha;
  }

  const partes: Buffer[] = [];
  for await (const parte of process.stdin) partes.push(Buffer.from(parte));
  return Buffer.concat(partes)
    .toString('utf8')
    .replace(/\r?\n$/, '');
}

async function main(): Promise<void> {
  const [usuarioBruto, emailBruto, nome] = process.argv.slice(2);

  if (!usuarioBruto || !emailBruto || !nome) {
    throw new Error(
      'Uso: echo "senha" | npm run db:owner -- <usuario> <email> "<nome>"',
    );
  }

  const usuario = normalizeIdentifier(usuarioBruto).value;
  const email = normalizeIdentifier(emailBruto).value;

  const senha = await lerSenha();
  const forma = checkPasswordShape(senha);
  if (!forma.ok) throw new Error(describePasswordProblem(forma.error));

  const vazamento = await checkLeakedPassword(senha);
  if (vazamento === 'vazada') {
    throw new Error(
      'Esta senha aparece em vazamentos conhecidos. Escolha outra — ' +
        'ela seria a primeira tentativa de qualquer ataque.',
    );
  }
  if (vazamento === 'desconhecida') {
    console.warn('⚠️  Não deu para consultar a lista de senhas vazadas. Seguindo.');
  }

  // A organização já existe (semente). Se não existir, criar aqui seria
  // adivinhar o nome do salão — melhor falhar e pedir a semente.
  const organization = await db.organization.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!organization) {
    throw new Error('Nenhuma organização no banco. Rode `npm run db:seed` antes.');
  }

  const passwordHash = await argon2Hasher.hash(senha);

  const existente = await db.user.findFirst({
    where: { organizationId: organization.id, OR: [{ email }, { username: usuario }] },
  });

  const user = existente
    ? await db.user.update({
        where: { id: existente.id },
        data: { passwordHash, name: nome, email, username: usuario, deletedAt: null },
      })
    : await db.user.create({
        data: {
          organizationId: organization.id,
          email,
          username: usuario,
          name: nome,
          passwordHash,
        },
      });

  await db.membership.upsert({
    where: { userId_role: { userId: user.id, role: 'OWNER' } },
    create: { userId: user.id, role: 'OWNER' },
    update: {},
  });

  // Trocar a senha derruba as sessões abertas. É o comportamento esperado de
  // uma recuperação: se a senha foi trocada porque vazou, manter a sessão de
  // quem tinha a antiga anularia a troca.
  const { count } = await db.session.deleteMany({ where: { userId: user.id } });

  console.log(
    `✅ ${existente ? 'Senha trocada' : 'Conta criada'}: ${nome} (${usuario}) ` +
      `— OWNER de ${organization.name}. ${count} sessão(ões) encerrada(s).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
