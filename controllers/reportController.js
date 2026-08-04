const Project = require('../models/Project');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const TeamMember = require('../models/TeamMember');
const db = require('../database/db');

exports.index = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const status = req.query.status || '';
        const priority = req.query.priority || '';

        const projects = await Project.getAll();
        const tasks = await Task.getAll(projectId, '', '');
        
        let filteredTasks = tasks;
        if (status) {
            filteredTasks = filteredTasks.filter(t => t.status === status);
        }
        if (priority) {
            filteredTasks = filteredTasks.filter(t => t.priority === priority);
        }

        res.render('pages/reports', {
            title: 'Relatórios',
            activePage: 'reports',
            projects,
            tasks: filteredTasks,
            projectId,
            status,
            priority
        });
    } catch (err) {
        console.error('Erro ao carregar página de relatórios:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar relatórios.', activePage: 'reports' });
    }
};

// Exportar CSV Nativo (UTF-8 BOM para Excel)
exports.exportCSV = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const status = req.query.status || '';
        const priority = req.query.priority || '';

        let sql = `
            SELECT t.id, t.title, p.key as project_key, p.name as project_name, 
                   t.status, t.priority, t.story_points, 
                   COALESCE(tm.name, 'Não atribuído') as assignee,
                   t.created_at, t.completed_at
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN team_members tm ON t.assignee_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (projectId) {
            sql += ` AND t.project_id = ?`;
            params.push(projectId);
        }
        if (status) {
            sql += ` AND t.status = ?`;
            params.push(status);
        }
        if (priority) {
            sql += ` AND t.priority = ?`;
            params.push(priority);
        }

        sql += ` ORDER BY t.id ASC`;
        const rows = await db.all(sql, params);

        // UTF-8 BOM
        let csvContent = '\uFEFF';
        csvContent += 'ID;Chave Projeto;Nome Projeto;Título Tarefa;Status;Prioridade;Story Points;Responsável;Data Criacao;Data Conclusao\n';

        rows.forEach(r => {
            const cleanTitle = (r.title || '').replace(/;/g, ',');
            const cleanProject = (r.project_name || '').replace(/;/g, ',');
            csvContent += `${r.id};${r.project_key};${cleanProject};"${cleanTitle}";${r.status};${r.priority};${r.story_points};${r.assignee};${r.created_at || ''};${r.completed_at || ''}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_tarefas_${Date.now()}.csv"`);
        res.send(csvContent);
    } catch (err) {
        console.error('Erro ao exportar CSV:', err);
        res.status(500).send('Erro ao gerar arquivo CSV.');
    }
};

// Exportar PDF / Formatação de Relatório de Impressão
exports.exportPDF = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const status = req.query.status || '';
        const priority = req.query.priority || '';

        let sql = `
            SELECT t.id, t.title, p.key as project_key, p.name as project_name, 
                   t.status, t.priority, t.story_points, 
                   COALESCE(tm.name, 'Não atribuído') as assignee,
                   t.created_at, t.completed_at
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN team_members tm ON t.assignee_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (projectId) {
            sql += ` AND t.project_id = ?`;
            params.push(projectId);
        }
        if (status) {
            sql += ` AND t.status = ?`;
            params.push(status);
        }
        if (priority) {
            sql += ` AND t.priority = ?`;
            params.push(priority);
        }

        const tasks = await db.all(sql, params);
        const projects = await Project.getAll();

        res.render('pages/report_pdf', {
            title: 'Relatório Oficial de Projetos & Tarefas',
            tasks,
            projects,
            generatedAt: new Date().toLocaleString('pt-BR')
        });
    } catch (err) {
        console.error('Erro ao gerar relatório PDF:', err);
        res.status(500).send('Erro ao gerar relatório PDF.');
    }
};
