# Guia de Testes da API

Este documento explica como executar e criar testes para a API Node.js.

## Configuração

O projeto está configurado com:
- **Jest**: Framework de testes
- **Supertest**: Para testes de integração de APIs
- **ES Modules**: Suporte a import/export

## Scripts Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

## Estrutura de Testes

```
tests/
├── setup.js                    # Configuração global dos testes
├── integration/                # Testes de integração
│   ├── auth.test.js           # Testes de autenticação
│   └── products.test.js       # Testes de produtos
└── middleware/                 # Testes unitários de middleware
    └── authMiddleware.test.js  # Testes do middleware de auth
```

## Tipos de Testes

### 1. Testes de Integração
Testam a API como um todo, incluindo rotas, controllers e banco de dados.

**Exemplo:**
```javascript
import request from 'supertest';
import app from '../../app.js';

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body).toHaveProperty('message');
  });
});
```

### 2. Testes Unitários
Testam funções específicas isoladamente.

**Exemplo:**
```javascript
import { checkToken } from '../../scr/middleware/authMiddleware.js';

describe('Auth Middleware', () => {
  it('should validate token correctly', () => {
    // Teste da função
  });
});
```

## Boas Práticas

1. **Nomenclatura**: Use `.test.js` para arquivos de teste
2. **Organização**: Agrupe testes relacionados em `describe` blocks
3. **Isolamento**: Cada teste deve ser independente
4. **Limpeza**: Use `beforeEach`/`afterEach` para limpar estado
5. **Mocks**: Use mocks para dependências externas

## Exemplos de Testes

### Teste de Endpoint com Autenticação
```javascript
it('should access protected route with valid token', async () => {
  const response = await request(app)
    .get('/products')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

### Teste de Validação
```javascript
it('should return error for invalid data', async () => {
  const response = await request(app)
    .post('/auth/register')
    .send(invalidData)
    .expect(400);
  
  expect(response.body).toHaveProperty('error');
});
```

## Configuração de Ambiente

Para testes, use o arquivo `.env.test` com configurações específicas:
- Banco de dados de teste
- Chaves JWT de teste
- Configurações de teste

## Cobertura de Código

Execute `npm run test:coverage` para gerar relatório de cobertura:
- Mostra quais linhas de código foram testadas
- Identifica código não testado
- Gera relatório HTML em `coverage/`

## Troubleshooting

### Erro de ES Modules
Se encontrar erros de import/export, verifique:
- Arquivos têm extensão `.js`
- Usa `import`/`export` corretamente
- Jest configurado para ES modules

### Erro de Banco de Dados
Para testes de integração:
- Use banco de dados separado para testes
- Limpe dados entre testes
- Use transações quando possível 