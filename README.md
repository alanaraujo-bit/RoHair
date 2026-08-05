<div align="center">

# RoHair

**O sistema operacional do negócio de uma profissional autônoma da beleza.**

</div>

---

## O que é

RoHair não é uma agenda com relatórios. São **dois aplicativos que conversam**:

- **Painel** — a profissional acompanha agenda, atendimento, estoque e lucro real,
  desenhado a partir do momento em que ela está com as mãos ocupadas e a cliente
  na cadeira
- **Portal da Cliente** — a cliente entra com CPF na primeira vez, cria sua senha,
  e passa a ver o próprio histórico e a própria evolução em fotos de antes e depois

O ponto de encontro entre os dois é o CPF: a ficha existe sem a conta, e a conta
se acopla ao histórico quando a cliente chega.

Nasce para uma profissional. É construído, desde a primeira linha, para milhares.

## Estado atual

> 📍 **Painel profissional no ar, com login**, em
> https://rohair.aionixdev.com/painel — cinco telas lendo o Postgres real.
>
> O trabalho não anda mais por fases fechadas: a unidade de entrega é tela
> funcionando em produção ([DEC-014](docs/04-DECISOES.md#dec-014)).
>
> Consulte **[docs/00-ESTADO-ATUAL.md](docs/00-ESTADO-ATUAL.md)** para o estado
> exato do projeto. Esse arquivo é sempre a fonte de verdade.

## Documentação

| Documento                                                            | Para quê                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [CLAUDE.md](CLAUDE.md)                                               | Instruções permanentes do agente. Lido em toda sessão              |
| [docs/00-ESTADO-ATUAL.md](docs/00-ESTADO-ATUAL.md)                   | **Onde o projeto está agora.** Comece por aqui                     |
| [docs/01-VISAO-PRODUTO.md](docs/01-VISAO-PRODUTO.md)                 | Posicionamento, princípios, personas, anti-objetivos               |
| [docs/02-ARQUITETURA.md](docs/02-ARQUITETURA.md)                     | Stack, camadas, tenancy, decisões de banco, PWA                    |
| [docs/03-ROADMAP.md](docs/03-ROADMAP.md)                             | As 17 fases, com entregáveis e definição de pronto                 |
| [docs/04-DECISOES.md](docs/04-DECISOES.md)                           | Decisões tomadas e pendentes                                       |
| [docs/05-PROTOCOLO-DE-TRABALHO.md](docs/05-PROTOCOLO-DE-TRABALHO.md) | Como dono e agente trabalham juntos                                |
| [docs/06-GLOSSARIO.md](docs/06-GLOSSARIO.md)                         | Vocabulário do domínio da beleza e do produto                      |
| [docs/07-FLUXOS.md](docs/07-FLUXOS.md)                               | Fluxos das duas pontas e os pontos de encontro                     |
| [docs/08-MODELO-DE-DOMINIO.md](docs/08-MODELO-DE-DOMINIO.md)         | Agregados, invariantes e fronteiras                                |
| [docs/09-CONFIGURACAO.md](docs/09-CONFIGURACAO.md)                   | **O que vem pronto, o que ela configura, o que o sistema aprende** |
| [docs/10-CENARIOS.md](docs/10-CENARIOS.md)                           | Cinco cenários que validaram o modelo — e os 5 buracos que acharam |
| [docs/11-PERSONAS.md](docs/11-PERSONAS.md)                           | Personas e Jobs to be Done                                         |
| [docs/12-WIREFRAMES.md](docs/12-WIREFRAMES.md)                       | **As 16 telas, em baixa fidelidade**                               |
| [docs/13-BACKLOG.md](docs/13-BACKLOG.md)                             | 42 itens priorizados pela distância até a dor central              |
| [docs/descoberta/](docs/descoberta/)                                 | A conversa com a Roziele e o que saiu dela                         |
| [docs/adr/](docs/adr/)                                               | Architecture Decision Records                                      |

## Stack

Next.js (App Router) · TypeScript strict · React 19 · Tailwind v4 (OKLCH) ·
Motion · Prisma · PostgreSQL · Redis · Zod · Serwist · Vitest · Playwright ·
Vercel · Railway

Justificativa de cada escolha em [docs/02-ARQUITETURA.md](docs/02-ARQUITETURA.md).

## Princípios

1. **Regra dos 3 toques** — toda ação do dia a dia em no máximo 3 toques
2. **O app trabalha, a usuária confirma** — nada se digita do zero se é inferível
3. **Nada de tela morta** — todo vazio propõe ação, todo carregamento tem forma
4. **Honestidade de estado** — o app nunca finge que salvou
5. **Elegância é função** — nenhum efeito entra por ser bonito, só por comunicar

---

<div align="center">
<sub>Projeto privado · construído com padrão de produto comercial desde o primeiro commit</sub>
</div>
