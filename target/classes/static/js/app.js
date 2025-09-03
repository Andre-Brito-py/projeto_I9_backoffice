// Configuração da API
const API_BASE_URL = 'http://localhost:8080/api';

// Estado global da aplicação
const AppState = {
    currentSection: 'dashboard',
    stores: [],
    categories: [],
    notes: [],
    reminders: [],
    currentStore: null,
    currentCategory: null,
    currentNote: null
};

// Utilitários
const Utils = {
    // Formatação de data
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Formatação de data e hora
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    },

    // Formatação de status
    formatStatus(status) {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'EM_ANDAMENTO': 'Em Andamento',
            'CONCLUIDO': 'Concluído'
        };
        return statusMap[status] || status;
    },

    // Debounce para pesquisa
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validação de formulário
    validateForm(formData, requiredFields) {
        const errors = [];
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`O campo ${field} é obrigatório`);
            }
        });
        return errors;
    }
};

// Gerenciador de Toast
const Toast = {
    show(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
};

// Gerenciador de Loading
const Loading = {
    show() {
        document.getElementById('loadingSpinner').classList.add('active');
    },
    
    hide() {
        document.getElementById('loadingSpinner').classList.remove('active');
    }
};

// Gerenciador de Modal
const Modal = {
    show(modalId) {
        document.getElementById(modalId).classList.add('active');
    },
    
    hide(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },
    
    hideAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }
};

// API Service
const API = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Stores
    async getStores() {
        return this.request('/lojas');
    },

    async getStore(id) {
        return this.request(`/lojas/${id}`);
    },

    async createStore(store) {
        return this.request('/lojas', {
            method: 'POST',
            body: JSON.stringify(store)
        });
    },

    async updateStore(id, store) {
        return this.request(`/lojas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(store)
        });
    },

    async deleteStore(id) {
        return this.request(`/lojas/${id}`, {
            method: 'DELETE'
        });
    },

    // Categories
    async getCategories() {
        return this.request('/categorias');
    },

    async getCategoriesByStore(storeId) {
        return this.request(`/categorias/loja/${storeId}`);
    },

    async createCategory(category) {
        return this.request('/categorias', {
            method: 'POST',
            body: JSON.stringify(category)
        });
    },

    async updateCategory(id, category) {
        return this.request(`/categorias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category)
        });
    },

    async deleteCategory(id) {
        return this.request(`/categorias/${id}`, {
            method: 'DELETE'
        });
    },

    // Notes
    async getNotes() {
        return this.request('/notas');
    },

    async getNotesByCategory(categoryId) {
        return this.request(`/notas/categoria/${categoryId}`);
    },

    async getNotesByStore(storeId) {
        return this.request(`/notas/loja/${storeId}`);
    },

    async searchNotes(query) {
        return this.request(`/notas/buscar?texto=${encodeURIComponent(query)}`);
    },

    async getNotesByStatus(status) {
        return this.request(`/notas/status/${status}`);
    },

    async createNote(note) {
        return this.request('/notas', {
            method: 'POST',
            body: JSON.stringify(note)
        });
    },

    async updateNote(id, note) {
        return this.request(`/notas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(note)
        });
    },

    async deleteNote(id) {
        return this.request(`/notas/${id}`, {
            method: 'DELETE'
        });
    },

    // Reminders
    async getReminders() {
        return this.request('/lembretes');
    },

    async getRemindersByNote(noteId) {
        return this.request(`/lembretes/nota/${noteId}`);
    },

    async getUpcomingReminders() {
        return this.request('/lembretes/proximos');
    },

    async createReminder(reminder) {
        return this.request('/lembretes', {
            method: 'POST',
            body: JSON.stringify(reminder)
        });
    },

    async updateReminder(id, reminder) {
        return this.request(`/lembretes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reminder)
        });
    },

    async deleteReminder(id) {
        return this.request(`/lembretes/${id}`, {
            method: 'DELETE'
        });
    },

    // Dashboard
    async getDashboardSummary() {
        return this.request('/dashboard/resumo');
    },

    async getNotesStatistics() {
        return this.request('/dashboard/estatisticas/notas');
    },

    async getRecentActivities() {
        return this.request('/dashboard/atividades-recentes');
    }
};

