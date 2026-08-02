-- Login da equipe (Fase 4, primeira fatia).
--
-- O modelo de identidade já nasceu completo na migration de fundação: `user`,
-- `membership`, `session` e `client_account` existem desde lá. Falta apenas o
-- registro de tentativas, que é o que permite bloqueio progressivo.
--
-- Por que no Postgres e não no Redis (DEC-016): bloqueio que evapora quando o
-- cache reinicia não é bloqueio. O volume é irrisório — algumas linhas por
-- login — e a limpeza é uma varredura por `createdAt`.

-- CreateTable
CREATE TABLE "login_attempt" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "bucket" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempt_bucket_createdAt_idx" ON "login_attempt"("bucket", "createdAt");
