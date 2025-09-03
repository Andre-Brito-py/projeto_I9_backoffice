# Sistema de Gestão de Notas por Loja

Um sistema completo para gerenciar notas organizadas por lojas e categorias, com funcionalidades de lembretes.

## Tecnologias Utilizadas

### Backend
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **H2 Database** (banco em memória para desenvolvimento)
- **Maven** (gerenciamento de dependências)

### Frontend
- **HTML5**
- **CSS3** (design responsivo)
- **JavaScript ES6+**
- **Font Awesome** (ícones)

## Estrutura do Projeto

```
notas-bko-I9/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/notasbko/
│       │       ├── NotasBkoApplication.java
│       │       ├── controller/
│       │       ├── entity/
│       │       └── repository/
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── index.html
│               ├── css/
│               └── js/
└── pom.xml
```

## Funcionalidades

### 📊 Dashboard
- Resumo geral do sistema
- Estatísticas de notas por status
- Atividades recentes
- Gráficos informativos

### 🏪 Gestão de Lojas
- Criar, editar e excluir lojas
- Buscar lojas por nome
- Visualizar categorias por loja

### 📝 Gestão de Notas
- Criar notas organizadas por categoria e loja
- Status: Pendente, Em Andamento, Concluído
- Busca por título ou conteúdo
- Filtros por status, loja e categoria

### 🔔 Sistema de Lembretes
- Criar lembretes associados às notas
- Lembretes com data/hora específica
- Status ativo/inativo
- Visualização de lembretes próximos e atrasados

## Como Executar

### Pré-requisitos
- Java 17 ou superior
- Maven 3.6+ ou IDE com suporte ao Maven

### Opção 1: Usando Maven (linha de comando)
```bash
# Navegar até o diretório do projeto
cd notas-bko-I9

# Executar a aplicação
mvn spring-boot:run
```

### Opção 2: Usando IDE
1. Abra o projeto em sua IDE (IntelliJ IDEA, Eclipse, VS Code)
2. Execute a classe `NotasBkoApplication.java`

### Opção 3: Gerando JAR executável
```bash
# Compilar e gerar o JAR
mvn clean package

# Executar o JAR
java -jar target/notas-bko-0.0.1-SNAPSHOT.jar
```

## Acesso à Aplicação

- **URL da Aplicação:** http://localhost:8080
- **Console H2 Database:** http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (deixar em branco)

## API Endpoints

### Lojas
- `GET /api/lojas` - Listar todas as lojas
- `POST /api/lojas` - Criar nova loja
- `GET /api/lojas/{id}` - Obter loja por ID
- `PUT /api/lojas/{id}` - Atualizar loja
- `DELETE /api/lojas/{id}` - Excluir loja

### Categorias
- `GET /api/categorias` - Listar todas as categorias
- `GET /api/categorias/loja/{lojaId}` - Categorias por loja
- `POST /api/categorias` - Criar nova categoria
- `PUT /api/categorias/{id}` - Atualizar categoria
- `DELETE /api/categorias/{id}` - Excluir categoria

### Notas
- `GET /api/notas` - Listar todas as notas
- `GET /api/notas/categoria/{categoriaId}` - Notas por categoria
- `GET /api/notas/loja/{lojaId}` - Notas por loja
- `POST /api/notas` - Criar nova nota
- `PUT /api/notas/{id}` - Atualizar nota
- `DELETE /api/notas/{id}` - Excluir nota

### Lembretes
- `GET /api/lembretes` - Listar todos os lembretes
- `GET /api/lembretes/nota/{notaId}` - Lembretes por nota
- `GET /api/lembretes/proximos` - Lembretes próximos (24h)
- `POST /api/lembretes` - Criar novo lembrete
- `PUT /api/lembretes/{id}` - Atualizar lembrete
- `DELETE /api/lembretes/{id}` - Excluir lembrete

### Dashboard
- `GET /api/dashboard/resumo` - Resumo geral
- `GET /api/dashboard/estatisticas-notas` - Estatísticas de notas
- `GET /api/dashboard/atividades-recentes` - Atividades recentes

## Design e Interface

- **Cores principais:** Azul (#2563eb) e Vermelho (#dc2626)
- **Design responsivo** para desktop, tablet e mobile
- **Interface intuitiva** com navegação por abas
- **Modais** para criação e edição de dados
- **Notificações toast** para feedback do usuário
- **Ícones Font Awesome** para melhor UX

## Banco de Dados

O sistema utiliza H2 Database em memória para desenvolvimento. As tabelas são criadas automaticamente:

- **loja** - Informações das lojas
- **categoria** - Categorias organizadas por loja
- **nota** - Notas com status e conteúdo
- **lembrete** - Lembretes associados às notas

## Desenvolvimento

### Estrutura do Código
- **Entities:** Classes JPA mapeando as tabelas
- **Repositories:** Interfaces para acesso aos dados
- **Controllers:** Endpoints REST da API
- **Frontend:** SPA (Single Page Application) em JavaScript vanilla

### Próximas Melhorias
- [ ] Autenticação e autorização
- [ ] Notificações push para lembretes
- [ ] Exportação de dados (PDF, Excel)
- [ ] Anexos em notas
- [ ] Histórico de alterações
- [ ] Backup automático

## Suporte

Para dúvidas ou problemas:
1. Verifique se o Java 17+ está instalado
2. Confirme se a porta 8080 está disponível
3. Consulte os logs da aplicação para erros específicos

---

**Desenvolvido com Spring Boot e JavaScript** 🚀