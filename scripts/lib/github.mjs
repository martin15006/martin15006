// Datos públicos de GitHub (sin token obligatorio). Si la API falla, usa la última copia en caché.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CACHE = new URL('../../data/.cache.json', import.meta.url);

async function get(url, token) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'perfil-del-monarca',
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} en ${url}`);
  return res.json();
}

export async function loadGithub(login, { offline = false } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!offline) {
    try {
      const [user, repos] = await Promise.all([
        get(`https://api.github.com/users/${login}`, token),
        get(`https://api.github.com/users/${login}/repos?per_page=100&sort=pushed`, token),
      ]);
      const data = {
        fetchedAt: new Date().toISOString(),
        user: {
          login: user.login,
          followers: user.followers,
          following: user.following,
          createdAt: user.created_at,
          publicRepos: user.public_repos,
          avatar: user.avatar_url,
        },
        repos: repos.map((r) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at,
          fork: r.fork,
          archived: r.archived,
          homepage: r.homepage || null,
          license: r.license?.spdx_id ?? null,
          topics: r.topics ?? [],
        })),
      };
      writeFileSync(CACHE, JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.warn(`! API de GitHub no respondió (${err.message}); uso la caché.`);
    }
  }
  if (existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, 'utf8'));
  throw new Error('No hay respuesta de GitHub ni caché local. Corré el build con internet una vez.');
}
