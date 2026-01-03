# 📚 Documentação da API PDV

**URL Base:** `http://localhost:3001/api`

**Ambiente:** Development (sem autenticação HTTPS)

---

## 🔐 Autenticação

A maioria dos endpoints requer um **JWT Token** obtido através do login.

### 1️⃣ Registrar novo usuário

```http
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "username": "joao_vitor",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "joao_vitor",
  "email": "joao@example.com",
  "role": "USER",
  "active": true
}
```

---

### 2️⃣ Fazer Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "username": "joao_vitor",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "joao_vitor",
    "email": "joao@example.com",
    "role": "USER"
  }
}
```

**⚠️ Importante:** Use o `access_token` em todas as requisições protegidas:

```http
Authorization: Bearer <seu_access_token_aqui>
```

---

## 📦 CATEGORIAS

### 1️⃣ Criar Categoria (Requer Auth)

```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Bebidas"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Bebidas",
  "products": []
}
```

---

### 2️⃣ Listar Categorias (Público)

```http
GET /api/categories
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Bebidas",
    "products": []
  },
  {
    "id": 2,
    "name": "Alimentos",
    "products": []
  }
]
```

---

### 3️⃣ Obter Categoria por ID (Público)

```http
GET /api/categories/1
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Bebidas",
  "products": []
}
```

---

### 4️⃣ Atualizar Categoria (Requer Auth)

```http
PUT /api/categories/1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Bebidas Quentes"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Bebidas Quentes",
  "products": []
}
```

---

### 5️⃣ Deletar Categoria (Requer Auth)

```http
DELETE /api/categories/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Bebidas",
  "products": []
}
```

---

## 🛍️ PRODUTOS

### 1️⃣ Criar Produto (Requer Auth)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "sku": "PROD-001",
  "name": "Coca-Cola 2L",
  "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
  "price": 8.50,
  "stockQuantity": 50,
  "categoryId": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Coca-Cola 2L",
  "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
  "price": "8.50",
  "stockQuantity": 50,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Bebidas"
  }
}
```

---

### 2️⃣ Listar Produtos (Público)

```http
GET /api/products
```

**Com filtros:**
```http
GET /api/products?name=Coca&categoryId=1&sku=PROD-001
```

**Response (200):**
```json
[
  {
    "id": 1,
    "sku": "PROD-001",
    "name": "Coca-Cola 2L",
    "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
    "price": "8.50",
    "stockQuantity": 50,
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Bebidas"
    }
  }
]
```

---

### 3️⃣ Obter Produto por ID (Público)

```http
GET /api/products/1
```

**Response (200):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Coca-Cola 2L",
  "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
  "price": "8.50",
  "stockQuantity": 50,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Bebidas"
  }
}
```

---

### 4️⃣ Atualizar Produto (Requer Auth)

```http
PUT /api/products/1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Coca-Cola 2L Zero",
  "price": 9.00,
  "stockQuantity": 40
}
```

**Response (200):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Coca-Cola 2L Zero",
  "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
  "price": "9.00",
  "stockQuantity": 40,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Bebidas"
  }
}
```

---

### 5️⃣ Deletar Produto (Requer Auth)

```http
DELETE /api/products/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Coca-Cola 2L",
  "description": "Refrigerante Coca-Cola em garrafa de 2 litros",
  "price": "8.50",
  "stockQuantity": 50,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Bebidas"
  }
}
```

---

## 👥 CLIENTES

### 1️⃣ Criar Cliente (Requer Auth)

```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "João Silva",
  "document": "123.456.789-00",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "document": "123.456.789-00",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321",
  "sales": []
}
```

---

### 2️⃣ Listar Clientes (Público)

```http
GET /api/customers
```

**Com filtros:**
```http
GET /api/customers?name=João&document=123.456.789-00
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "document": "123.456.789-00",
    "email": "joao.silva@email.com",
    "phone": "(11) 98765-4321",
    "sales": []
  }
]
```

---

### 3️⃣ Obter Cliente por ID (Público)

```http
GET /api/customers/1
```

