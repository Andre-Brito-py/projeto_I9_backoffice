// Gerenciador de Notas
const NoteManager = {
    currentFilters: {
        search: '',
        status: '',
        category: '',
        store: ''
    },

    async load() {
        try {
            // Carregar dados necessários
            await Promise.all([
                this.loadStores(),
                this.loadCategories(),
                this.loadNotes()
            ]);
            
            this.render();
            this.setupFilters();
        } catch (error) {
            console.error('Error loading notes:', error);
            Toast.show('Erro ao carregar notas', 'error');
        }
    },

    async loadStores() {
        AppState.stores = await API.getStores();
        this.renderStoreFilter();
    },

    async loadCategories() {
        AppState.categories = await API.getCategories();
        this.renderCategoryFilter();
    },

    async loadNotes() {
        AppState.notes = await API.getNotes();
    },

    render() {
        const container = document.getElementById('notes-list');
        if (!container) return;

        let filteredNotes = this.applyFilters(AppState.notes);

        if (filteredNotes.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhuma nota encontrada</p>';
            return;
        }

        container.innerHTML = filteredNotes.map(note => this.renderNoteCard(note)).join('');
    },

    renderNoteCard(note) {
        const category = AppState.categories.find(c => c.id === note.categoriaId);
        const store = category ? AppState.stores.find(s => s.id === category.lojaId) : null;
        
        return `
            <div class="card note-card" data-note-id="${note.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${note.titulo}</h3>
                        <p class="card-subtitle">
                            ${store ? store.nome : 'Loja não encontrada'} > 
                            ${category ? category.nome : 'Categoria não encontrada'}
                        </p>
                    </div>
                    <div class="card-actions">
                        <span class="status-badge status-${note.status.toLowerCase().replace('_', '-')}">
                            ${Utils.formatStatus(note.status)}
                        </span>
                        <button class="btn btn-outline" onclick="NoteManager.edit(${note.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="NoteManager.viewReminders(${note.id})" title="Lembretes">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="btn btn-primary" onclick="NoteManager.delete(${note.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p>${note.anotacoes || 'Sem anotações'}</p>
                </div>
                <div class="card-footer">
                    <span class="text-small text-muted">
                        <i class="fas fa-calendar"></i> ${Utils.formatDate(note.dataNota)}
                    </span>
                    <span class="text-small text-muted">
                        Criada em ${Utils.formatDate(note.dataCriacao)}
                    </span>
                </div>
            </div>
        `;
    },

    renderStoreFilter() {
        const select = document.getElementById('store-filter');
        if (!select) return;

        select.innerHTML = `
            <option value="">Todas as lojas</option>
            ${AppState.stores.map(store => `
                <option value="${store.id}">${store.nome}</option>
            `).join('')}
        `;
    },

    renderCategoryFilter() {
        const select = document.getElementById('category-filter');
        if (!select) return;

        select.innerHTML = `
            <option value="">Todas as categorias</option>
            ${AppState.categories.map(category => {
                const store = AppState.stores.find(s => s.id === category.lojaId);
                return `<option value="${category.id}">${category.nome} (${store ? store.nome : 'Loja não encontrada'})</option>`;
            }).join('')}
        `;
    },

    setupFilters() {
        // Search input
        const searchInput = document.getElementById('notes-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.render();
            }, 300));
        }

        // Status filter
        const statusFilter = document.getElementById('notes-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.render();
            });
        }

        // Store filter
        const storeFilter = document.getElementById('store-filter');
        if (storeFilter) {
            storeFilter.addEventListener('change', async (e) => {
                this.currentFilters.store = e.target.value;
                
                // Update categories based on selected store
                if (e.target.value) {
                    const categories = await API.getCategoriesByStore(e.target.value);
                    this.renderCategoryFilterForStore(categories);
                } else {
                    this.renderCategoryFilter();
                }
                
                this.currentFilters.category = ''; // Reset category filter
                this.render();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.render();
            });
        }
    },

    renderCategoryFilterForStore(categories) {
        const select = document.getElementById('category-filter');
        if (!select) return;

        select.innerHTML = `
            <option value="">Todas as categorias</option>
            ${categories.map(category => `
                <option value="${category.id}">${category.nome}</option>
            `).join('')}
        `;
    },

    applyFilters(notes) {
        return notes.filter(note => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesTitle = note.titulo.toLowerCase().includes(searchTerm);
                const matchesContent = note.anotacoes && note.anotacoes.toLowerCase().includes(searchTerm);
                if (!matchesTitle && !matchesContent) {
                    return false;
                }
            }

            // Status filter
            if (this.currentFilters.status && note.status !== this.currentFilters.status) {
                return false;
            }

            // Category filter
            if (this.currentFilters.category && note.categoriaId != this.currentFilters.category) {
                return false;
            }

            // Store filter
            if (this.currentFilters.store) {
                const category = AppState.categories.find(c => c.id === note.categoriaId);
                if (!category || category.lojaId != this.currentFilters.store) {
                    return false;
                }
            }

            return true;
        });
    },

    showCreateModal() {
        document.getElementById('note-form').reset();
        document.getElementById('note-modal-title').textContent = 'Nova Nota';
        document.getElementById('note-id').value = '';
        this.populateStoreSelect();
        Modal.show('note-modal');
    },

    async edit(id) {
        try {
            const note = await API.request(`/notas/${id}`);
            document.getElementById('note-titulo').value = note.titulo;
            document.getElementById('note-data').value = note.dataNota ? note.dataNota.split('T')[0] : '';
            document.getElementById('note-anotacoes').value = note.anotacoes || '';
            document.getElementById('note-status').value = note.status;
            document.getElementById('note-id').value = note.id;
            
            // Load category and store
            const category = AppState.categories.find(c => c.id === note.categoriaId);
            if (category) {
                document.getElementById('note-loja').value = category.lojaId;
                await this.loadCategoriesForStore(category.lojaId);
                document.getElementById('note-categoria').value = note.categoriaId;
            }
            
            document.getElementById('note-modal-title').textContent = 'Editar Nota';
            this.populateStoreSelect();
            Modal.show('note-modal');
        } catch (error) {
            console.error('Error loading note:', error);
            Toast.show('Erro ao carregar nota', 'error');
        }
    },

    async save() {
        const formData = {
            titulo: document.getElementById('note-titulo').value,
            dataNota: document.getElementById('note-data').value,
            anotacoes: document.getElementById('note-anotacoes').value,
            status: document.getElementById('note-status').value,
            categoriaId: parseInt(document.getElementById('note-categoria').value)
        };

        const errors = Utils.validateForm(formData, ['titulo', 'dataNota', 'categoriaId']);
        if (errors.length > 0) {
            Toast.show(errors.join(', '), 'error');
            return;
        }

        try {
            Loading.show();
            const noteId = document.getElementById('note-id').value;
            
            if (noteId) {
                await API.updateNote(noteId, formData);
                Toast.show('Nota atualizada com sucesso!');
            } else {
                await API.createNote(formData);
                Toast.show('Nota criada com sucesso!');
            }

            Modal.hide('note-modal');
            await this.load();
        } catch (error) {
            console.error('Error saving note:', error);
            Toast.show('Erro ao salvar nota', 'error');
        } finally {
            Loading.hide();
        }
    },

    async delete(id) {
        if (!confirm('Tem certeza que deseja excluir esta nota?')) {
            return;
        }

        try {
            Loading.show();
            await API.deleteNote(id);
            Toast.show('Nota excluída com sucesso!');
            await this.load();
        } catch (error) {
            console.error('Error deleting note:', error);
            Toast.show('Erro ao excluir nota', 'error');
        } finally {
            Loading.hide();
        }
    },

    populateStoreSelect() {
        const select = document.getElementById('note-loja');
        if (!select) return;

        select.innerHTML = `
            <option value="">Selecione uma loja</option>
            ${AppState.stores.map(store => `
                <option value="${store.id}">${store.nome}</option>
            `).join('')}
        `;

        // Event listener for store change
        select.addEventListener('change', async (e) => {
            const storeId = e.target.value;
            if (storeId) {
                await this.loadCategoriesForStore(storeId);
            } else {
                document.getElementById('note-categoria').innerHTML = '<option value="">Selecione uma categoria</option>';
            }
        });
    },

    async loadCategoriesForStore(storeId) {
        try {
            const categories = await API.getCategoriesByStore(storeId);
            const select = document.getElementById('note-categoria');
            if (!select) return;

            select.innerHTML = `
                <option value="">Selecione uma categoria</option>
                ${categories.map(category => `
                    <option value="${category.id}">${category.nome}</option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading categories for store:', error);
            Toast.show('Erro ao carregar categorias', 'error');
        }
    },

    async viewReminders(noteId) {
        try {
            AppState.currentNote = noteId;
            const reminders = await API.getRemindersByNote(noteId);
            this.renderRemindersModal(reminders);
            Modal.show('reminders-modal');
        } catch (error) {
            console.error('Error loading reminders:', error);
            Toast.show('Erro ao carregar lembretes', 'error');
        }
    },

    renderRemindersModal(reminders) {
        const container = document.getElementById('reminders-list');
        if (!container) return;

        if (reminders.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhum lembrete cadastrado</p>';
            return;
        }

        container.innerHTML = reminders.map(reminder => `
            <div class="reminder-item">
                <div class="reminder-content">
                    <h4>${reminder.titulo}</h4>
                    <p>${reminder.descricao || 'Sem descrição'}</p>
                    <span class="text-small text-muted">
                        <i class="fas fa-clock"></i> ${Utils.formatDateTime(reminder.dataHoraLembrete)}
                    </span>
                </div>
                <div class="reminder-actions">
                    <span class="status-badge ${reminder.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${reminder.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button class="btn btn-outline" onclick="ReminderManager.edit(${reminder.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary" onclick="ReminderManager.delete(${reminder.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    clearFilters() {
        this.currentFilters = {
            search: '',
            status: '',
            category: '',
            store: ''
        };
        
        // Reset form inputs
        const searchInput = document.getElementById('notes-search');
        if (searchInput) searchInput.value = '';
        
        const statusFilter = document.getElementById('notes-status-filter');
        if (statusFilter) statusFilter.value = '';
        
        const storeFilter = document.getElementById('store-filter');
        if (storeFilter) storeFilter.value = '';
        
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = '';
        
        this.renderCategoryFilter();
        this.render();
    }
};

// Expor para uso global
window.NoteManager = NoteManager;