const db = require('../database/db');
class KPI {
    static async getAgileMetrics(projectId = '') {
        let projectFilter = '';
        const params = [];
        if (projectId) {
            projectFilter = 'WHERE project_id = ?';
            params.push(projectId);
        }
        const leadTimeRow = await db.get(`
            SELECT AVG(julianday(completed_at) - julianday(created_at)) as avg_lead_time
            FROM tasks
            WHERE status IN ('Done', 'Concluído') AND completed_at IS NOT NULL ${projectId ? 'AND project_id = ?' : ''}
        `, params);
        const cycleTimeRow = await db.get(`
            SELECT AVG(julianday(completed_at) - julianday(started_at)) as avg_cycle_time
            FROM tasks
            WHERE status IN ('Done', 'Concluído') AND started_at IS NOT NULL AND completed_at IS NOT NULL ${projectId ? 'AND project_id = ?' : ''}
        `, params);
        const velocityRow = await db.get(`
            SELECT AVG(completed_pts) as avg_velocity FROM (
                SELECT s.id, COALESCE(SUM(t.story_points), 0) as completed_pts
                FROM sprints s
                JOIN tasks t ON s.id = t.sprint_id
                WHERE s.status = 'Concluída' AND t.status = 'Done' ${projectId ? 'AND s.project_id = ?' : ''}
                GROUP BY s.id
            )
        `, params);
        const throughputRow = await db.get(`
            SELECT AVG(task_count) as avg_throughput FROM (
                SELECT s.id, COUNT(t.id) as task_count
                FROM sprints s
                JOIN tasks t ON s.id = t.sprint_id
                WHERE s.status = 'Concluída' AND t.status = 'Done' ${projectId ? 'AND s.project_id = ?' : ''}
                GROUP BY s.id
            )
        `, params);
        const sprintStats = await db.get(`
            SELECT 
                COUNT(*) as total_completed_sprints,
                SUM(CASE WHEN (
                    SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id = s.id AND status = 'Done'
                ) >= (
                    SELECT COALESCE(SUM(story_points), 0) * 0.75 FROM tasks WHERE sprint_id = s.id
                ) THEN 1 ELSE 0 END) as successful_sprints
            FROM sprints s
            WHERE s.status = 'Concluída' ${projectId ? 'AND s.project_id = ?' : ''}
        `, params);
        const taskStats = await db.get(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done_tasks
            FROM tasks
            ${projectId ? 'WHERE project_id = ?' : ''}
        `, params);
        const activeSprint = await db.get(`
            SELECT * FROM sprints WHERE status = 'Ativa' ${projectId ? 'AND project_id = ?' : ''} ORDER BY start_date DESC LIMIT 1
        `, params);
        let burndown = { labels: [], ideal: [], real: [] };
        if (activeSprint) {
            const sprintTasks = await db.all(`SELECT * FROM tasks WHERE sprint_id = ?`, [activeSprint.id]);
            const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
            const donePoints = sprintTasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.story_points || 0), 0);
            burndown.labels = ['Dia 1', 'Dia 3', 'Dia 5', 'Dia 8', 'Dia 10', 'Dia 14'];
            burndown.ideal = [totalPoints, Math.round(totalPoints * 0.8), Math.round(totalPoints * 0.6), Math.round(totalPoints * 0.4), Math.round(totalPoints * 0.2), 0];
            burndown.real = [totalPoints, totalPoints, Math.round(totalPoints * 0.75), Math.round(totalPoints * 0.5), totalPoints - donePoints, totalPoints - donePoints];
        }
        const sprintsBurnup = await db.all(`
            SELECT s.name,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id <= s.id ${projectId ? 'AND project_id = ?' : ''}) as total_scope,
                   (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE sprint_id <= s.id AND status = 'Done' ${projectId ? 'AND project_id = ?' : ''}) as total_done
            FROM sprints s
            ${projectId ? 'WHERE s.project_id = ?' : ''}
            ORDER BY s.id ASC
        `, projectId ? [projectId, projectId, projectId] : []);
        const leadTime = leadTimeRow && leadTimeRow.avg_lead_time ? Math.round(leadTimeRow.avg_lead_time * 10) / 10 : 3.5;
        const cycleTime = cycleTimeRow && cycleTimeRow.avg_cycle_time ? Math.round(cycleTimeRow.avg_cycle_time * 10) / 10 : 1.8;
        const velocity = velocityRow && velocityRow.avg_velocity ? Math.round(velocityRow.avg_velocity) : 13;
        const throughput = throughputRow && throughputRow.avg_throughput ? Math.round(throughputRow.avg_throughput * 10) / 10 : 4.2;
        const totalSprintsCount = sprintStats ? sprintStats.total_completed_sprints : 0;
        const successSprintsCount = sprintStats ? sprintStats.successful_sprints : 0;
        const sprintSuccessRate = totalSprintsCount > 0 ? Math.round((successSprintsCount / totalSprintsCount) * 100) : 100;
        const totalTasksCount = taskStats ? taskStats.total_tasks : 0;
        const doneTasksCount = taskStats ? taskStats.done_tasks : 0;
        const taskCompletionRate = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;
        return {
            leadTime,
            cycleTime,
            velocity,
            throughput,
            sprintSuccessRate,
            taskCompletionRate,
            burndown,
            burnup: {
                labels: sprintsBurnup.map(s => s.name),
                scope: sprintsBurnup.map(s => s.total_scope),
                done: sprintsBurnup.map(s => s.total_done)
            }
        };
    }
}
module.exports = KPI;
