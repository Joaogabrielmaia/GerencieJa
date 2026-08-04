const db = require('../database/db');

class Goal {
    // Buscar todas as metas (com filtro por projeto e busca)
    static async getAll(projectId = '', search = '') {
        let sql = `
            SELECT g.*, p.name as project_name, p.key as project_key
            FROM goals g
            JOIN projects p ON g.project_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (projectId) {
            sql += ` AND g.project_id = ?`;
            params.push(projectId);
        }

        if (search) {
            sql += ` AND (g.title LIKE ? OR g.description LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term);
        }

        sql += ` ORDER BY g.due_date ASC`;
        return await db.all(sql, params);
    }

    static async getById(id) {
        const sql = `SELECT * FROM goals WHERE id = ?`;
        return await db.get(sql, [id]);
    }

    // Criar nova meta (SQL Puro)
    static async create(data) {
        const sql = `
            INSERT INTO goals (project_id, title, description, target_value, current_value, unit, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.project_id,
            data.title,
            data.description || '',
            parseFloat(data.target_value) || 100,
            parseFloat(data.current_value) || 0,
            data.unit || '%',
            data.status || 'Em Progresso',
            data.due_date || null
        ];

        const result = await db.run(sql, params);

        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [data.project_id, 'Sistema', 'Meta Criada', `Meta "${data.title}" foi estabelecida.`]
        );

        return result.lastID;
    }

    // Atualizar meta (SQL Puro)
    static async update(id, data) {
        const targetVal = parseFloat(data.target_value) || 100;
        const currentVal = parseFloat(data.current_value) || 0;
        let calculatedStatus = data.status || 'Em Progresso';

        if (currentVal >= targetVal) {
            calculatedStatus = 'Alcançada';
        }

        const sql = `
            UPDATE goals
            SET title = ?, description = ?, target_value = ?, current_value = ?, unit = ?, status = ?, due_date = ?
            WHERE id = ?
        `;
        const params = [
            data.title,
            data.description,
            targetVal,
            currentVal,
            data.unit,
            calculatedStatus,
            data.due_date || null,
            id
        ];

        const result = await db.run(sql, params);

        const goal = await this.getById(id);
        if (goal) {
            await db.run(
                `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
                [goal.project_id, 'Sistema', 'Meta Atualizada', `Progresso da meta "${data.title}" atualizado para ${currentVal}/${targetVal} ${data.unit}.`]
            );
        }

        return result.changes > 0;
    }

    // Excluir meta (SQL Puro)
    static async delete(id) {
        const goal = await this.getById(id);
        if (goal) {
            await db.run(
                `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
                [goal.project_id, 'Sistema', 'Meta Excluída', `Meta "${goal.title}" foi removida.`]
            );
        }
        const sql = `DELETE FROM goals WHERE id = ?`;
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }
}

module.exports = Goal;
