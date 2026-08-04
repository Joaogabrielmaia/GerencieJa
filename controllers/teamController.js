const TeamMember = require('../models/TeamMember');

exports.list = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        const members = await TeamMember.getAll(search);

        res.render('pages/team', {
            title: 'Equipe',
            activePage: 'team',
            members,
            search
        });
    } catch (err) {
        console.error('Erro ao listar equipe:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar lista da equipe.', activePage: 'team' });
    }
};

exports.create = async (req, res) => {
    try {
        let { name, email, role, avatar_url } = req.body;

        name = (name || '').trim();
        email = (email || '').trim().toLowerCase();
        role = (role || '').trim();

        if (!name || !email || !role) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Nome, E-mail e Cargo são obrigatórios.' });
            }
            return res.status(400).render('pages/error', { message: 'Nome, E-mail e Cargo são obrigatórios.', activePage: 'team' });
        }

        const memberId = await TeamMember.create({ name, email, role, avatar_url });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Membro cadastrado com sucesso!', memberId });
        }
        res.redirect('/team');
    } catch (err) {
        console.error('Erro ao cadastrar membro:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, message: 'Já existe um integrante da equipe cadastrado com este e-mail.' });
            }
            return res.status(400).render('pages/error', { message: 'Já existe um integrante cadastrado com este e-mail.', activePage: 'team' });
        }
        res.status(500).render('pages/error', { message: 'Erro ao cadastrar membro da equipe.', activePage: 'team' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de integrante inválido.', activePage: 'team' });
        }

        let { name, email, role, avatar_url } = req.body;
        name = (name || '').trim();
        email = (email || '').trim().toLowerCase();

        await TeamMember.update(numId, { name, email, role, avatar_url });

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Membro atualizado com sucesso!' });
        }
        res.redirect('/team');
    } catch (err) {
        console.error('Erro ao atualizar membro:', err);
        res.status(500).render('pages/error', { message: 'Erro ao atualizar membro da equipe.', activePage: 'team' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
            return res.status(400).render('pages/error', { message: 'ID de integrante inválido.', activePage: 'team' });
        }

        await TeamMember.delete(numId);

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Membro excluído com sucesso!' });
        }
        res.redirect('/team');
    } catch (err) {
        console.error('Erro ao excluir membro:', err);
        res.status(500).render('pages/error', { message: 'Erro ao excluir membro da equipe.', activePage: 'team' });
    }
};
