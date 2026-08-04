const db = require('../database/db');

class Project {
    // Buscar todos os projetos com contagens e filtro de busca
    static async getAll(search = '', category = '', status = '') {
        let sql = `
            SELECT p.*, 
                   tm.name as owner_name, 
                   tm.avatar_url as owner_avatar,
                   (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as total_members,
                   (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
                   (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status IN ('Done', 'Concluído')) as completed_tasks
            FROM projects p
            LEFT JOIN team_members tm ON p.owner_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.key LIKE ? OR p.description LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (category) {
            sql += ` AND p.category = ?`;
            params.push(category);
        }

        if (status) {
            sql += ` AND p.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY p.updated_at DESC`;

        return await db.all(sql, params);
    }

    // Buscar projeto por ID com dados completíssimos
    static async getById(id) {
        const sql = `
            SELECT p.*, 
                   tm.name as owner_name, 
                   tm.email as owner_email,
                   tm.role as owner_role,
                   tm.avatar_url as owner_avatar
            FROM projects p
            LEFT JOIN team_members tm ON p.owner_id = tm.id
            WHERE p.id = ?
        `;
        return await db.get(sql, [id]);
    }

    // Criar novo projeto (SQL puro)
    static async create(data) {
        const sql = `
            INSERT INTO projects (name, key, description, status, category, owner_id, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.name,
            data.key.toUpperCase(),
            data.description || '',
            data.status || 'Planejamento',
            data.category || 'Desenvolvimento',
            (data.owner_id && !isNaN(data.owner_id)) ? parseInt(data.owner_id) : null,
            data.start_date || null,
            data.end_date || null
        ];

        const result = await db.run(sql, params);

        // Registrar no histórico
        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [result.lastID, 'Sistema', 'Projeto Criado', `Projeto "${data.name}" (${data.key}) foi registrado no sistema.`]
        );

        // Vincular o dono como membro do projeto se informado
        const validOwnerId = (data.owner_id && !isNaN(data.owner_id)) ? parseInt(data.owner_id) : null;
        if (validOwnerId) {
            await db.run(
                `INSERT OR IGNORE INTO project_members (project_id, member_id, assigned_role) VALUES (?, ?, ?)`,
                [result.lastID, validOwnerId, 'Líder do Projeto']
            );
        }

        return result.lastID;
    }

    // Atualizar projeto existente (SQL puro)
    static async update(id, data) {
        const sql = `
            UPDATE projects
            SET name = ?, key = ?, description = ?, status = ?, category = ?, owner_id = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const params = [
            data.name,
            data.key.toUpperCase(),
            data.description,
            data.status,
            data.category,
            data.owner_id || null,
            data.start_date || null,
            data.end_date || null,
            id
        ];

        const result = await db.run(sql, params);

        // Registrar no histórico
        await db.run(
            `INSERT INTO project_history (project_id, user_name, action, details) VALUES (?, ?, ?, ?)`,
            [id, 'Sistema', 'Projeto Atualizado', `Informações do projeto "${data.name}" foram atualizadas.`]
        );

        return result.changes > 0;
    }

    // Excluir projeto (SQL puro)
    static async delete(id) {
        const project = await this.getById(id);
        const sql = `DELETE FROM projects WHERE id = ?`;
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }

    // Buscar membros vinculados ao projeto
    static async getMembers(projectId) {
        const sql = `
            SELECT tm.*, pm.assigned_role
            FROM team_members tm
            INNER JOIN project_members pm ON tm.id = pm.member_id
            WHERE pm.project_id = ?
            ORDER BY tm.name ASC
        `;
        return await db.all(sql, [projectId]);
    }

    // Buscar sprint ativa do projeto
    static async getCurrentSprint(projectId) {
        const sql = `
            SELECT * FROM sprints 
            WHERE project_id = ? AND status = 'Ativa'
            ORDER BY start_date DESC LIMIT 1
        `;
        return await db.get(sql, [projectId]);
    }

    // Buscar todas as sprints do projeto
    static async getSprints(projectId) {
        const sql = `
            SELECT s.*,
                   (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id) as total_tasks,
                   (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id AND status = 'Done') as completed_tasks,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id = s.id) as total_points,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id = s.id AND status = 'Done') as completed_points
            FROM sprints s
            WHERE s.project_id = ?
            ORDER BY s.created_at DESC
        `;
        return await db.all(sql, [projectId]);
    }

    // Buscar tarefas / backlog do projeto
    static async getBacklog(projectId) {
        const sql = `
            SELECT t.*, 
                   tm.name as assignee_name, 
                   tm.avatar_url as assignee_avatar,
                   s.name as sprint_name
            FROM tasks t
            LEFT JOIN team_members tm ON t.assignee_id = tm.id
            LEFT JOIN sprints s ON t.sprint_id = s.id
            WHERE t.project_id = ?
            ORDER BY 
                CASE t.priority 
                    WHEN 'Urgente' THEN 1 
                    WHEN 'Alta' THEN 2 
                    WHEN 'Média' THEN 3 
                    WHEN 'Baixa' THEN 4 
                END, t.created_at DESC
        `;
        return await db.all(sql, [projectId]);
    }

    // Buscar métricas / KPIs do projeto
    static async getKPIs(projectId) {
        const totalTasksRow = await db.get(`SELECT COUNT(*) as count FROM tasks WHERE project_id = ?`, [projectId]);
        const doneTasksRow = await db.get(`SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = 'Done'`, [projectId]);
        const totalPointsRow = await db.get(`SELECT COALESCE(SUM(story_points), 0) as points FROM tasks WHERE project_id = ?`, [projectId]);
        const donePointsRow = await db.get(`SELECT COALESCE(SUM(story_points), 0) as points FROM tasks WHERE project_id = ? AND status = 'Done'`, [projectId]);
        const totalSprintsRow = await db.get(`SELECT COUNT(*) as count FROM sprints WHERE project_id = ?`, [projectId]);
        const membersRow = await db.get(`SELECT COUNT(*) as count FROM project_members WHERE project_id = ?`, [projectId]);

        const totalTasks = totalTasksRow ? totalTasksRow.count : 0;
        const doneTasks = doneTasksRow ? doneTasksRow.count : 0;
        const totalPoints = totalPointsRow ? totalPointsRow.points : 0;
        const donePoints = donePointsRow ? donePointsRow.points : 0;
        const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const pointsRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

        return {
            totalTasks,
            doneTasks,
            totalPoints,
            donePoints,
            completionRate,
            pointsRate,
            totalSprints: totalSprintsRow ? totalSprintsRow.count : 0,
            totalMembers: membersRow ? membersRow.count : 0
        };
    }

    // Buscar metas do projeto
    static async getGoals(projectId) {
        const sql = `SELECT * FROM goals WHERE project_id = ? ORDER BY due_date ASC`;
        return await db.all(sql, [projectId]);
    }

    // Buscar histórico do projeto
    static async getHistory(projectId) {
        const sql = `SELECT * FROM project_history WHERE project_id = ? ORDER BY created_at DESC LIMIT 50`;
        return await db.all(sql, [projectId]);
    }
}

module.exports = Project;