**Response (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "document": "123.456.789-00",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321",
  "sales": []
}
```

---

### 4️⃣ Atualizar Cliente (Requer Auth)

```http
PUT /api/customers/1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "(11) 99999-9999",
  "email": "novo.email@example.com"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "document": "123.456.789-00",
  "email": "novo.email@example.com",
  "phone": "(11) 99999-9999",
  "sales": []
}
```

---

### 5️⃣ Deletar Cliente (Requer Auth)

```http
DELETE /api/customers/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "document": "123.456.789-00",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321",
  "sales": []
}
```

---

## 💳 VENDAS

### 1️⃣ Criar Venda (Requer Auth)

```http
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 8.50
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 12.00
    }
  ],
  "customerId": 1,
  "paymentMethod": "DINHEIRO",
  "status": "COMPLETED"
}
```

**Response (201):**
```json
{
  "id": 1,
  "date": "2025-12-31T17:28:14.000Z",
  "total": "29.00",
  "paymentMethod": "DINHEIRO",
  "status": "COMPLETED",
  "customerId": 1,
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "unitPrice": "8.50",
      "subtotal": "17.00",
      "saleId": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "sku": "PROD-001",
        "name": "Coca-Cola 2L",
        "price": "8.50",
        "stockQuantity": 48,
        "categoryId": 1
      }
    },
    {
      "id": 2,
      "quantity": 1,
      "unitPrice": "12.00",
      "subtotal": "12.00",
      "saleId": 1,
      "productId": 2,
      "product": {
        "id": 2,
        "sku": "PROD-002",
        "name": "Suco Natural",
        "price": "12.00",
        "stockQuantity": 19,
        "categoryId": 1
      }
    }
  ],
  "customer": {
    "id": 1,
    "name": "João Silva",
    "document": "123.456.789-00",
    "email": "joao.silva@email.com",
    "phone": "(11) 98765-4321"
  }
}
```

**⚠️ Validações:**
- Produto deve existir
- Categoria deve existir
- Estoque insuficiente gera erro 400
- O estoque é decrementado automaticamente

---

### 2️⃣ Listar Vendas (Público)

```http
GET /api/sales
```

**Com filtros:**
```http
GET /api/sales?status=COMPLETED&customerId=1
```

**Response (200):**
```json
[
  {
    "id": 1,
    "date": "2025-12-31T17:28:14.000Z",
    "total": "29.00",
    "paymentMethod": "DINHEIRO",
    "status": "COMPLETED",
    "customerId": 1,
    "items": [...],
    "customer": {...}
  }
]
```

---

### 3️⃣ Obter Venda por ID (Público)

```http
GET /api/sales/1
```

**Response (200):**
```json
{
  "id": 1,
  "date": "2025-12-31T17:28:14.000Z",
  "total": "29.00",
  "paymentMethod": "DINHEIRO",
  "status": "COMPLETED",
  "customerId": 1,
  "items": [...],
  "customer": {...}
}
```

---

### 4️⃣ Atualizar Status da Venda (Requer Auth)

```http
PUT /api/sales/1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "OPEN"
}
```

**Response (200):**
```json
{
  "id": 1,
  "date": "2025-12-31T17:28:14.000Z",
  "total": "29.00",
  "paymentMethod": "DINHEIRO",
  "status": "OPEN",
  "customerId": 1,
  "items": [...],
  "customer": {...}
}
```

**Status válidos:** `OPEN`, `COMPLETED`, `CANCELED`

---

### 5️⃣ Cancelar Venda (Requer Auth)

```http
POST /api/sales/1/cancel
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "date": "2025-12-31T17:28:14.000Z",
  "total": "29.00",
  "paymentMethod": "DINHEIRO",
  "status": "CANCELED",
  "customerId": 1,
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "unitPrice": "8.50",
      "subtotal": "17.00",
      "saleId": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "stockQuantity": 50
      }
    }
  ],
  "customer": {...}
}
```

**⚠️ Importante:** Cancelar uma venda restaura o estoque automaticamente!

---

## 🧪 Como Testar

### Opção 1: Usando cURL (Terminal)

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "email": "teste@example.com",
    "password": "senha123"
  }'

# 2. Fazer login e copiar o token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "password": "senha123"
  }'

# 3. Usar o token em requisições protegidas
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer seu_token_aqui"
```

### Opção 2: Usando Insomnia ou Postman

1. Abra o Insomnia/Postman
2. Crie uma variável de ambiente chamada `TOKEN`
3. Execute o login e extraia o token
4. Use `Authorization: Bearer {{TOKEN}}` nos headers

### Opção 3: Usando Thunder Client (VS Code)

1. Instale a extensão Thunder Client
2. Copie os exemplos acima
3. Cole na interface do Thunder Client

---

## ⚠️ Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| **400** | Bad Request - Validação falhou |
| **401** | Unauthorized - Token inválido ou expirado |
| **404** | Not Found - Recurso não encontrado |
| **409** | Conflict - Recurso duplicado (SKU, email, documento) |
| **500** | Internal Server Error - Erro no servidor |

---

## 📝 Notas Importantes

- **JWT Expira em:** 24 horas (configurável em `.env`)
- **Estoque:** É decrementado ao criar venda e restaurado ao cancelar
- **Preços:** Devem ser números positivos (ex: 8.50, 12.00)
- **Roles:** `USER`, `ADMIN`, `MANAGER` (opcional no registro, padrão: `USER`)
- **Dados Sensíveis:** Senha não é retornada nas respostas

---

## 🔄 Fluxo de Teste Recomendado

1. **Registrar usuário** → Obter credenciais
2. **Login** → Obter JWT token
3. **Criar categoria** → Usar token (protegido)
4. **Criar produtos** → Associar à categoria
5. **Criar cliente** → Usar token
6. **Criar venda** → Validar estoque e total
7. **Listar vendas** → Sem token (público)
8. **Cancelar venda** → Validar restauração de estoque

---

**Última atualização:** 31 de dezembro de 2025
