/**
 * Configuração pública do portfólio.
 *
 * Estas chaves são PÚBLICAS e seguras de expor: a chave "anon" só permite
 * LEITURA dos dados (graças ao RLS no Supabase). Toda escrita é feita apenas
 * pelo backoffice, com a chave secreta (service_role) guardada no servidor.
 *
 * Banco: projeto Supabase "isaquefl-portfolio".
 */
window.PORTFOLIO_CONFIG = {
  supabaseUrl: 'https://oworaejchdnaxlofjmjd.supabase.co',
  supabaseAnonKey: 'sb_publishable_dH24YbVVDB6fSquuRVcaQw_y8BuD8e4',
  githubUser: 'isaquefl'
};
