/**
 * Route tests — Node built-in test runner.
 * Run: npm test
 *
 * better-sqlite3 requires native bindings that aren't available in the sandbox,
 * so we intercept require('better-sqlite3') and return a synchronous wrapper
 * around sql.js (pure-JS/WASM SQLite). All sql.js WASM ops are sync once
 * initialized; the only async part is the initial WASM load, done in before().
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// ---------------------------------------------------------------------------
// Mocks — installed BEFORE any app module is required
// ---------------------------------------------------------------------------

let sqlDb = null; // Set in before() after sql.js WASM loads

// --- Stripe mock ---
// --- DB mock (better-sqlite3 shim over sql.js) ---
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'stripe') {
    return function FakeStripe() {
      return {
        coupons: {
          list: async () => ({ data: [] }),
          create: async (args) => ({ id: 'coup_test', ...args, valid: true, metadata: { referral_system: 'true' } }),
        },
        promotionCodes: {
          create: async (args) => ({ id: 'promo_test_id', code: args.code }),
          list: async () => ({ data: [] }),
        },
        webhooks: { constructEvent: () => { throw new Error('no webhook in tests'); } },
      };
    };
  }

  if (request === 'better-sqlite3') {
    // Returns a constructor matching the better-sqlite3 API used in db.js:
    //   new Database(path)
    //   db.pragma(...)   → no-op
    //   db.exec(sql)     → DDL (multi-statement)
    //   db.prepare(sql)  → { run, get, all }
    return class MockDatabase {
      constructor(_path) {
        if (!sqlDb) throw new Error('sqlDb not initialized — call initSqlJs first');
      }
      pragma() {}
      exec(sql) {
        // sql.js exec handles multiple statements separated by semicolons
        sqlDb.exec(sql);
      }
      prepare(sql) {
        return {
          run(...args) {
            const params = flattenToArray(args);
            sqlDb.run(sql, params);
            return this;
          },
          get(...args) {
            const params = flattenToArray(args);
            const stmt = sqlDb.prepare(sql);
            stmt.bind(params);
            if (!stmt.step()) { stmt.free(); return undefined; }
            const row = stmtToObject(stmt);
            stmt.free();
            return row;
          },
          all(...args) {
            const params = flattenToArray(args);
            const stmt = sqlDb.prepare(sql);
            stmt.bind(params);
            const rows = [];
            while (stmt.step()) rows.push(stmtToObject(stmt));
            stmt.free();
            return rows;
          },
        };
      }
    };
  }

  return originalLoad.apply(this, arguments);
};

// better-sqlite3 spreads positional args: .run(a, b, c) or .run({...})
// sql.js expects an array for positional params
function flattenToArray(args) {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
    // Named-param object — convert {key: val} → {$key: val} for sql.js
    const out = {};
    for (const [k, v] of Object.entries(args[0])) out['$' + k] = v;
    return out;
  }
  return args; // positional array
}

function stmtToObject(stmt) {
  const cols = stmt.getColumnNames();
  const vals = stmt.get();
  const obj = {};
  cols.forEach((c, i) => (obj[c] = vals[i]));
  return obj;
}

// ---------------------------------------------------------------------------
// App setup — after mocks are wired
// ---------------------------------------------------------------------------

process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.DATABASE_PATH = ':memory:';
process.env.PORT = '0';

const { initDb } = require('../src/models/db');
const referralRoutes = require('../src/routes/referrals');
const express = require('express');

const app = express();
app.use(express.json());
app.use('/api', referralRoutes);

let server;
let baseUrl;

before(async () => {
  // Initialize sql.js WASM (the one async step), then init the DB schema
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  sqlDb = new SQL.Database(); // fresh in-memory DB

  initDb(); // runs CREATE TABLE IF NOT EXISTS ... using our mock

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}/api`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
  Module._load = originalLoad;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function post(path, body) {
  const res = await fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function get(path) {
  const res = await fetch(baseUrl + path);
  return { status: res.status, body: await res.json() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('POST /links — creates a referral link', async () => {
  const { status, body } = await post('/links', {
    productId: 'prod-1',
    referrerEmail: 'alice@example.com',
  });
  assert.equal(status, 200);
  assert.ok(body.id);
  assert.ok(body.code);
  assert.ok(body.url.includes(body.code));
});

test('POST /links — same email gets new link each call', async () => {
  const { body: first } = await post('/links', { productId: 'prod-1', referrerEmail: 'bob@example.com' });
  const { body: second } = await post('/links', { productId: 'prod-1', referrerEmail: 'bob@example.com' });
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.code, second.code);
});

test('POST /links — 400 when productId missing', async () => {
  const { status } = await post('/links', { referrerEmail: 'alice@example.com' });
  assert.equal(status, 400);
});

test('GET /links/:id — returns link with referrer info', async () => {
  const { body: created } = await post('/links', { productId: 'prod-1', referrerEmail: 'carol@example.com' });
  const { status, body } = await get(`/links/${created.id}`);
  assert.equal(status, 200);
  assert.equal(body.id, created.id);
  assert.equal(body.referrer_email, 'carol@example.com');
  assert.equal(body.clicks, 0);
  assert.equal(body.conversions, 0);
});

test('GET /links/:id — 404 for unknown id', async () => {
  const { status } = await get('/links/doesnotexist');
  assert.equal(status, 404);
});

test('GET /links?productId — lists all links for a product', async () => {
  await post('/links', { productId: 'prod-list', referrerEmail: 'x@example.com' });
  await post('/links', { productId: 'prod-list', referrerEmail: 'y@example.com' });
  const { status, body } = await get('/links?productId=prod-list');
  assert.equal(status, 200);
  assert.equal(body.length, 2);
});

test('GET /links — 400 when productId missing', async () => {
  const { status } = await get('/links');
  assert.equal(status, 400);
});

test('POST /redeem — valid code returns promo code and increments clicks', async () => {
  const { body: link } = await post('/links', { productId: 'prod-1', referrerEmail: 'dave@example.com' });
  const { status, body } = await post('/redeem', { code: link.code, referredEmail: 'new@example.com' });

  assert.equal(status, 200);
  assert.ok(body.id);
  assert.ok(body.promoCode, 'should have a Stripe promo code from mock');
  assert.ok(body.discountPercent > 0);

  const { body: updated } = await get(`/links/${link.id}`);
  assert.equal(updated.clicks, 1);
});

test('POST /redeem — 404 for invalid code', async () => {
  const { status } = await post('/redeem', { code: 'BADCODE' });
  assert.equal(status, 404);
});

test('POST /redeem — 400 when code missing', async () => {
  const { status } = await post('/redeem', {});
  assert.equal(status, 400);
});

test('GET /stats/:productId — returns correct aggregates', async () => {
  const { body: l1 } = await post('/links', { productId: 'prod-stats', referrerEmail: 'e@example.com' });
  await post('/links', { productId: 'prod-stats', referrerEmail: 'f@example.com' });
  await post('/redeem', { code: l1.code }); // increments clicks on l1

  const { status, body } = await get('/stats/prod-stats');
  assert.equal(status, 200);
  assert.equal(body.totalLinks, 2);
  assert.equal(body.totalClicks, 1);
  assert.equal(body.totalConversions, 0); // conversions only fire via webhook
  assert.ok(typeof body.conversionRate !== 'undefined');
});

test('POST /links/:id/convert — increments conversion and credits referrer', async () => {
  const { body: link } = await post('/links', { productId: 'prod-1', referrerEmail: 'g@example.com' });
  const { status, body } = await post(`/links/${link.id}/convert`, {});
  assert.equal(status, 200);
  assert.equal(body.ok, true);

  const { body: updated } = await get(`/links/${link.id}`);
  assert.equal(updated.conversions, 1);
  assert.ok(updated.reward_balance > 0);
});

test('POST /links/:id/convert — 404 for unknown link', async () => {
  const { status } = await post('/links/doesnotexist/convert', {});
  assert.equal(status, 404);
});
