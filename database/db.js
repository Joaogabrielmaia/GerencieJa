const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('✓ Conectado ao banco de dados SQLite em:', dbPath);
        initDatabase();
    }
});
function initDatabase() {
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schemaSql, (err) => {
                if (err) {
                    console.error('Erro ao aplicar schema.sql:', err.message);
                } else {
                    console.log('✓ Tabelas verificadas/criadas com sucesso (schema.sql).');
                    checkAndSeed();
                }
            });
        }
    });
}
function checkAndSeed() {
    db.get('SELECT COUNT(*) as count FROM projects', [], (err, row) => {
        if (err || !row || row.count === 0) {
            console.log('Populando dados iniciais de demonstração (seed.sql)...');
            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf8');
                db.exec(seedSql, (seedErr) => {
                    if (seedErr) {
                        console.error('Erro ao aplicar seed.sql:', seedErr.message);
                    } else {
                        console.log('✓ Dados de demonstração (seed.sql) carregados com sucesso.');
                    }
                });
            }
        }
    });
}
const dbHelper = {
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    },
    exec: (sql) => {
        return new Promise((resolve, reject) => {
            db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};
module.exports = dbHelper;
