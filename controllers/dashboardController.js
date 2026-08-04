const Dashboard = require('../models/Dashboard');
const KPI = require('../models/KPI');

exports.index = async (req, res) => {
    try {
        const metrics = await Dashboard.getMetrics();
        const agileKPIs = await KPI.getAgileMetrics();

        res.render('pages/dashboard', {
            title: 'Dashboard',
            activePage: 'dashboard',
            metrics,
            agileKPIs
        });
    } catch (err) {
        console.error('Erro no Dashboard Controller:', err);
        res.status(500).render('pages/error', { message: 'Erro ao carregar o dashboard.', activePage: 'dashboard' });
    }
};
