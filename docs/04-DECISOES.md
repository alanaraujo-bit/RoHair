# Registro de Decisões

> Decisão registrada aqui **não se rediscute** sem motivo novo. Se um motivo novo
> aparecer, cria-se uma nova entrada revogando a anterior — nunca se apaga o
> histórico.
>
> Decisões estruturais grandes ganham um ADR completo em [adr/](adr/).

---

## Decisões tomadas

### DEC-001 · Serwist no lugar de `next-pwa`
**Data:** 2026-07-31 · **Status:** ✅ Aceita

`next-pwa` está sem manutenção ativa. Serwist é o sucessor moderno do Workbox no
ecossistema Next, com suporte a App Router, precaching e estratégias tipadas.
Aplicação direta da regra "nunca usar bibliotecas abandonadas".

---

### DEC-002 · RSC + Server Actions como padrão; TanStack Query nas ilhas
**Data:** 2026-07-31 · **Status:** ✅ Aceita

Buscar todos os dados via TanStack Query no cliente descarta a principal vantagem
do App Router e aumenta o JavaScript enviado — crítico num app usado em 4G.

**Padrão adotado:** leitura no servidor (RSC, streaming, cache tagueado); mutação
por Server Action validada com Zod; TanStack Query **apenas** onde há atualização
otimista, polling ou fila offline — agenda ao vivo, cronômetro, atendimento.

---

### DEC-003 · Multi-tenancy por `organizationId` desde o dia 1
**Data:** 2026-07-31 · **Status:** ✅ Aceita

Banco único, schema único, isolamento por `organizationId`, com Prisma Client
Extension + Row Level Security.

Alternativa descartada: banco por tenant — custo e complexidade operacional
incompatíveis com o preço-alvo. Introduzir tenancy depois seria uma migração de
identidade e de todo o modelo de dados; fazer no dia 1 custa pouco.

---

### DEC-004 · Arquitetura feature-first com camadas e regra de dependência por lint
**Data:** 2026-07-31 · **Status:** ✅ Aceita

`domain / application / infrastructure / presentation` por feature, com
`eslint-plugin-boundaries` impedindo import indevido.

Regra imposta por ferramenta e não por disciplina é a única que sobrevive ao
tempo — e é o que torna o domínio testável sem banco.

---

### DEC-005 · Documentação viva como fonte de verdade entre sessões
**Data:** 2026-07-31 · **Status:** ✅ Aceita

`CLAUDE.md` + `docs/` versionados no repositório, com
[00-ESTADO-ATUAL.md](00-ESTADO-ATUAL.md) atualizado ao fim de toda unidade de
trabalho.

**Motivo:** o contexto de conversa é volátil. Se a janela quebrar, o projeto não
pode perder o fio. A documentação no repositório é o único estado durável, e é
lida automaticamente por qualquer sessão nova.

---

### DEC-006 · Roadmap de 16 fases com aprovação obrigatória
**Data:** 2026-07-31 · **Status:** ✅ Aceita

Ver [03-ROADMAP.md](03-ROADMAP.md). Nenhuma fase começa sem aprovação explícita;
nenhuma é pulada; nenhuma é entregue em conjunto com outra para "adiantar".

---

## Decisões pendentes

### D-01 · Biblioteca de autenticação
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 0 (parcial), Fase 4 (total)

**Recomendação: Better Auth**, com passkey (Face ID no iPhone) e OTP por e-mail
como alternativa.

- **A favor:** TypeScript-first; plugins oficiais de organization (multi-tenant),
  passkey/WebAuthn e 2FA; roda sobre o mesmo Prisma; login por Face ID é um
  momento memorável e elimina senha.
- **Contra:** ecossistema mais novo que o do Auth.js.
- **Alternativa:** Auth.js v5 — mais conhecido, porém em beta prolongado e sem
  tenancy pronta, o que exigiria construir organizações e papéis à mão.
- **Reversibilidade:** média. A auth ficará atrás de uma interface própria em
  `core/auth`, mas a troca depois da Fase 4 teria custo real.

### D-02 · Armazenamento de fotos
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 6

**Recomendação: Vercel Blob**, atrás de uma interface `StorageService`.

- **A favor:** integração direta com a Vercel, zero configuração, upload direto
  do cliente com URL assinada.
- **Contra:** custo de egresso maior que o do Cloudflare R2 em volume alto.
- **Mitigação:** a interface `StorageService` torna a migração para R2 uma troca
  de adapter, sem tocar em feature alguma.

### D-03 · Domínio próprio
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 5 (instalação do PWA), Fase 13 (e-mail)

Necessário para PWA instalável com identidade e para e-mail transacional com boa
entregabilidade. Até que exista, seguimos no subdomínio da Vercel.

### D-04 · Origem do nome "RoHair"
**Status:** ⏳ Aguardando · **Bloqueia:** Fase 2

Saber se "Ro" vem de um nome próprio muda logotipo, tom de voz e a construção da
marca. Sem isso, a identidade sai genérica — exatamente o que não se quer.
