const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

exports.list = async (req, res) => {
    try {
        const projectId = req.query.project_id || '';
        const search = (req.query.search || '').trim();

        const sprints = await Sprint.getAll(projectId, search);
        const projects = await Project.getAll();

        res.render('pages/sprints', {
            title: 'Sprints',
            activePage: 'sprints',
            sprints,
            projects,
            projectId,
            search
        });
    } catch (err) {
        console.error('Erro ao listar sprints:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar lista de sprints.', activePage: 'sprints' });
    }
};

exports.create = async (req, res) => {
    try {
        let { project_id, name, goal, status, start_date, end_date } = req.body;
        name = (name || '').trim();

        if (!project_id || !name) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Projeto e Nome da Sprint são obrigatórios.' });
            }
            return res.status(400).render('pages/error', { message: 'Projeto e Nome da Sprint são obrigatórios.', activePage: 'sprints' });
        }

        const sprintId = await Sprint.create({ project_id, name, goal, status, start_date, end_date });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Sprint criada com sucesso!', sprintId });
        }
        res.redirect('/sprints');
    } catch (err) {
        console.error('Erro ao criar sprint:', err);
        res.status(500).render('pages/error', { message: 'Erro ao criar sprint.', activePage: 'sprints' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de sprint inválido.', activePage: 'sprints' });
        }

        let { name, goal, status, start_date, end_date } = req.body;
        name = (name || '').trim();

        await Sprint.update(numId, { name, goal, status, start_date, end_date });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Sprint atualizada com sucesso!' });
        }
        res.redirect('/sprints');
    } catch (err) {
        console.error('Erro ao atualizar sprint:', err);
        res.status(500).render('pages/error', { message: 'Erro ao atualizar sprint.', activePage: 'sprints' });
    }
};

exports.finish = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de sprint inválido.', activePage: 'sprints' });
        }

        await Sprint.finish(numId);

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Sprint finalizada com sucesso!' });
        }
        res.redirect('/sprints');
    } catch (err) {
        console.error('Erro ao finalizar sprint:', err);
        res.status(500).render('pages/error', { message: 'Erro ao finalizar sprint.', activePage: 'sprints' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de sprint inválido.', activePage: 'sprints' });
        }

        await Sprint.delete(numId);

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Sprint excluída com sucesso!' });
        }
        res.redirect('/sprints');
    } catch (err) {
        console.error('Erro ao excluir sprint:', err);
        res.status(500).render('pages/error', { message: 'Erro ao excluir sprint.', activePage: 'sprints' });
    }
};
