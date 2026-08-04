const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');

exports.list = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        const category = req.query.category || '';
        const status = req.query.status || '';

        const projects = await Project.getAll(search, category, status);
        const teamMembers = await TeamMember.getAll();

        res.render('pages/projects/index', {
            title: 'Projetos',
            activePage: 'projects',
            projects,
            teamMembers,
            search,
            category,
            status
        });
    } catch (err) {
        console.error('Erro ao listar projetos:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar lista de projetos.', activePage: 'projects' });
    }
};

exports.create = async (req, res) => {
    try {
        let { name, key, description, status, category, owner_id, start_date, end_date } = req.body;
        
        name = (name || '').trim();
        key = (key || '').trim().toUpperCase();

        if (!name || !key) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Nome do projeto e Chave (KEY) são obrigatórios.' });
            }
            return res.status(400).render('pages/error', { message: 'Nome do projeto e Chave (KEY) são obrigatórios.', activePage: 'projects' });
        }

        if (key.length < 2 || key.length > 8) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'A Chave (KEY) deve conter entre 2 e 8 caracteres.' });
            }
            return res.status(400).render('pages/error', { message: 'A Chave (KEY) deve conter entre 2 e 8 caracteres.', activePage: 'projects' });
        }

        const projectId = await Project.create({ name, key, description, status, category, owner_id, start_date, end_date });
        
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Projeto criado com sucesso!', projectId });
        }
        res.redirect('/projects');
    } catch (err) {
        console.error('Erro ao criar projeto:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Já existe um projeto cadastrado com esta Chave (KEY).' });
            }
            return res.status(400).render('pages/error', { message: 'Já existe um projeto cadastrado com esta Chave (KEY).', activePage: 'projects' });
        }
        res.status(500).render('pages/error', { message: 'Erro interno ao criar projeto.', activePage: 'projects' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de projeto inválido.', activePage: 'projects' });
        }

        let { name, key, description, status, category, owner_id, start_date, end_date } = req.body;
        name = (name || '').trim();
        key = (key || '').trim().toUpperCase();

        if (!name || !key) {
            return res.status(400).render('pages/error', { message: 'Nome e Chave (KEY) são obrigatórios.', activePage: 'projects' });
        }

        await Project.update(numId, { name, key, description, status, category, owner_id, start_date, end_date });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Projeto atualizado com sucesso!' });
        }
        res.redirect('/projects');
    } catch (err) {
        console.error('Erro ao atualizar projeto:', err);
        res.status(500).render('pages/error', { message: 'Erro ao atualizar projeto.', activePage: 'projects' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de projeto inválido.', activePage: 'projects' });
        }

        await Project.delete(numId);

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Projeto excluído com sucesso!' });
        }
        res.redirect('/projects');
    } catch (err) {
        console.error('Erro ao excluir projeto:', err);
        res.status(500).render('pages/error', { message: 'Erro ao excluir projeto.', activePage: 'projects' });
    }
};

exports.detail = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(404).render('pages/error', { message: 'ID de projeto inválido.', activePage: 'projects' });
        }

        const project = await Project.getById(numId);

        if (!project) {
            return res.status(404).render('pages/error', { message: 'Projeto não encontrado no banco de dados.', activePage: 'projects' });
        }

        const members = await Project.getMembers(numId);
        const currentSprint = await Project.getCurrentSprint(numId);
        const sprints = await Project.getSprints(numId);
        const backlog = await Project.getBacklog(numId);
        const kpis = await Project.getKPIs(numId);
        const goals = await Project.getGoals(numId);
        const history = await Project.getHistory(numId);
        const teamMembers = await TeamMember.getAll();

        const activeTab = req.query.tab || 'resumo';

        res.render('pages/projects/show', {
            title: `${project.name} (${project.key})`,
            activePage: 'projects',
            project,
            members,
            currentSprint,
            sprints,
            backlog,
            kpis,
            goals,
            history,
            teamMembers,
            activeTab
        });
    } catch (err) {
        console.error('Erro ao exibir detalhes do projeto:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar detalhes do projeto.', activePage: 'projects' });
    }
};
