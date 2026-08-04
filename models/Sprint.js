const db = require('../database/db');
class Sprint {
    static async getAll(projectId = '', search = '') {
        let sql = `
            SELECT s.*, p.name as project_name, p.key as project_key,
                   (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id) as total_tasks,
                   (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id AND status = 'Done') as completed_tasks,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id = s.id) as total_points,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id = s.id AND status = 'Done') as completed_points
            FROM sprints s
            JOIN projects p ON s.project_id = p.id
            WHERE 1=1
        `;
        const params = [];
        if (projectId) {
            sql += ` AND s.project_id = ?`;
            params.push(projectId);
        }
        if (search) {
            sql += ` AND (s.name LIKE ? OR s.goal LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term);
        }
        sql += ` ORDER BY s.created_at DESC`;
        return await db.all(sql, params);
    }
    static async getById(id) {
        const sql = `SELECT * FROM sprints WHERE id = ?`;
        return await db.get(sql, [id]);
    }
    static async create(data) {
        const sql = `
            INSERT INTO sprints (project_id, name, goal, status, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.project_id,
            data.name,
            data.goal || '',
            data.status || 'Planejada',
            data.start_date || null,
            data.end_date || null
        ];
        const result = await db.run(sql, params);
        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [data.project_id, 'Sistema', 'Sprint Criada', `Sprint "${data.name}" foi planejada.`]
        );
        return result.lastID;
    }
    static async update(id, data) {
        const sql = `
            UPDATE sprints
            SET name = ?, goal = ?, status = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `;
        const params = [
            data.name,
            data.goal,
            data.status,
            data.start_date || null,
            data.end_date || null,
            id
        ];
        const result = await db.run(sql, params);
        const sprint = await this.getById(id);
        if (sprint) {
            await db.run(
                `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
                [sprint.project_id, 'Sistema', 'Sprint Atualizada', `Sprint "${data.name}" teve suas informações atualizadas.`]
            );
        }
        return result.changes > 0;
    }
    static async finish(id) {
        const sprint = await this.getById(id);
        if (!sprint) return false;
        const sql = `UPDATE sprints SET status = 'Concluída' WHERE id = ?`;
        const result = await db.run(sql, [id]);
        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [sprint.project_id, 'Sistema', 'Sprint Concluída', `Sprint "${sprint.name}" foi finalizada com sucesso.`]
        );
        return result.changes > 0;
    }
    static async delete(id) {
        const sprint = await this.getById(id);
        if (sprint) {
            await db.run(`UPDATE tasks SET sprint_id = NULL WHERE sprint_id = ?`, [id]);
            await db.run(
                `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
                [sprint.project_id, 'Sistema', 'Sprint Excluída', `Sprint "${sprint.name}" foi removida.`]
            );
        }
        const sql = `DELETE FROM sprints WHERE id = ?`;
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }
}
module.exports = Sprint;
