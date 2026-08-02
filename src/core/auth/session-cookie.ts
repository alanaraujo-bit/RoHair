/**
 * Nome do cookie de sessão.
 *
 * Vive em `core` — e não junto do resto da autenticação — porque o middleware
 * precisa dele e o middleware roda no runtime Edge, onde Prisma e Argon2 não
 * existem. Um módulo só com o nome do cookie é o que permite ao middleware
 * fazer sua parte sem arrastar o banco junto.
 *
 * O prefixo `__Host-` amarra o cookie a este host exato: sem `Domain`, sempre
 * `Secure`, sempre `Path=/`. Em `*.vercel.app` isso não é preciosismo — o
 * domínio é compartilhado com projetos de terceiros, e o prefixo é o que impede
 * um vizinho de plantar um cookie de mesmo nome. Como ele exige HTTPS, em
 * desenvolvimento o nome cai para a versão simples.
 */

export const SESSION_COOKIE_SECURE = process.env.NODE_ENV === 'production';

export const SESSION_COOKIE = SESSION_COOKIE_SECURE
  ? '__Host-rohair_sessao'
  : 'rohair_sessao';
