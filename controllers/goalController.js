const Goal = require('../models/Goal');
const Project = require('../models/Project');

exports.list = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const search = (req.query.search || '').trim();

        const goals = await Goal.getAll(projectId, search);
        const projects = await Project.getAll();

        res.render('pages/goals', {
            title: 'Metas',
            activePage: 'goals',
            goals,
            projects,
            projectId,
            search
        });
    } catch (err) {
        console.error('Erro ao listar metas:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar lista de metas.', activePage: 'goals' });
    }
};

exports.create = async (req, res) => {
    try {
        let { project_id, title, description, target_value, current_value, unit, status, due_date } = req.body;
        title = (title || '').trim();

        if (!project_id || !title) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Projeto e Título da meta são obrigatórios.' });
            }
            return res.status(400).render('pages/error', { message: 'Projeto e Título da meta são obrigatórios.', activePage: 'goals' });
        }

        const goalId = await Goal.create({ project_id, title, description, target_value, current_value, unit, status, due_date });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Meta criada com sucesso!', goalId });
        }
        res.redirect('/goals');
    } catch (err) {
        console.error('Erro ao criar meta:', err);
        res.status(500).render('pages/error', { message: 'Erro ao criar meta.', activePage: 'goals' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de meta inválido.', activePage: 'goals' });
        }

        let { title, description, target_value, current_value, unit, status, due_date } = req.body;
        title = (title || '').trim();

        await Goal.update(numId, { title, description, target_value, current_value, unit, status, due_date });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Meta atualizada com sucesso!' });
        }
        res.redirect('/goals');
    } catch (err) {
        console.error('Erro ao atualizar meta:', err);
        res.status(500).render('pages/error', { message: 'Erro ao atualizar meta.', activePage: 'goals' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de meta inválido.', activePage: 'goals' });
        }

        await Goal.delete(numId);

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Meta excluída com sucesso!' });
        }
        res.redirect('/goals');
    } catch (err) {
        console.error('Erro ao excluir meta:', err);
        res.status(500).render('pages/error', { message: 'Erro ao excluir meta.', activePage: 'goals' });
    }
};
