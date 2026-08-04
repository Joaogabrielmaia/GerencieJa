const db = require('../database/db');

class Dashboard {
    static async getMetrics() {
        const totalProjects = await db.get(`SELECT COUNT(*) as count FROM projects`);
        const activeProjects = await db.get(`SELECT COUNT(*) as count FROM projects WHERE status = 'Em Andamento'`);
        const totalTasks = await db.get(`SELECT COUNT(*) as count FROM tasks`);
        const completedTasks = await db.get(`SELECT COUNT(*) as count FROM tasks WHERE status = 'Done'`);
        const totalMembers = await db.get(`SELECT COUNT(*) as count FROM team_members`);
        const activeSprints = await db.get(`SELECT COUNT(*) as count FROM sprints WHERE status = 'Ativa'`);

        const recentProjects = await db.all(`
            SELECT p.*, tm.name as owner_name 
            FROM projects p
            LEFT JOIN team_members tm ON p.owner_id = tm.id
            ORDER BY p.updated_at DESC LIMIT 5
        `);

        const recentActivities = await db.all(`
            SELECT ph.*, p.name as project_name
            FROM project_history ph
            JOIN projects p ON ph.project_id = p.id
            ORDER BY ph.created_at DESC LIMIT 6
        `);

        // Gráfico 1: Tarefas por Status (SQLite Aggregation)
        const tasksByStatusRows = await db.all(`
            SELECT status, COUNT(*) as count 
            FROM tasks 
            GROUP BY status
        `);

        const statusMap = { 'Backlog': 0, 'A Fazer': 0, 'Em Progresso': 0, 'Em Revisão': 0, 'Concluído': 0 };
        tasksByStatusRows.forEach(r => {
            let key = r.status;
            if (key === 'To Do') key = 'A Fazer';
            if (key === 'In Progress') key = 'Em Progresso';
            if (key === 'Review') key = 'Em Revisão';
            if (key === 'Done') key = 'Concluído';
            statusMap[key] = (statusMap[key] || 0) + r.count;
        });

        // Gráfico 2: Tarefas por Prioridade (SQLite Aggregation)
        const tasksByPriorityRows = await db.all(`
            SELECT priority, COUNT(*) as count 
            FROM tasks 
            GROUP BY priority
        `);

        const priorityMap = { 'Baixa': 0, 'Média': 0, 'Alta': 0, 'Urgente': 0 };
        tasksByPriorityRows.forEach(r => { priorityMap[r.priority] = r.count; });

        // Gráfico 3: Progresso por Projeto (SQLite Aggregation)
        const projectProgressRows = await db.all(`
            SELECT p.key, p.name, 
                   COUNT(t.id) as total_tasks,
                   SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) as done_tasks
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id
            GROUP BY p.id
        `);

        return {
            totalProjects: totalProjects ? totalProjects.count : 0,
            activeProjects: activeProjects ? activeProjects.count : 0,
            totalTasks: totalTasks ? totalTasks.count : 0,
            completedTasks: completedTasks ? completedTasks.count : 0,
            totalMembers: totalMembers ? totalMembers.count : 0,
            activeSprints: activeSprints ? activeSprints.count : 0,
            recentProjects,
            recentActivities,
            chartData: {
                tasksByStatus: statusMap,
                tasksByPriority: priorityMap,
                projectProgress: projectProgressRows
            }
        };
    }
}

module.exports = Dashboard;
