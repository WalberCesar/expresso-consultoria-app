-- Script para popular o banco de dados com dados de teste
-- Execute este arquivo após conectar ao MySQL

USE expresso_consultoria_dev;

-- Limpar dados existentes
DELETE FROM usuarios;
DELETE FROM empresas;

-- Inserir empresas
INSERT INTO empresas (nome, cnpj) VALUES
('Empresa A', '11.111.111/0001-11'),
('Empresa B', '22.222.222/0001-22');

-- Inserir usuários (senhas já hasheadas com bcrypt)
-- Senha para usuario.a@empresaa.com: senha123
-- Senha para usuario.b@empresab.com: senha456
INSERT INTO usuarios (nome, email, senha, empresa_id) VALUES
('Usuário A', 'usuario.a@empresaa.com', '$2b$10$YourHashedPasswordHere1', 1),
('Usuário B', 'usuario.b@empresab.com', '$2b$10$YourHashedPasswordHere2', 2);

-- Verificar dados inseridos
SELECT u.id, u.nome, u.email, e.nome as empresa 
FROM usuarios u 
JOIN empresas e ON u.empresa_id = e.id;
