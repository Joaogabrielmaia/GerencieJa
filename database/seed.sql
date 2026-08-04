-- Seed SQL para popular dados reais de demonstração no SQLite

INSERT INTO team_members (name, email, role, avatar_url) VALUES
('Ana Silva', 'ana.silva@empresa.com', 'Product Owner', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('Carlos Eduardo', 'carlos.eduardo@empresa.com', 'Scrum Master', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('Beatriz Costa', 'beatriz.costa@empresa.com', 'Desenvolvedora Full Stack', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
('Diego Martins', 'diego.martins@empresa.com', 'UX/UI Designer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('Fernanda Lima', 'fernanda.lima@empresa.com', 'QA Engineer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

INSERT INTO projects (name, key, description, status, category, owner_id, start_date, end_date) VALUES
('Plataforma E-commerce V2', 'PEC', 'Redesign completo da plataforma principal com suporte a checkout transparente e microserviços.', 'Em Andamento', 'Desenvolvimento', 1, '2026-07-01', '2026-10-30'),
('App Mobile iOS/Android', 'MOB', 'Aplicativo nativo para clientes realizarem acompanhamento de pedidos e notificações push em tempo real.', 'Em Andamento', 'Mobile', 2, '2026-06-15', '2026-11-15'),
('Sistema de Design System', 'DSY', 'Criação de tokens, biblioteca de componentes reutilizáveis em TailwindCSS e documentação no Storybook.', 'Concluído', 'Design', 4, '2026-05-01', '2026-07-30'),
('Migração Cloud AWS', 'AWS', 'Migração da infraestrutura on-premise para AWS ECS, RDS e CloudFront.', 'Planejamento', 'Infraestrutura', 3, '2026-08-10', '2026-12-20');

INSERT INTO project_members (project_id, member_id, assigned_role) VALUES
(1, 1, 'Product Owner'),
(1, 2, 'Scrum Master'),
(1, 3, 'Desenvolvedora Lead'),
(1, 4, 'Designer UI'),
(2, 2, 'Scrum Master'),
(2, 3, 'Desenvolvedor Mobile'),
(2, 5, 'QA Engineer'),
(3, 4, 'Lead Designer'),
(3, 3, 'Frontend Engineer'),
(4, 3, 'DevOps Engineer');

INSERT INTO sprints (project_id, name, goal, status, start_date, end_date) VALUES
(1, 'Sprint 1 - Autenticação & Checkout', 'Finalizar fluxo de login, cadastro e integração com gateway de pagamento.', 'Concluída', '2026-07-01', '2026-07-14'),
(1, 'Sprint 2 - Catálogo & Carrinho', 'Implementar catálogo com filtros dinâmicos e persistência do carrinho.', 'Ativa', '2026-07-15', '2026-08-05'),
(1, 'Sprint 3 - Gestão de Pedidos', 'Painel de acompanhamento de entrega e emissão de notas fiscais.', 'Planejada', '2026-08-06', '2026-08-20'),
(2, 'Sprint Alpha 1', 'Construção da arquitetura base em React Native e navegação.', 'Concluída', '2026-06-15', '2026-07-05'),
(2, 'Sprint Alpha 2 - Push Notifications', 'Integrar Firebase Cloud Messaging e testes em ambiente staging.', 'Ativa', '2026-07-06', '2026-08-10');

INSERT INTO tasks (project_id, sprint_id, title, description, status, priority, story_points, assignee_id, reporter_id, started_at, completed_at) VALUES
(1, 2, 'Implementar filtro por categoria e preço', 'Adicionar busca facetada no catálogo com atualização assíncrona dos produtos.', 'In Progress', 'Alta', 5, 3, 1, '2026-07-16 09:00:00', NULL),
(1, 2, 'Refatorar componente de carrinho de compras', 'Otimizar performance de cálculo de frete e cupom de desconto.', 'To Do', 'Média', 3, 3, 2, NULL, NULL),
(1, 2, 'Ajustar layout responsivo da página de produto', 'Corrigir desalinhamento de imagens em telas mobile de alta densidade.', 'Review', 'Urgente', 2, 4, 1, '2026-07-18 10:30:00', NULL),
(1, 1, 'Configurar conexão com Gateway de Pagamento', 'Integração via API REST com suporte a cartão de crédito e PIX.', 'Done', 'Alta', 8, 3, 1, '2026-07-02 08:00:00', '2026-07-12 17:00:00'),
(1, 1, 'Criar tela de Login e Registro', 'Autenticação via JWT com suporte a tokens de refresh.', 'Done', 'Alta', 5, 3, 2, '2026-07-01 10:00:00', '2026-07-08 14:00:00'),
(1, NULL, 'Suporte a compras corporativas (B2B)', 'Permitir faturamento com CNPJ e limite de crédito customizado.', 'Backlog', 'Baixa', 13, NULL, 1, NULL, NULL),
(2, 5, 'Implementar serviço de Push Notification', 'Configurar APNS e FCM para envio de atualizações de pedido.', 'In Progress', 'Alta', 5, 3, 2, '2026-07-10 11:00:00', NULL),
(2, 5, 'Testes automatizados de regressão no app', 'Criar suite de testes em Detox cobrindo o fluxo de login e checkout.', 'To Do', 'Média', 5, 5, 2, NULL, NULL);

INSERT INTO goals (project_id, title, description, target_value, current_value, unit, status, due_date) VALUES
(1, 'Aumentar taxa de conversão no checkout', 'Reduzir abandono de carrinho otimizando tempo de resposta em 30%', 100, 65, '%', 'Em Progresso', '2026-09-30'),
(1, 'Cobertura de testes acima de 85%', 'Garantir estabilidade na API de pagamentos e cálculo de estoque', 85, 78, '%', 'Em Progresso', '2026-08-31'),
(2, 'Lançar Beta na App Store e Google Play', 'Publicação nas lojas para teste fechado com 500 usuários', 100, 40, '%', 'Em Progresso', '2026-09-15');

INSERT INTO project_history (project_id, user_name, action, details) VALUES
(1, 'Ana Silva', 'Projeto Criado', 'Projeto "Plataforma E-commerce V2" iniciado com chave PEC.'),
(1, 'Carlos Eduardo', 'Sprint Criada', 'Sprint 1 - Autenticação & Checkout planejada para 14 dias.'),
(1, 'Beatriz Costa', 'Tarefa Concluída', 'Tarefa "Configurar conexão com Gateway de Pagamento" concluída (8 pts).'),
(1, 'Carlos Eduardo', 'Sprint Concluída', 'Sprint 1 finalizada com 13 de 13 story points entregues.'),
(1, 'Carlos Eduardo', 'Sprint Iniciada', 'Sprint 2 - Catálogo & Carrinho foi ativada com sucesso.');
