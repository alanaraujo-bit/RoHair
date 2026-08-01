-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'PROFESSIONAL', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'REVOKED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ClientOrigin" AS ENUM ('CREATED_BY_STAFF', 'SELF_REGISTERED', 'CONFIRMED', 'MERGED');

-- CreateEnum
CREATE TYPE "Curvature" AS ENUM ('LISO', 'ONDULADO', 'CACHEADO', 'CRESPO');

-- CreateEnum
CREATE TYPE "PhotoKind" AS ENUM ('BEFORE', 'AFTER', 'REFERENCE');

-- CreateEnum
CREATE TYPE "PhotoVisibility" AS ENUM ('PROFESSIONAL_ONLY', 'CLIENT_VISIBLE');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('FRASCO', 'APLICACAO', 'ML', 'G', 'KIT', 'AMPOLA');

-- CreateEnum
CREATE TYPE "MovementReason" AS ENUM ('PURCHASE', 'USAGE', 'LOSS', 'ADJUSTMENT', 'EXPIRY');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'FALTOU', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ABERTO', 'AVALIACAO', 'EM_ANDAMENTO', 'ENCERRADO_SEM_SERVICO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "StrandTestResult" AS ENUM ('PASSED', 'FAILED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'DINHEIRO', 'DEBITO', 'CREDITO', 'FIADO');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('RECEITA', 'DESPESA');

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID,
    "accountId" UUID,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_account" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "clientId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cpfHash" TEXT,
    "cpfEncrypted" TEXT,
    "birthDate" DATE,
    "phone" TEXT,
    "curvature" "Curvature",
    "origin" "ClientOrigin" NOT NULL DEFAULT 'CREATED_BY_STAFF',
    "mergedIntoId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_note" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "clientId" UUID NOT NULL,
    "authorId" UUID,
    "body" TEXT NOT NULL,
    "clientVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_photo" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "clientId" UUID NOT NULL,
    "attendanceId" UUID,
    "storageKey" TEXT NOT NULL,
    "kind" "PhotoKind" NOT NULL,
    "visibility" "PhotoVisibility" NOT NULL DEFAULT 'PROFESSIONAL_ONLY',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isChemical" BOOLEAN NOT NULL DEFAULT false,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "parentId" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_variant" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "serviceId" UUID NOT NULL,
    "curvature" "Curvature" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,

    CONSTRAINT "service_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_product_use" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "serviceId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantityMilli" INTEGER NOT NULL,

    CONSTRAINT "service_product_use_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'FRASCO',
    "unitCostCents" INTEGER NOT NULL DEFAULT 0,
    "yieldPerUnit" INTEGER,
    "expiresAt" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "productId" UUID NOT NULL,
    "attendanceId" UUID,
    "quantityMilli" INTEGER NOT NULL,
    "reason" "MovementReason" NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "serviceId" UUID,
    "professionalId" UUID,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'AGENDADO',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMPTZ(3),

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "appointmentId" UUID,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABERTO',
    "courtesy" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(3),

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hair_assessment" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "attendanceId" UUID NOT NULL,
    "hasChemistry" BOOLEAN NOT NULL,
    "previousProduct" TEXT,
    "lastStraightenedAt" DATE,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "isFalling" BOOLEAN NOT NULL DEFAULT false,
    "strandTestResult" "StrandTestResult" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "strandTestedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hair_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_item" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "attendanceId" UUID NOT NULL,
    "parentId" UUID,
    "serviceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "attendance_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_usage" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "attendanceId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantityMilli" INTEGER NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "fromStrandTest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entry" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "attendanceId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "endedAt" TIMESTAMPTZ(3),

    CONSTRAINT "time_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "attendanceId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paidAt" TIMESTAMPTZ(3),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "attendanceId" UUID,
    "kind" "TransactionKind" NOT NULL,
    "category" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "businessDay" DATE NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "organizationId" UUID NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_organizationId_email_key" ON "user"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "user_organizationId_username_key" ON "user"("organizationId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "membership_userId_role_key" ON "membership"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "session_tokenHash_key" ON "session"("tokenHash");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "client_account_clientId_key" ON "client_account"("clientId");

-- CreateIndex
CREATE INDEX "client_organizationId_phone_idx" ON "client"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "client_organizationId_name_idx" ON "client"("organizationId", "name");

-- CreateIndex
CREATE INDEX "client_note_clientId_createdAt_idx" ON "client_note"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "client_photo_clientId_createdAt_idx" ON "client_photo"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "service_organizationId_active_idx" ON "service"("organizationId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "service_variant_serviceId_curvature_key" ON "service_variant"("serviceId", "curvature");

-- CreateIndex
CREATE UNIQUE INDEX "service_product_use_serviceId_productId_key" ON "service_product_use"("serviceId", "productId");

-- CreateIndex
CREATE INDEX "product_organizationId_active_idx" ON "product"("organizationId", "active");

-- CreateIndex
CREATE INDEX "stock_movement_productId_createdAt_idx" ON "stock_movement"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "appointment_organizationId_startsAt_idx" ON "appointment"("organizationId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_appointmentId_key" ON "attendance"("appointmentId");

-- CreateIndex
CREATE INDEX "attendance_organizationId_finishedAt_idx" ON "attendance"("organizationId", "finishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "hair_assessment_attendanceId_key" ON "hair_assessment"("attendanceId");

-- CreateIndex
CREATE INDEX "attendance_item_attendanceId_idx" ON "attendance_item"("attendanceId");

-- CreateIndex
CREATE INDEX "product_usage_attendanceId_idx" ON "product_usage"("attendanceId");

-- CreateIndex
CREATE INDEX "time_entry_attendanceId_idx" ON "time_entry"("attendanceId");

-- CreateIndex
CREATE INDEX "payment_attendanceId_idx" ON "payment"("attendanceId");

-- CreateIndex
CREATE INDEX "transaction_organizationId_businessDay_idx" ON "transaction"("organizationId", "businessDay");

-- CreateIndex
CREATE INDEX "audit_log_organizationId_createdAt_idx" ON "audit_log"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "client_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_photo" ADD CONSTRAINT "client_photo_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_photo" ADD CONSTRAINT "client_photo_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variant" ADD CONSTRAINT "service_variant_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_product_use" ADD CONSTRAINT "service_product_use_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_product_use" ADD CONSTRAINT "service_product_use_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hair_assessment" ADD CONSTRAINT "hair_assessment_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_item" ADD CONSTRAINT "attendance_item_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_item" ADD CONSTRAINT "attendance_item_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "attendance_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_item" ADD CONSTRAINT "attendance_item_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usage" ADD CONSTRAINT "product_usage_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usage" ADD CONSTRAINT "product_usage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- ESCRITO À MÃO — o que o Prisma não expressa
--
-- Tudo abaixo desta linha foi acrescentado manualmente e NÃO é regenerado por
-- `prisma migrate diff`. Se o schema mudar, isto continua valendo; se alguém
-- apagar, o banco deixa de garantir o que a aplicação promete.
-- ============================================================================

-- 1. Extensão necessária para combinar uma coluna escalar (organizationId) com
--    um intervalo dentro da mesma constraint de exclusão.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. INV-01 — dois agendamentos do mesmo profissional nunca se sobrepõem.
--
--    A checagem na interface é UX; a GARANTIA é esta. Duas requisições
--    simultâneas para o mesmo horário não conseguem, fisicamente, passar as
--    duas: a segunda falha no banco.
--
--    O intervalo é `[)` — semiaberto. Um atendimento que termina às 10:00 e
--    outro que começa às 10:00 não conflitam, senão agendar de hora em hora
--    seria impossível. É a mesma semântica de `overlaps()` em core/kernel/time.ts;
--    as duas precisam concordar ou a tela diria uma coisa e o banco outra.
--
--    Cancelado e falta não ocupam horário, por isso ficam fora do WHERE.
ALTER TABLE "appointment"
  ADD CONSTRAINT appointment_sem_sobreposicao
  EXCLUDE USING gist (
    "organizationId" WITH =,
    (COALESCE("professionalId", "organizationId")) WITH =,
    (tstzrange("startsAt", "endsAt", '[)')) WITH &&
  )
  WHERE ("status" NOT IN ('CANCELADO', 'FALTOU'));

-- 3. INV-03 — cpf_hash único por organização, mas SÓ quando existe.
--
--    Índice único comum trataria vários NULL como colisão em alguns bancos e,
--    pior, impediria o que D-07 exige: a maioria das fichas nasce sem CPF
--    porque a profissional não pede. Parcial resolve os dois.
CREATE UNIQUE INDEX client_cpf_hash_unico_por_org
  ON "client" ("organizationId", "cpfHash")
  WHERE "cpfHash" IS NOT NULL;

-- 4. INV-07 — no máximo um intervalo de cronômetro aberto por atendimento.
--
--    O agregado já garante isso em memória, mas duas abas abertas no mesmo
--    atendimento passariam pela aplicação. Índice único parcial fecha a porta.
CREATE UNIQUE INDEX time_entry_um_aberto_por_atendimento
  ON "time_entry" ("attendanceId")
  WHERE "endedAt" IS NULL;

-- 5. Sanidade de intervalos: fim depois do início, sempre.
ALTER TABLE "appointment"
  ADD CONSTRAINT appointment_fim_depois_do_inicio CHECK ("endsAt" > "startsAt");

ALTER TABLE "time_entry"
  ADD CONSTRAINT time_entry_fim_depois_do_inicio
  CHECK ("endedAt" IS NULL OR "endedAt" > "startedAt");

-- 6. INV-19 — item de serviço filho não carrega preço.
--
--    O preço vive no item pai; as folhas carregam custo e disparam a baixa de
--    estoque. Preço nos dois níveis contaria o valor em dobro no fechamento.
ALTER TABLE "attendance_item"
  ADD CONSTRAINT attendance_item_filho_sem_preco
  CHECK ("parentId" IS NULL OR "unitPriceCents" = 0);

-- 7. Dinheiro nunca é negativo onde não faz sentido.
ALTER TABLE "attendance_item"
  ADD CONSTRAINT attendance_item_preco_nao_negativo CHECK ("unitPriceCents" >= 0);

ALTER TABLE "payment"
  ADD CONSTRAINT payment_valor_positivo CHECK ("amountCents" > 0);
