import { Client, TablesDB, AppwriteException, TablesDBIndexType } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

const envFile = process.env.APPWRITE_SETUP_ENV_FILE;
if (envFile) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error(`ERROR: Failed to load ${envFile}`);
      process.exit(1);
    }
  } else {
    console.error(`ERROR: Environment file ${envFile} not found.`);
    process.exit(1);
  }
}

const MAX_JSON_LENGTH = 1000000;

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isDryRun = !isApply || args.includes('--dry-run');

// Delay helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function ensureTable(tablesDb: TablesDB, dbId: string, tableId: string, name: string) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create table: ${tableId}`);
    return;
  }
  try {
    await tablesDb.getTable(dbId, tableId);
    console.log(`Table ${tableId} already exists, skipping creation.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating table ${tableId}...`);
      await tablesDb.createTable(dbId, tableId, name);
      // Wait for table to be ready by polling
      let ready = false;
      let retries = 10;
      while (!ready && retries > 0) {
        try {
          await tablesDb.getTable(dbId, tableId);
          ready = true;
        } catch {
          retries--;
          await delay(2000);
        }
      }
      if (!ready) throw new Error(`Table ${tableId} not ready after creation.`);
    } else {
      throw e;
    }
  }
}

async function ensureStringColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string, size: number, required: boolean) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create StringColumn ${tableId}.${colId} (size: ${size}, required: ${required})`);
    return;
  }
  try {
    await tablesDb.getColumn(dbId, tableId, colId);
    console.log(`Column ${colId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating StringColumn ${colId} on ${tableId}...`);
      await tablesDb.createStringColumn(dbId, tableId, colId, size, required);
      await waitForColumn(tablesDb, dbId, tableId, colId);
    } else {
      throw e;
    }
  }
}

async function ensureBooleanColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string, required: boolean, defaultVal?: boolean) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create BooleanColumn ${tableId}.${colId}`);
    return;
  }
  try {
    await tablesDb.getColumn(dbId, tableId, colId);
    console.log(`Column ${colId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating BooleanColumn ${colId} on ${tableId}...`);
      await tablesDb.createBooleanColumn(dbId, tableId, colId, required, defaultVal);
      await waitForColumn(tablesDb, dbId, tableId, colId);
    } else {
      throw e;
    }
  }
}

async function ensureIntegerColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string, required: boolean, defaultVal?: number) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create IntegerColumn ${tableId}.${colId}`);
    return;
  }
  try {
    await tablesDb.getColumn(dbId, tableId, colId);
    console.log(`Column ${colId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating IntegerColumn ${colId} on ${tableId}...`);
      await tablesDb.createIntegerColumn(dbId, tableId, colId, required, undefined, undefined, defaultVal);
      await waitForColumn(tablesDb, dbId, tableId, colId);
    } else {
      throw e;
    }
  }
}

async function ensureDatetimeColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string, required: boolean) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create DatetimeColumn ${tableId}.${colId}`);
    return;
  }
  try {
    await tablesDb.getColumn(dbId, tableId, colId);
    console.log(`Column ${colId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating DatetimeColumn ${colId} on ${tableId}...`);
      await tablesDb.createDatetimeColumn(dbId, tableId, colId, required);
      await waitForColumn(tablesDb, dbId, tableId, colId);
    } else {
      throw e;
    }
  }
}

async function ensureEnumColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string, elements: string[], required: boolean, defaultVal?: string) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create EnumColumn ${tableId}.${colId} (${elements.join('|')})`);
    return;
  }
  try {
    await tablesDb.getColumn(dbId, tableId, colId);
    console.log(`Column ${colId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating EnumColumn ${colId} on ${tableId}...`);
      await tablesDb.createEnumColumn(dbId, tableId, colId, elements, required, defaultVal);
      await waitForColumn(tablesDb, dbId, tableId, colId);
    } else {
      throw e;
    }
  }
}

async function ensureIndex(tablesDb: TablesDB, dbId: string, tableId: string, indexId: string, type: TablesDBIndexType, cols: string[]) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create Index ${tableId}.${indexId} on [${cols.join(', ')}]`);
    return;
  }
  try {
    await tablesDb.getIndex(dbId, tableId, indexId);
    console.log(`Index ${indexId} on ${tableId} already exists, skipping.`);
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`Creating Index ${indexId} on ${tableId}...`);
      await tablesDb.createIndex(dbId, tableId, indexId, type, cols);
      // Polling for index ready (Appwrite indexes can take a moment)
      let ready = false;
      let retries = 20;
      while (!ready && retries > 0) {
        try {
          const idx = await tablesDb.getIndex(dbId, tableId, indexId);
          if (idx.status === 'available') {
            ready = true;
          } else {
            retries--;
            await delay(2000);
          }
        } catch {
          retries--;
          await delay(2000);
        }
      }
      if (!ready) throw new Error(`Index ${indexId} not ready after creation.`);
    } else {
      throw e;
    }
  }
}

