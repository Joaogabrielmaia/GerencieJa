const express = require('express');
const path = require('path');

require('./database/db');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.formatDate = function (dateStr) {
    if (!dateStr) return 'Não informada';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
};

app.locals.formatDateTime = function (dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('pt-BR');
};

const dashboardRoutes = require('./routes/dashboardRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const kanbanRoutes = require('./routes/kanbanRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/', dashboardRoutes);
app.use('/projects', projectRoutes);
app.use('/team', teamRoutes);
app.use('/sprints', sprintRoutes);
app.use('/kanban', kanbanRoutes);
app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);

app.use((req, res) => {
    res.status(404).render('pages/error', {
        title: 'Página Não Encontrada (404)',
        message: 'A página ou recurso solicitado não existe ou foi movido.',
        activePage: ''
    });
});

app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).render('pages/error', {
        title: 'Erro Interno do Servidor (500)',
        message: 'Ocorreu um erro ao processar sua requisição.',
        activePage: ''
    });
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor GerêncieJá rodando na porta ${PORT}`);
    console.log(`🔗 Acesse: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