// Navegação
const Navigation = {
    init() {
        // Event listeners para navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
        
        // Show dashboard by default
        this.showSection('dashboard');
    },

    showSection(sectionName) {
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção selecionada
        let targetSection;
        if (sectionName === 'stores') {
            targetSection = document.getElementById('stores-section');
        } else if (sectionName === 'notes') {
            targetSection = document.getElementById('notes-section');
        } else if (sectionName === 'reminders') {
            targetSection = document.getElementById('reminders-section');
        } else {
            targetSection = document.getElementById(`${sectionName}-section`);
        }
        
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Atualizar navegação ativa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Atualizar estado
        AppState.currentSection = sectionName;

        // Carregar dados da seção
        this.loadSectionData(sectionName);
    },

    async loadSectionData(sectionName) {
        Loading.show();
        try {
            switch (sectionName) {
                case 'dashboard':
                    await Dashboard.load();
                    break;
                case 'stores':
                    await StoreManager.load();
                    break;
                case 'notes':
                    if (typeof NoteManager !== 'undefined') {
                        await NoteManager.load();
                        NoteManager.setupFilters();
                    }
                    break;
                case 'reminders':
                    if (typeof ReminderManager !== 'undefined') {
                        await ReminderManager.load();
                        ReminderManager.setupFilters();
                    }
                    break;
            }
        } catch (error) {
            console.error('Error loading section data:', error);
            Toast.show('Erro ao carregar dados', 'error');
        } finally {
            Loading.hide();
        }
    }
};

