const fs   = require('fs');
const path = require('path');
 
// ── Caminhos ────────────────────────────────────────────────
const DISTRO_PATH = path.join(__dirname, 'distribution.json');
const META_DIR    = path.join(
  __dirname,
  'servers',
  'bahpack-1.20.1',
  'forgemods',
  'meta'
);
 
// ── 1. Ler o distribution.json existente ────────────────────
if (!fs.existsSync(DISTRO_PATH)) {
  console.error('❌ distribution.json não encontrado em:', DISTRO_PATH);
  process.exit(1);
}
 
const distro = JSON.parse(fs.readFileSync(DISTRO_PATH, 'utf-8'));
console.log('✅ distribution.json carregado com sucesso.');
 
// ── 2. Verificar se a pasta meta existe ─────────────────────
if (!fs.existsSync(META_DIR)) {
  console.warn('⚠️  Pasta meta não encontrada em:', META_DIR);
  console.warn('   Nenhum mod extra será injetado.');
  process.exit(0);
}
 
// ── 3. Ler todos os .json da pasta meta ─────────────────────
const metaFiles = fs.readdirSync(META_DIR)
  .filter(f => f.endsWith('.json'));
 
if (metaFiles.length === 0) {
  console.warn('⚠️  Nenhum arquivo .json encontrado na pasta meta.');
  process.exit(0);
}
 
console.log(`📂 ${metaFiles.length} arquivo(s) de metadata encontrado(s):`);
metaFiles.forEach(f => console.log(`   • ${f}`));
 
// ── 4. Construir os blocos de cada mod ──────────────────────
const modsParaInjetar = [];
 
for (const file of metaFiles) {
  const filePath = path.join(META_DIR, file);
 
  try {
    const meta = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
 
    // Validação mínima
    if (!meta.id || !meta.name || !meta.artifact) {
      console.warn(`⚠️  ${file}: faltam campos obrigatórios (id, name, artifact). Ignorado.`);
      continue;
    }
 
    // Montar o módulo com "required" injetado automaticamente
    const modulo = {
      id:       meta.id,
      name:     meta.name,
      type:     meta.type || 'ForgeMod',
      required: {
        value: true,
        def:   true
      },
      artifact: meta.artifact
    };
 
    // Se houver subModules, incluir também
    if (Array.isArray(meta.subModules) && meta.subModules.length > 0) {
      modulo.subModules = meta.subModules;
    }
 
    modsParaInjetar.push(modulo);
    console.log(`   ✔ ${meta.name} (${meta.id})`);
 
  } catch (err) {
    console.error(`❌ Erro ao processar ${file}:`, err.message);
  }
}
 
if (modsParaInjetar.length === 0) {
  console.warn('⚠️  Nenhum mod válido para injetar.');
  process.exit(0);
}
 
// ── 5. Encontrar o servidor e injetar os mods ───────────────
//    Procura pelo servidor cujo id contém "bahpack"
const servidor = distro.servers?.find(s =>
  s.id?.toLowerCase().includes('bahpack')
);
 
if (!servidor) {
  console.error('❌ Servidor "bahpack" não encontrado no distribution.json.');
  console.error('   Servidores disponíveis:', distro.servers?.map(s => s.id) || 'nenhum');
  process.exit(1);
}
 
// Garantir que a array modules existe
if (!Array.isArray(servidor.modules)) {
  servidor.modules = [];
}
 
// Coletar os IDs dos módulos já existentes para evitar duplicatas
const idsExistentes = new Set(
  servidor.modules.map(m => m.id)
);
 
let injetados = 0;
let ignorados = 0;
 
for (const mod of modsParaInjetar) {
  if (idsExistentes.has(mod.id)) {
    console.log(`   ⏭ ${mod.name} já existe no distribution.json. Ignorado.`);
    ignorados++;
  } else {
    servidor.modules.push(mod);
    idsExistentes.add(mod.id);
    injetados++;
  }
}
 
// ── 6. Salvar o distribution.json atualizado ────────────────
fs.writeFileSync(DISTRO_PATH, JSON.stringify(distro, null, 2), 'utf-8');
 
console.log('');
console.log('═══════════════════════════════════════════');
console.log(`🚀 Injeção concluída!`);
console.log(`   ✅ ${injetados} mod(s) injetado(s)`);
console.log(`   ⏭  ${ignorados} mod(s) já existiam (ignorados)`);
console.log(`   📄 distribution.json salvo com sucesso.`);
console.log('═══════════════════════════════════════════');