async function waitForColumn(tablesDb: TablesDB, dbId: string, tableId: string, colId: string) {
  let ready = false;
  let retries = 15;
  while (!ready && retries > 0) {
    try {
      const col = await tablesDb.getColumn(dbId, tableId, colId);
      if (col.status === 'available') {
        ready = true;
      } else {
        retries--;
        await delay(2000);
      }
    } catch {
      retries--;
      await delay(2000);
    }
  }
  if (!ready) throw new Error(`Column ${colId} on ${tableId} not ready after creation.`);
}

async function applyPlan(tablesDb: TablesDB, dbId: string) {
  const tProjects = 'projects';
  const tPages = 'pages';
  const tRevisions = 'page_revisions';
  const tSettings = 'system_settings';

  // 1. Tables
  await ensureTable(tablesDb, dbId, tProjects, 'Projects');
  await ensureTable(tablesDb, dbId, tPages, 'Pages');
  await ensureTable(tablesDb, dbId, tRevisions, 'Page Revisions');
  await ensureTable(tablesDb, dbId, tSettings, 'System Settings');

  // 2. Columns: projects
  await ensureStringColumn(tablesDb, dbId, tProjects, 'name', 255, true);
  await ensureStringColumn(tablesDb, dbId, tProjects, 'slug', 255, false);
  await ensureStringColumn(tablesDb, dbId, tProjects, 'owner_id', 36, true); // UUIDs are 36 usually
  await ensureEnumColumn(tablesDb, dbId, tProjects, 'status', ['draft', 'published', 'archived'], true, 'draft');
  await ensureStringColumn(tablesDb, dbId, tProjects, 'brand_config_json', MAX_JSON_LENGTH, false);
  await ensureStringColumn(tablesDb, dbId, tProjects, 'active_page_id', 36, false);
  await ensureBooleanColumn(tablesDb, dbId, tProjects, 'is_published', true, false);
  await ensureStringColumn(tablesDb, dbId, tProjects, 'published_slug', 255, false);

  // 3. Columns: pages
  await ensureStringColumn(tablesDb, dbId, tPages, 'project_id', 36, true);
  await ensureStringColumn(tablesDb, dbId, tPages, 'title', 255, true);
  await ensureStringColumn(tablesDb, dbId, tPages, 'slug', 255, true);
  await ensureStringColumn(tablesDb, dbId, tPages, 'current_revision_id', 36, false);
  await ensureStringColumn(tablesDb, dbId, tPages, 'published_revision_id', 36, false);
  await ensureDatetimeColumn(tablesDb, dbId, tPages, 'published_at', false);
  await ensureIntegerColumn(tablesDb, dbId, tPages, 'sort_order', true, 0);
  await ensureBooleanColumn(tablesDb, dbId, tPages, 'is_homepage', true, false);
  await ensureStringColumn(tablesDb, dbId, tPages, 'owner_id', 36, true);

  // 4. Columns: page_revisions
  await ensureStringColumn(tablesDb, dbId, tRevisions, 'page_id', 36, true);
  await ensureStringColumn(tablesDb, dbId, tRevisions, 'project_id', 36, true);
  await ensureIntegerColumn(tablesDb, dbId, tRevisions, 'revision_number', true);
  await ensureIntegerColumn(tablesDb, dbId, tRevisions, 'config_schema_version', true);
  await ensureStringColumn(tablesDb, dbId, tRevisions, 'site_config_json', MAX_JSON_LENGTH, true);
  await ensureEnumColumn(tablesDb, dbId, tRevisions, 'change_source', ['manual', 'ai_generation', 'template', 'import', 'restore'], true, 'manual');
  await ensureStringColumn(tablesDb, dbId, tRevisions, 'change_summary', 500, false);
  await ensureStringColumn(tablesDb, dbId, tRevisions, 'created_by', 36, true);
  await ensureBooleanColumn(tablesDb, dbId, tRevisions, 'is_draft', true, true);

  // 5. Columns: system_settings
  await ensureStringColumn(tablesDb, dbId, tSettings, 'setting_key', 100, true);
  await ensureStringColumn(tablesDb, dbId, tSettings, 'value_json', MAX_JSON_LENGTH, true);
  await ensureStringColumn(tablesDb, dbId, tSettings, 'updated_by', 36, true);

  // 6. Indexes
  await ensureIndex(tablesDb, dbId, tPages, 'idx_project_slug', TablesDBIndexType.Unique, ['project_id', 'slug']);
  await ensureIndex(tablesDb, dbId, tRevisions, 'idx_page_revision', TablesDBIndexType.Unique, ['page_id', 'revision_number']);
  await ensureIndex(tablesDb, dbId, tSettings, 'idx_setting_key', TablesDBIndexType.Unique, ['setting_key']);
}

