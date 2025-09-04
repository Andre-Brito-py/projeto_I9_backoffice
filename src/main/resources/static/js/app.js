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

// Contact Manager
const ContactManager = {
    async loadStoreContacts(storeId) {
        try {
            const contacts = await API.getContactsByStore(storeId);
            this.renderStoreContacts(contacts);
        } catch (error) {
            console.error('Erro ao carregar contatos da loja:', error);
            this.renderStoreContacts([]);
        }
    },

    renderStoreContacts(contacts) {
        const contactsListEl = document.getElementById('contatosLojaList');
        if (!contactsListEl) return;
        
        if (contacts.length === 0) {
            contactsListEl.innerHTML = '<p class="text-muted">Nenhum funcionário cadastrado para esta loja</p>';
            return;
        }
        
        contactsListEl.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <div class="contact-header">
                    <div class="contact-info">
                        <span class="contact-name">${Utils.escapeHtml(contact.nome)}</span>
                        <span class="contact-matricula" style="font-size: 0.85em; color: #666; margin-left: 8px;">Mat: ${contact.matricula}</span>
                        <span class="contact-cargo cargo-${contact.cargo.toLowerCase()}">${this.formatCargo(contact.cargo)}</span>
                    </div>
                    <div class="contact-actions">
                        <button class="btn-icon" onclick="ContactManager.editContact(${contact.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="ContactManager.deleteContact(${contact.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="contact-details">
                    ${contact.telefone ? `<span class="contact-phone"><i class="fas fa-phone"></i> ${contact.telefone}</span>` : ''}
                    ${contact.email ? `<span class="contact-email"><i class="fas fa-envelope"></i> ${contact.email}</span>` : ''}
                </div>
                ${contact.observacoes ? `<div class="contact-notes">${Utils.escapeHtml(contact.observacoes)}</div>` : ''}
            </div>
        `).join('');
    },

    formatCargo(cargo) {
        const cargos = {
            'GERENTE': 'Gerente',
            'PROPRIETARIO': 'Proprietário',
            'VENDEDOR': 'Vendedor'
        };
        return cargos[cargo] || cargo;
    },

    showAddContactModal(storeId) {
        document.getElementById('contact-form').reset();
        document.getElementById('contact-loja-id').value = storeId;
        document.getElementById('contact-modal-title').textContent = 'Novo Funcionário';
        document.getElementById('contact-id').value = '';
        Modal.show('contact-modal');
    },

    validateMatricula(matricula) {
        const pattern = /^T\d{7}$/;
        return pattern.test(matricula);
    },

    async saveContact() {
        const matricula = document.getElementById('contact-matricula').value;
        const matriculaError = document.getElementById('matricula-error');
        
        // Validar matrícula
        if (!this.validateMatricula(matricula)) {
            matriculaError.style.display = 'block';
            return;
        } else {
            matriculaError.style.display = 'none';
        }
        
        const contactData = {
            nome: document.getElementById('contact-nome').value,
            matricula: matricula,
            cargo: document.getElementById('contact-cargo').value,
            telefone: document.getElementById('contact-telefone').value,
            email: document.getElementById('contact-email').value,
            observacoes: document.getElementById('contact-observacoes').value,
            loja: {
                id: document.getElementById('contact-loja-id').value
            }
        };
        
        const contactId = document.getElementById('contact-id').value;
        
        try {
            Loading.show();
            
            if (contactId) {
                contactData.id = contactId;
                await API.updateContact(contactData);
                Toast.show('Funcionário atualizado com sucesso!');
            } else {
                await API.createContact(contactData);
                Toast.show('Funcionário adicionado com sucesso!');
            }
            
            Modal.hide('contact-modal');
            
            // Recarregar contatos da loja atual
            if (AppState.currentStore) {
                await this.loadStoreContacts(AppState.currentStore.id);
            }
            
        } catch (error) {
            console.error('Error saving contact:', error);
            Toast.show('Erro ao salvar funcionário', 'error');
        } finally {
            Loading.hide();
        }
    },

    async editContact(contactId) {
        try {
            const contact = await API.getContact(contactId);
            document.getElementById('contact-nome').value = contact.nome;
            document.getElementById('contact-matricula').value = contact.matricula || '';
            document.getElementById('contact-cargo').value = contact.cargo;
            document.getElementById('contact-telefone').value = contact.telefone || '';
            document.getElementById('contact-email').value = contact.email || '';
            document.getElementById('contact-observacoes').value = contact.observacoes || '';
            document.getElementById('contact-loja-id').value = contact.lojaId;
            document.getElementById('contact-id').value = contact.id;
            document.getElementById('contact-modal-title').textContent = 'Editar Funcionário';
            Modal.show('contact-modal');
        } catch (error) {
            console.error('Error loading contact:', error);
            Toast.show('Erro ao carregar dados do funcionário', 'error');
        }
    },

    async deleteContact(contactId) {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
            return;
        }
        
        try {
            Loading.show();
            await API.deleteContact(contactId);
            Toast.show('Funcionário excluído com sucesso!');
            
            // Recarregar contatos da loja atual
            if (AppState.currentStore) {
                await this.loadStoreContacts(AppState.currentStore.id);
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            Toast.show('Erro ao excluir funcionário', 'error');
        } finally {
            Loading.hide();
        }
    }
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

    // Contacts
    async getContacts() {
        return this.request('/contatos');
    },

    async getContactsByStore(storeId) {
        return this.request(`/contatos/loja/${storeId}`);
    },

    async getContact(id) {
        return this.request(`/contatos/${id}`);
    },

    async createContact(contact) {
        return this.request('/contatos', {
            method: 'POST',
            body: JSON.stringify(contact)
        });
    },

    async updateContact(contact) {
        return this.request(`/contatos/${contact.id}`, {
            method: 'PUT',
            body: JSON.stringify(contact)
        });
    },

    async deleteContact(id) {
        return this.request(`/contatos/${id}`, {
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

        // Mapear nomes de seção para IDs corretos
        let sectionId;
        switch(sectionName) {
            case 'dashboard':
                sectionId = 'dashboard';
                break;
            case 'stores':
            case 'lojas':
                sectionId = 'lojas';
                break;
            case 'notes':
            case 'notas':
                sectionId = 'notas';
                break;
            case 'reminders':
            case 'lembretes':
                sectionId = 'lembretes';
                break;
            default:
                sectionId = sectionName;
        }
        
        const targetSection = document.getElementById(sectionId);
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
                case 'lojas':
                    await StoreManager.load();
                    break;
                case 'notes':
                case 'notas':
                    if (typeof NoteManager !== 'undefined') {
                        await NoteManager.load();
                        NoteManager.setupFilters();
                    } else {
                        console.log('NoteManager não está disponível');
                    }
                    break;
                case 'reminders':
                case 'lembretes':
                    if (typeof ReminderManager !== 'undefined') {
                        await ReminderManager.load();
                        ReminderManager.setupFilters();
                    } else {
                        console.log('ReminderManager não está disponível');
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
        const container = document.getElementById('atividadesRecentes');
        if (!container) return;

        const notasRecentes = activities.ultimasNotas || [];
        const lembretesProximos = activities.proximosLembretes || [];

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
        this.renderStores(AppState.stores);
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
    },

    selectStore(storeId) {
        // Remove seleção anterior
        document.querySelectorAll('.store-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Adiciona seleção atual
        const selectedCard = document.querySelector(`[data-store-id="${storeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        const store = AppState.stores.find(s => s.id === storeId);
        if (store) {
            AppState.currentStore = store;
            this.showStoreDetails(store);
            this.loadStoreNotes(storeId);
            ContactManager.loadStoreContacts(storeId);
            
            // Mostrar botões de ação
            const btnAddNota = document.getElementById('btnAddNotaLoja');
            const btnAddContato = document.getElementById('btnAddContatoLoja');
            if (btnAddNota) btnAddNota.style.display = 'inline-block';
            if (btnAddContato) btnAddContato.style.display = 'inline-block';
        }
    },

    showStoreDetails(store) {
        const detailsContainer = document.getElementById('store-details');
        if (!detailsContainer) return;
        
        detailsContainer.innerHTML = `
            <div class="store-details-header">
                <h3>${Utils.escapeHtml(store.nome)}</h3>
                <button class="btn btn-primary" onclick="StoreManager.showAddNoteModal(${store.id})">
                    <i class="fas fa-plus"></i> Adicionar Nota
                </button>
            </div>
            <div class="store-info">
                <div class="store-info-item">
                    <strong><i class="fas fa-map-marker-alt"></i> Endereço:</strong>
                    <span>${Utils.escapeHtml(store.endereco)}</span>
                </div>
                ${store.telefone ? `
                    <div class="store-info-item">
                        <strong><i class="fas fa-phone"></i> Telefone:</strong>
                        <span>${Utils.escapeHtml(store.telefone)}</span>
                    </div>
                ` : ''}
                ${store.descricao ? `
                    <div class="store-info-item">
                        <strong><i class="fas fa-info-circle"></i> Descrição:</strong>
                        <span>${Utils.escapeHtml(store.descricao)}</span>
                    </div>
                ` : ''}
            </div>
            <div id="store-notes-container">
                <h4>Notas da Loja</h4>
                <div id="store-notes-list"></div>
            </div>
        `;
        
        detailsContainer.style.display = 'block';
    },

    async loadStoreNotes(storeId) {
        try {
            const notes = await API.getNotesByStore(storeId);
            this.renderStoreNotes(notes);
        } catch (error) {
            console.error('Erro ao carregar notas da loja:', error);
            this.renderStoreNotes([]);
        }
    },

    renderStoreNotes(notes) {
        const notesListEl = document.getElementById('notasLojaList');
        if (!notesListEl) return;
        
        if (notes.length === 0) {
            notesListEl.innerHTML = '<p class="text-muted">Nenhuma nota encontrada para esta loja</p>';
            return;
        }
        
        notesListEl.innerHTML = notes.map(note => `
            <div class="store-note-item">
                <div class="note-header">
                    <span class="note-title">${Utils.escapeHtml(note.titulo)}</span>
                    <span class="note-date">${Utils.formatDateTime(note.dataCriacao)}</span>
                    <div class="note-actions">
                        <button class="btn-icon" onclick="StoreManager.editStoreNote(${note.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="StoreManager.deleteStoreNote(${note.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${Utils.escapeHtml(note.conteudo)}</div>
                <div class="note-status">
                    <span class="status-badge status-${note.status.toLowerCase()}">
                        ${Utils.formatStatus(note.status)}
                    </span>
                </div>
            </div>
        `).join('');
    },

    showAddNoteModal(storeId) {
        document.getElementById('note-form').reset();
        document.getElementById('note-loja-id').value = storeId;
        document.getElementById('note-modal-title').textContent = 'Nova Nota para Loja';
        document.getElementById('note-id').value = '';
        Modal.show('note-modal');
    },

    async saveStoreNote() {
        const form = document.getElementById('note-form');
        const formData = new FormData(form);
        
        const lojaId = document.getElementById('note-loja-id').value;
        
        try {
            Loading.show();
            
            // Buscar categorias da loja para pegar a categoria padrão
            const categorias = await API.getCategoriesByStore(lojaId);
            if (categorias.length === 0) {
                Toast.show('Nenhuma categoria encontrada para esta loja', 'error');
                return;
            }
            
            const noteData = {
                titulo: document.getElementById('note-titulo').value,
                anotacoes: document.getElementById('note-conteudo').value,
                status: document.getElementById('note-status').value,
                categoriaId: categorias[0].id // Usar a primeira categoria (padrão)
            };
            
            const noteId = document.getElementById('note-id').value;
            
            if (noteId) {
                noteData.id = noteId;
                await API.updateNote(noteId, noteData);
                Toast.show('Nota atualizada com sucesso!');
            } else {
                await API.createNote(noteData);
                Toast.show('Nota criada com sucesso!');
            }
            
            Modal.hide('note-modal');
            
            // Recarregar notas da loja atual
            if (AppState.currentStore) {
                await this.loadStoreNotes(AppState.currentStore.id);
            }
            
        } catch (error) {
            console.error('Error saving note:', error);
            Toast.show('Erro ao salvar nota', 'error');
        } finally {
            Loading.hide();
        }
    },

    async editStoreNote(noteId) {
        try {
            const note = await API.getNote(noteId);
            document.getElementById('note-titulo').value = note.titulo;
            document.getElementById('note-conteudo').value = note.conteudo;
            document.getElementById('note-status').value = note.status;
            document.getElementById('note-loja-id').value = note.lojaId;
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-modal-title').textContent = 'Editar Nota';
            Modal.show('note-modal');
        } catch (error) {
            console.error('Error loading note:', error);
            Toast.show('Erro ao carregar nota', 'error');
        }
    },

    async deleteStoreNote(noteId) {
        if (!confirm('Tem certeza que deseja excluir esta nota?')) {
            return;
        }

        try {
            Loading.show();
            await API.deleteNote(noteId);
            Toast.show('Nota excluída com sucesso!');
            
            // Recarregar notas da loja atual
            if (AppState.currentStore) {
                await this.loadStoreNotes(AppState.currentStore.id);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            Toast.show('Erro ao excluir nota', 'error');
        } finally {
            Loading.hide();
        }
    },

    search(query) {
        if (!AppState.stores) {
            return;
        }

        const filteredStores = query.trim() === '' 
            ? AppState.stores 
            : AppState.stores.filter(store => 
                store.nome.toLowerCase().includes(query.toLowerCase()) ||
                store.endereco.toLowerCase().includes(query.toLowerCase()) ||
                (store.descricao && store.descricao.toLowerCase().includes(query.toLowerCase()))
            );

        this.renderStores(filteredStores);
    },

    renderStores(stores) {
        const container = document.getElementById('lojasGrid');
        if (!container) return;

        if (!stores || stores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store"></i>
                    <h3>Nenhuma loja encontrada</h3>
                    <p>Não há lojas cadastradas ou que correspondam à sua busca.</p>
                    <button class="btn btn-primary" onclick="StoreManager.showCreateModal()">
                        <i class="fas fa-plus"></i> Nova Loja
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = stores.map(store => `
            <div class="loja-card" onclick="StoreManager.selectStore(${store.id})" data-store-id="${store.id}">
                <div class="store-card-header">
                    <h4 class="store-name">${Utils.escapeHtml(store.nome)}</h4>
                    <div class="store-actions">
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); StoreManager.edit(${store.id})" title="Editar">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); StoreManager.delete(${store.id})" title="Excluir">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
                <div class="store-card-content">
                    <div class="store-info">
                        <p><i class="fas fa-map-marker-alt"></i> ${Utils.escapeHtml(store.endereco)}</p>
                        <p><i class="fas fa-phone"></i> ${store.telefone || 'Não informado'}</p>
                        <p><i class="fas fa-envelope"></i> ${store.email || 'Não informado'}</p>
                    </div>
                    ${store.descricao ? `
                        <div class="store-description">
                            <p>${Utils.escapeHtml(store.descricao)}</p>
                        </div>
                    ` : ''}
                    <div class="store-details">
                        <small class="text-muted">
                            <i class="fas fa-calendar"></i>
                            Criada em ${Utils.formatDate(store.dataCriacao)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
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
            
            // Configurar navegação do sidebar
            this.setupSidebarNavigation();
            
            // Carregar dashboard inicial
            await Navigation.loadSectionData('dashboard');
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            Toast.show('Erro ao inicializar aplicação', 'error');
        }
    },

    setupSidebarNavigation() {
        // Configurar navegação do sidebar
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active de todos os links
                document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
                // Adiciona active ao link clicado
                this.classList.add('active');
                
                const section = this.getAttribute('data-section');
                if (section) {
                    Navigation.showSection(section);
                }
            });
        });
        
        // Configurar navegação do header (se existir)
        document.querySelectorAll('.header .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    Navigation.showSection(section);
                }
            });
        });
    },

    setupEventListeners() {
        // Botão Novo Item
        const btnNovoItem = document.getElementById('btnNovoItem');
        if (btnNovoItem) {
            btnNovoItem.addEventListener('click', () => {
                this.handleNovoItem();
            });
        }

        // Botão Nova Loja
        const btnNovaLoja = document.getElementById('btnNovaLoja');
        if (btnNovaLoja) {
            btnNovaLoja.addEventListener('click', () => {
                StoreManager.showCreateModal();
            });
        }

        // Busca de lojas
        const searchLojas = document.getElementById('searchLojas');
        if (searchLojas) {
            searchLojas.addEventListener('input', Utils.debounce((e) => {
                StoreManager.search(e.target.value);
            }, 300));
        }

        // Botão Nova Nota da Loja
        const btnAddNotaLoja = document.getElementById('btnAddNotaLoja');
        if (btnAddNotaLoja) {
            btnAddNotaLoja.addEventListener('click', () => {
                if (AppState.currentStore) {
                    StoreManager.showAddNoteModal(AppState.currentStore.id);
                } else {
                    Toast.show('Selecione uma loja primeiro', 'warning');
                }
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

        // Note form
        const noteForm = document.getElementById('note-form');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                StoreManager.saveStoreNote();
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                ContactManager.saveContact();
            });
        }

        // Add contact button
        const btnAddContato = document.getElementById('btnAddContatoLoja');
        if (btnAddContato) {
            btnAddContato.addEventListener('click', () => {
                if (AppState.currentStore) {
                    ContactManager.showAddContactModal(AppState.currentStore.id);
                } else {
                    Toast.show('Selecione uma loja primeiro', 'warning');
                }
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
                // Abrir modal de nova nota
                if (window.NoteManager) {
                    NoteManager.showCreateModal();
                } else {
                    Toast.show('Gerenciador de notas não carregado', 'error');
                }
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
    
    // Adicionar validação em tempo real para o campo de matrícula
    const matriculaInput = document.getElementById('contact-matricula');
    if (matriculaInput) {
        matriculaInput.addEventListener('input', function() {
            const matricula = this.value.toUpperCase();
            this.value = matricula;
            
            const matriculaError = document.getElementById('matricula-error');
            if (matricula && !StoreManager.validateMatricula(matricula)) {
                matriculaError.style.display = 'block';
            } else {
                matriculaError.style.display = 'none';
            }
        });
    }
});

// Adicionar função de escape HTML aos Utils
Utils.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Expor funções globais necessárias
window.StoreManager = StoreManager;
window.Modal = Modal;
window.Toast = Toast;
window.Navigation = Navigation;
window.Dashboard = Dashboard;
window.API = API;
window.Utils = Utils;
window.AppState = AppState;
window.NoteManager = window.NoteManager || null;