const db = require('../database/db');

class TeamMember {
    // Buscar todos os membros com filtro de busca
    static async getAll(search = '') {
        let sql = `SELECT tm.*, 
                   (SELECT COUNT(*) FROM project_members WHERE member_id = tm.id) as total_projects,
                   (SELECT COUNT(*) FROM tasks WHERE assignee_id = tm.id) as total_tasks,
                   (SELECT COUNT(*) FROM tasks WHERE assignee_id = tm.id AND status = 'Done') as completed_tasks
            FROM team_members tm
            WHERE 1=1`;
        const params = [];

        if (search) {
            sql += ` AND (tm.name LIKE ? OR tm.email LIKE ? OR tm.role LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        sql += ` ORDER BY tm.name ASC`;
        return await db.all(sql, params);
    }

    static async getById(id) {
        const sql = `SELECT * FROM team_members WHERE id = ?`;
        return await db.get(sql, [id]);
    }

    // Criar novo membro da equipe (SQL Puro)
    static async create(data) {
        const sql = `
            INSERT INTO team_members (name, email, role, avatar_url)
            VALUES (?, ?, ?, ?)
        `;
        const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;
        const params = [
            data.name,
            data.email,
            data.role,
            data.avatar_url || defaultAvatar
        ];

        const result = await db.run(sql, params);
        return result.lastID;
    }

    // Atualizar membro da equipe (SQL Puro)
    static async update(id, data) {
        const sql = `
            UPDATE team_members
            SET name = ?, email = ?, role = ?, avatar_url = ?
            WHERE id = ?
        `;
        const params = [
            data.name,
            data.email,
            data.role,
            data.avatar_url,
            id
        ];

        const result = await db.run(sql, params);
        return result.changes > 0;
    }

    // Excluir membro da equipe (SQL Puro)
    static async delete(id) {
        const sql = `DELETE FROM team_members WHERE id = ?`;
        const result = await db.run(sql, [id]);
        return result.changes > 0;
    }
}

module.exports = TeamMember;