// Dashboard
const Dashboard = {
    async load() {
        try {
            const [summary, statistics, activities] = await Promise.all([
                API.getDashboardSummary(),
                API.getNotesStatistics(),
                API.getRecentActivities()
            ]);

            this.renderSummary(summary);
            this.renderStatistics(statistics);
            this.renderRecentActivities(activities);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Toast.show('Erro ao carregar dashboard', 'error');
        }
    },

    renderSummary(summary) {
        document.getElementById('totalLojas').textContent = summary.totalLojas || 0;
        document.getElementById('totalCategorias').textContent = summary.totalCategorias || 0;
        document.getElementById('notasPendentes').textContent = summary.notasPendentes || 0;
        document.getElementById('lembretesProximos').textContent = summary.lembretesAtivos || 0;
    },

    renderStatistics(statistics) {
        const container = document.getElementById('notes-statistics');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Pendentes</span>
                    <span class="stat-value">${statistics.pendentes || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Em Andamento</span>
                    <span class="stat-value">${statistics.emAndamento || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Concluídas</span>
                    <span class="stat-value">${statistics.concluidas || 0}</span>
                </div>
            </div>
        `;
    },

    renderRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        const notasRecentes = activities.notasRecentes || [];
        const lembretesProximos = activities.lembretesProximos || [];

        container.innerHTML = `
            <div class="activity-section">
                <h4><i class="fas fa-sticky-note"></i> Notas Recentes</h4>
                <div class="activity-list">
                    ${notasRecentes.map(nota => `
                        <div class="activity-item">
                            <span class="activity-title">${nota.titulo}</span>
                            <span class="activity-date">${Utils.formatDate(nota.dataCriacao)}</span>
                        </div>
                    `).join('')}
                    ${notasRecentes.length === 0 ? '<p class="text-muted">Nenhuma nota recente</p>' : ''}
                </div>
            </div>
            <div class="activity-section">
                <h4><i class="fas fa-bell"></i> Lembretes Próximos</h4>
                <div class="activity-list">
                    ${lembretesProximos.map(lembrete => `
                        <div class="activity-item">
                            <span class="activity-title">${lembrete.titulo}</span>
                            <span class="activity-date">${Utils.formatDateTime(lembrete.dataHoraLembrete)}</span>
                        </div>
                    `).join('')}
                    ${lembretesProximos.length === 0 ? '<p class="text-muted">Nenhum lembrete próximo</p>' : ''}
                </div>
            </div>
        `;
    }
};

// Gerenciador de Lojas
const StoreManager = {
    async load() {
        try {
            AppState.stores = await API.getStores();
            this.render();
        } catch (error) {
            console.error('Error loading stores:', error);
            Toast.show('Erro ao carregar lojas', 'error');
        }
    },

    render() {
        const container = document.getElementById('stores-list');
        if (!container) return;

        if (AppState.stores.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhuma loja cadastrada</p>';
            return;
        }

        container.innerHTML = AppState.stores.map(store => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${store.nome}</h3>
                        <p class="card-subtitle">${store.endereco || ''}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-outline" onclick="StoreManager.edit(${store.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary" onclick="StoreManager.delete(${store.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p>${store.descricao || 'Sem descrição'}</p>
                </div>
                <div class="card-footer">
                    <span class="text-small text-muted">
                        <i class="fas fa-phone"></i> ${store.telefone || 'Não informado'}
                    </span>
                    <span class="text-small text-muted">
                        Criada em ${Utils.formatDate(store.dataCriacao)}
                    </span>
                </div>
            </div>
        `).join('');
    },

    showCreateModal() {
        document.getElementById('store-form').reset();
        document.getElementById('store-modal-title').textContent = 'Nova Loja';
        document.getElementById('store-id').value = '';
        Modal.show('store-modal');
    },

    async edit(id) {
        try {
            const store = await API.getStore(id);
            document.getElementById('store-nome').value = store.nome;
            document.getElementById('store-descricao').value = store.descricao || '';
            document.getElementById('store-endereco').value = store.endereco || '';
            document.getElementById('store-telefone').value = store.telefone || '';
            document.getElementById('store-id').value = store.id;
            document.getElementById('store-modal-title').textContent = 'Editar Loja';
            Modal.show('store-modal');
        } catch (error) {
            console.error('Error loading store:', error);
            Toast.show('Erro ao carregar loja', 'error');
        }
    },

    async save() {
        const formData = {
            nome: document.getElementById('store-nome').value,
            descricao: document.getElementById('store-descricao').value,
            endereco: document.getElementById('store-endereco').value,
            telefone: document.getElementById('store-telefone').value
        };

        const errors = Utils.validateForm(formData, ['nome']);
        if (errors.length > 0) {
            Toast.show(errors.join(', '), 'error');
            return;
        }

        try {
            Loading.show();
            const storeId = document.getElementById('store-id').value;
            
            if (storeId) {
                await API.updateStore(storeId, formData);
                Toast.show('Loja atualizada com sucesso!');
            } else {
                await API.createStore(formData);
                Toast.show('Loja criada com sucesso!');
            }

            Modal.hide('store-modal');
            await this.load();
        } catch (error) {
            console.error('Error saving store:', error);
            Toast.show('Erro ao salvar loja', 'error');
        } finally {
            Loading.hide();
        }
    },

    async delete(id) {
        if (!confirm('Tem certeza que deseja excluir esta loja?')) {
            return;
        }

        try {
            Loading.show();
            await API.deleteStore(id);
            Toast.show('Loja excluída com sucesso!');
            await this.load();
        } catch (error) {
            console.error('Error deleting store:', error);
            Toast.show('Erro ao excluir loja', 'error');
        } finally {
            Loading.hide();
        }
    }
};

// Inicialização da aplicação
const App = {
    async init() {
        try {
            // Inicializar navegação
            Navigation.init();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Carregar dashboard inicial
            await Navigation.loadSectionData('dashboard');
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            Toast.show('Erro ao inicializar aplicação', 'error');
        }
    },

    setupEventListeners() {
        // Botão Novo Item
        const btnNovoItem = document.getElementById('btnNovoItem');
        if (btnNovoItem) {
            btnNovoItem.addEventListener('click', () => {
                this.handleNovoItem();
            });
        }

        // Modal close buttons
        document.querySelectorAll('[data-close-modal]').forEach(button => {
            button.addEventListener('click', () => {
                Modal.hideAll();
            });
        });

        // Modal overlay clicks
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    Modal.hideAll();
                }
            });
        });

        // Store form
        const storeForm = document.getElementById('store-form');
        if (storeForm) {
            storeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                StoreManager.save();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Filter functionality
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
            });
        }
    },

    handleNovoItem() {
        // Determinar qual seção está ativa e abrir o modal correspondente
        const currentSection = AppState.currentSection;
        
        switch(currentSection) {
            case 'lojas':
                // Limpar formulário e abrir modal de nova loja
                document.getElementById('store-nome').value = '';
                document.getElementById('store-descricao').value = '';
                document.getElementById('store-endereco').value = '';
                document.getElementById('store-telefone').value = '';
                document.getElementById('store-id').value = '';
                document.getElementById('store-modal-title').textContent = 'Nova Loja';
                Modal.show('store-modal');
                break;
            case 'notas':
                // Implementar modal de nova nota
                Toast.show('Funcionalidade de nova nota em desenvolvimento', 'info');
                break;
            case 'lembretes':
                // Implementar modal de novo lembrete
                Toast.show('Funcionalidade de novo lembrete em desenvolvimento', 'info');
                break;
            default:
                Toast.show('Selecione uma seção para adicionar um novo item', 'info');
        }
    },

    async handleSearch(query) {
        if (AppState.currentSection === 'notes' && query.trim()) {
            try {
                Loading.show();
                const results = await API.searchNotes(query);
                // Implementar renderização dos resultados
                console.log('Search results:', results);
            } catch (error) {
                console.error('Search error:', error);
                Toast.show('Erro na pesquisa', 'error');
            } finally {
                Loading.hide();
            }
        }
    },

    async handleFilter(status) {
        if (AppState.currentSection === 'notes' && status) {
            try {
                Loading.show();
                const results = await API.getNotesByStatus(status);
                // Implementar renderização dos resultados filtrados
                console.log('Filter results:', results);
            } catch (error) {
                console.error('Filter error:', error);
                Toast.show('Erro no filtro', 'error');
            } finally {
                Loading.hide();
            }
        }
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expor funções globais necessárias
window.StoreManager = StoreManager;
window.Modal = Modal;
window.Toast = Toast;
window.Navigation = Navigation;
window.Dashboard = Dashboard;
window.API = API;
window.Utils = Utils;
window.AppState = AppState;