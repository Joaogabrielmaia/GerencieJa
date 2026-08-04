const Task = require('../models/Task');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const TeamMember = require('../models/TeamMember');
exports.index = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const sprintId = req.query.sprint_id || '';
        const search = (req.query.search || '').trim();
        const tasks = await Task.getAll(projectId, sprintId, search);
        const projects = await Project.getAll();
        const sprints = projectId ? await Sprint.getAll(projectId) : await Sprint.getAll();
        const teamMembers = await TeamMember.getAll();
        const columns = {
            'Backlog': tasks.filter(t => t.status === 'Backlog'),
            'To Do': tasks.filter(t => t.status === 'To Do' || t.status === 'A Fazer'),
            'In Progress': tasks.filter(t => t.status === 'In Progress' || t.status === 'Em Progresso'),
            'Review': tasks.filter(t => t.status === 'Review' || t.status === 'Em Revisão'),
            'Done': tasks.filter(t => t.status === 'Done' || t.status === 'Concluído')
        };
        res.render('pages/kanban', {
            title: 'Kanban',
            activePage: 'kanban',
            columns,
            tasks,
            projects,
            sprints,
            teamMembers,
            projectId,
            sprintId,
            search
        });
    } catch (err) {
        console.error('Erro ao carregar o Kanban:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar o quadro Kanban.', activePage: 'kanban' });
    }
};
exports.moveTask = async (req, res) => {
    try {
        const { taskId, newStatus } = req.body;
        const numId = parseInt(taskId);
        if (isNaN(numId) || numId <= 0 || !newStatus) {
            return res.status(400).json({ success: false, message: 'ID da tarefa e novo status são obrigatórios.' });
        }
        const updated = await Task.updateStatus(numId, newStatus);
        if (updated) {
            return res.json({ success: true, message: `Tarefa movida para ${newStatus} com sucesso!` });
        }
        res.status(400).json({ success: false, message: 'Não foi possível mover a tarefa.' });
    } catch (err) {
        console.error('Erro ao mover tarefa no Kanban:', err);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar movimento no SQLite.' });
    }
};
exports.createTask = async (req, res) => {
    try {
        let { project_id, sprint_id, title, description, status, priority, story_points, assignee_id } = req.body;
        title = (title || '').trim();
        if (!project_id || !title) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Projeto e Título da tarefa são obrigatórios.' });
            }
            return res.status(400).render('pages/error', { message: 'Projeto e Título da tarefa são obrigatórios.', activePage: 'kanban' });
        }
        const taskId = await Task.create({ project_id, sprint_id, title, description, status, priority, story_points, assignee_id });
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Tarefa criada com sucesso!', taskId });
        }
        res.redirect('/kanban');
    } catch (err) {
        console.error('Erro ao criar tarefa:', err);
        res.status(500).render('pages/error', { message: 'Erro ao criar tarefa.', activePage: 'kanban' });
    }
};
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de tarefa inválido.', activePage: 'kanban' });
        }
        let { project_id, sprint_id, title, description, status, priority, story_points, assignee_id } = req.body;
        title = (title || '').trim();
        await Task.update(numId, { project_id, sprint_id, title, description, status, priority, story_points, assignee_id });
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Tarefa atualizada com sucesso!' });
        }
        res.redirect('/kanban');
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
        res.status(500).render('pages/error', { message: 'Erro ao atualizar tarefa.', activePage: 'kanban' });
    }
};
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de tarefa inválido.', activePage: 'kanban' });
        }
        await Task.delete(numId);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Tarefa excluída com sucesso!' });
        }
        res.redirect('/kanban');
    } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        res.status(500).render('pages/error', { message: 'Erro ao excluir tarefa.', activePage: 'kanban' });
    }
};