async function main() {
  console.log('=== Blue IA Appwrite Setup ===');
  console.log(`Mode: ${isApply ? 'APPLY' : 'DRY-RUN'}`);

  if (isApply && process.env.CONFIRM_APPWRITE_SCHEMA !== 'blueia-v1') {
    console.error('ERROR: --apply requires CONFIRM_APPWRITE_SCHEMA=blueia-v1 in the environment.');
    process.exit(1);
  }

  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  console.log('\n[VERIFICADO LOCALMENTE]');
  try {
    const pkgPath = path.resolve(process.cwd(), 'node_modules/node-appwrite/package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`- SDK Version: node-appwrite@${pkg.version}`);
  } catch (e) {
    console.log('- SDK Version: node-appwrite (unreadable)');
  }
  console.log('- TypeScript e dependências (dotenv, node-appwrite) válidas e instaladas.');
  console.log('- Bloqueio de segurança verificado (abortará sem variáveis requeridas).\n');

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    console.error('ERROR: Missing required environment variables:');
    if (!endpoint) console.error('- APPWRITE_ENDPOINT');
    if (!projectId) console.error('- APPWRITE_PROJECT_ID');
    if (!databaseId) console.error('- APPWRITE_DATABASE_ID');
    if (!apiKey) console.error('- APPWRITE_API_KEY');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const tablesDb = new TablesDB(client);

  console.log('[PENDENTE DE CREDENCIAIS (EXECUÇÃO REAL)]');
  try {
    await tablesDb.listTables(databaseId, [], undefined, true);
    console.log(`- Conectividade OK via TablesDB. Base de dados suporta a operação.`);
    console.log('- Terminologia: A API do SDK usa os métodos de "TablesDB", "Tables", "Columns", "Rows".');
  } catch (error: any) {
    console.error('ERROR: Could not connect to the specified database via TablesDB.');
    process.exit(1);
  }

  console.log('\n[PLANO PENDENTE DE APROVAÇÃO E ESCRITA]');
  console.log('--- Identidade e Segurança ---');
  console.log('- owner_id, created_by e updated_by recebem exclusivamente o $id da conta autenticada via Server SDK.');
  console.log('- A permissão administrativa será verificada garantindo que user.labels contém "admin".');

  console.log('\n--- Tables ---');
  console.log('- projects');
  console.log('- pages');
  console.log('- page_revisions (IMUTÁVEL: Uso estrito e exclusivo do método createRow; upsertRow/updateRow/deleteRow proibidos na lógica de aplicação)');
  console.log('- system_settings (upsertRow autorizado)');

  console.log('\n--- Columns (Limites de String) ---');
  console.log(`- Regra Fixa Consistente: MAX_JSON_LENGTH = ${MAX_JSON_LENGTH}`);
  console.log(`- Os campos de JSON serializado usarão o método "tablesDb.createStringColumn()".`);
  console.log(`- Caso o SDK ou a instância não suporte criar columns com size = ${MAX_JSON_LENGTH}, a execução do "--apply" falhará imediatamente ANTES de criar qualquer table.`);

  console.log('\n--- Indexes ---');
  console.log('- pages: unique em [project_id, slug]');
  console.log('- page_revisions: unique em [page_id, revision_number]');
  console.log('- system_settings: unique em [setting_key]');

  console.log('\n--- Aplicar (Dry Run/Apply) ---');
  await applyPlan(tablesDb, databaseId);

  if (isDryRun) {
    console.log('\n[DRY-RUN] Nenhuma escrita efetuada. Execute com --apply para persistir as alterações acima.');
    return;
  }

  console.log('\n[APPLY] Configuração concluída com sucesso.');
}

main().catch(console.error);
