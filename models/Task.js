const db = require('../database/db');

class Task {
    // Buscar tarefas por projeto e/ou sprint
    static async getAll(projectId = '', sprintId = '', search = '') {
        let sql = `
            SELECT t.*, 
                   tm.name as assignee_name, 
                   tm.avatar_url as assignee_avatar,
                   p.name as project_name,
                   p.key as project_key,
                   s.name as sprint_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN team_members tm ON t.assignee_id = tm.id
            LEFT JOIN sprints s ON t.sprint_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (projectId) {
            sql += ` AND t.project_id = ?`;
            params.push(projectId);
        }

        if (sprintId) {
            sql += ` AND t.sprint_id = ?`;
            params.push(sprintId);
        }

        if (search) {
            sql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term);
        }

        sql += ` ORDER BY t.updated_at DESC`;
        return await db.all(sql, params);
    }

    static async getById(id) {
        const sql = `SELECT * FROM tasks WHERE id = ?`;
        return await db.get(sql, [id]);
    }

    // Criar nova tarefa (SQL Puro)
    static async create(data) {
        const sql = `
            INSERT INTO tasks (project_id, sprint_id, title, description, status, priority, story_points, assignee_id, reporter_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.project_id,
            data.sprint_id || null,
            data.title,
            data.description || '',
            data.status || 'Backlog',
            data.priority || 'Média',
            parseInt(data.story_points) || 0,
            data.assignee_id || null,
            data.reporter_id || null
        ];

        const result = await db.run(sql, params);

        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [data.project_id, 'Sistema', 'Tarefa Criada', `Tarefa "${data.title}" foi criada no Kanban (${data.status}).`]
        );

        return result.lastID;
    }

    // Atualizar status no Kanban via Drag & Drop (SQL Puro + datas automatizadas)
    static async updateStatus(id, newStatus) {
        const task = await this.getById(id);
        if (!task) return false;

        // Normalização de status PT-BR / EN
        let normalizedStatus = newStatus;
        if (newStatus === 'Em Progresso') normalizedStatus = 'In Progress';
        if (newStatus === 'Em Revisão') normalizedStatus = 'Review';
        if (newStatus === 'Concluído') normalizedStatus = 'Done';
        if (newStatus === 'A Fazer') normalizedStatus = 'To Do';

        let sql = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP`;
        const params = [normalizedStatus];

        if (normalizedStatus === 'In Progress' && !task.started_at) {
            sql += `, started_at = CURRENT_TIMESTAMP`;
        }

        if (normalizedStatus === 'Done' && !task.completed_at) {
            sql += `, completed_at = CURRENT_TIMESTAMP`;
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        const result = await db.run(sql, params);

        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [task.project_id, 'Sistema', 'Tarefa Movida', `Tarefa "${task.title}" foi movida para "${normalizedStatus}".`]
        );

        return result.changes > 0;
    }

    // Atualizar tarefa completa (SQL Puro)
    static async update(id, data) {
        const sql = `
            UPDATE tasks
            SET project_id = ?, sprint_id = ?, title = ?, description = ?, status = ?, priority = ?, story_points = ?, assignee_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const params = [
            data.project_id,
            data.sprint_id || null,
            data.title,
            data.description,
            data.status,
            data.priority,
            parseInt(data.story_points) || 0,
            data.assignee_id || null,
            id
        ];

        const result = await db.run(sql, params);
        return result.changes > 0;
    }

    // Excluir tarefa (SQL Puro)
    static async delete(id) {
        const task = await this.getById(id);
        if (task) {
            await db.run(
                `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
                [task.project_id, 'Sistema', 'Tarefa Excluída', `Tarefa "${task.title}" foi removida.`]
            );
        }
        const sql = `DELETE FROM tasks WHERE id = ?`;
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }
}

module.exports = Task;
