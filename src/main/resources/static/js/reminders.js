// Gerenciador de Lembretes
const ReminderManager = {
    currentFilters: {
        search: '',
        status: 'all', // all, active, inactive, upcoming, overdue
        note: ''
    },

    async load() {
        try {
            // Carregar dados necessários
            await Promise.all([
                this.loadReminders(),
                this.loadNotes()
            ]);
            
            this.render();
            this.setupFilters();
        } catch (error) {
            console.error('Error loading reminders:', error);
            Toast.show('Erro ao carregar lembretes', 'error');
        }
    },

    async loadReminders() {
        AppState.reminders = await API.getReminders();
    },

    async loadNotes() {
        if (AppState.notes.length === 0) {
            AppState.notes = await API.getNotes();
        }
    },

    render() {
        const container = document.getElementById('reminders-list');
        if (!container) return;

        let filteredReminders = this.applyFilters(AppState.reminders);

        if (filteredReminders.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhum lembrete encontrado</p>';
            return;
        }

        // Ordenar por data/hora do lembrete
        filteredReminders.sort((a, b) => new Date(a.dataHoraLembrete) - new Date(b.dataHoraLembrete));

        container.innerHTML = filteredReminders.map(reminder => this.renderReminderCard(reminder)).join('');
    },

    renderReminderCard(reminder) {
        const note = AppState.notes.find(n => n.id === reminder.notaId);
        const isUpcoming = this.isUpcoming(reminder.dataHoraLembrete);
        const isOverdue = this.isOverdue(reminder.dataHoraLembrete);
        
        let statusClass = '';
        let statusText = '';
        
        if (!reminder.ativo) {
            statusClass = 'status-inativo';
            statusText = 'Inativo';
        } else if (isOverdue) {
            statusClass = 'status-overdue';
            statusText = 'Atrasado';
        } else if (isUpcoming) {
            statusClass = 'status-upcoming';
            statusText = 'Próximo';
        } else {
            statusClass = 'status-ativo';
            statusText = 'Ativo';
        }
        
        return `
            <div class="card reminder-card ${isOverdue ? 'reminder-overdue' : isUpcoming ? 'reminder-upcoming' : ''}" data-reminder-id="${reminder.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${reminder.titulo}</h3>
                        <p class="card-subtitle">
                            Nota: ${note ? note.titulo : 'Nota não encontrada'}
                        </p>
                    </div>
                    <div class="card-actions">
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                        <button class="btn btn-outline" onclick="ReminderManager.edit(${reminder.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="ReminderManager.toggleActive(${reminder.id})" title="${reminder.ativo ? 'Desativar' : 'Ativar'}">
                            <i class="fas fa-${reminder.ativo ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-primary" onclick="ReminderManager.delete(${reminder.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p>${reminder.descricao || 'Sem descrição'}</p>
                    <div class="reminder-datetime">
                        <i class="fas fa-clock"></i>
                        <strong>${Utils.formatDateTime(reminder.dataHoraLembrete)}</strong>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="text-small text-muted">
                        ${reminder.notificado ? 'Notificado' : 'Não notificado'}
                    </span>
                    <span class="text-small text-muted">
                        Criado em ${Utils.formatDate(reminder.dataCriacao)}
                    </span>
                </div>
            </div>
        `;
    },

    setupFilters() {
        // Search input
        const searchInput = document.getElementById('reminders-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.render();
            }, 300));
        }

        // Status filter
        const statusFilter = document.getElementById('reminders-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.render();
            });
        }

        // Note filter
        const noteFilter = document.getElementById('note-filter');
        if (noteFilter) {
            this.populateNoteFilter();
            noteFilter.addEventListener('change', (e) => {
                this.currentFilters.note = e.target.value;
                this.render();
            });
        }
    },

    populateNoteFilter() {
        const select = document.getElementById('note-filter');
        if (!select) return;

        select.innerHTML = `
            <option value="">Todas as notas</option>
            ${AppState.notes.map(note => `
                <option value="${note.id}">${note.titulo}</option>
            `).join('')}
        `;
    },

    applyFilters(reminders) {
        return reminders.filter(reminder => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesTitle = reminder.titulo.toLowerCase().includes(searchTerm);
                const matchesDescription = reminder.descricao && reminder.descricao.toLowerCase().includes(searchTerm);
                if (!matchesTitle && !matchesDescription) {
                    return false;
                }
            }

            // Status filter
            if (this.currentFilters.status !== 'all') {
                switch (this.currentFilters.status) {
                    case 'active':
                        if (!reminder.ativo) return false;
                        break;
                    case 'inactive':
                        if (reminder.ativo) return false;
                        break;
                    case 'upcoming':
                        if (!reminder.ativo || !this.isUpcoming(reminder.dataHoraLembrete)) return false;
                        break;
                    case 'overdue':
                        if (!reminder.ativo || !this.isOverdue(reminder.dataHoraLembrete)) return false;
                        break;
                }
            }

            // Note filter
            if (this.currentFilters.note && reminder.notaId != this.currentFilters.note) {
                return false;
            }

            return true;
        });
    },

    isUpcoming(dateTime) {
        const now = new Date();
        const reminderDate = new Date(dateTime);
        const diffHours = (reminderDate - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24; // Próximo se for nas próximas 24 horas
    },

    isOverdue(dateTime) {
        const now = new Date();
        const reminderDate = new Date(dateTime);
        return reminderDate < now;
    },

    showCreateModal() {
        document.getElementById('reminder-form').reset();
        document.getElementById('reminder-modal-title').textContent = 'Novo Lembrete';
        document.getElementById('reminder-id').value = '';
        this.populateNoteSelect();
        
        // Set default date/time to current + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const defaultDateTime = now.toISOString().slice(0, 16);
        document.getElementById('reminder-data-hora').value = defaultDateTime;
        
        Modal.show('reminder-modal');
    },

    async edit(id) {
        try {
            const reminder = await API.request(`/lembretes/${id}`);
            document.getElementById('reminder-titulo').value = reminder.titulo;
            document.getElementById('reminder-descricao').value = reminder.descricao || '';
            document.getElementById('reminder-data-hora').value = reminder.dataHoraLembrete ? 
                new Date(reminder.dataHoraLembrete).toISOString().slice(0, 16) : '';
            document.getElementById('reminder-ativo').checked = reminder.ativo;
            document.getElementById('reminder-nota').value = reminder.notaId;
            document.getElementById('reminder-id').value = reminder.id;
            
            document.getElementById('reminder-modal-title').textContent = 'Editar Lembrete';
            this.populateNoteSelect();
            Modal.show('reminder-modal');
        } catch (error) {
            console.error('Error loading reminder:', error);
            Toast.show('Erro ao carregar lembrete', 'error');
        }
    },

    async save() {
        const formData = {
            titulo: document.getElementById('reminder-titulo').value,
            descricao: document.getElementById('reminder-descricao').value,
            dataHoraLembrete: document.getElementById('reminder-data-hora').value,
            ativo: document.getElementById('reminder-ativo').checked,
            notaId: parseInt(document.getElementById('reminder-nota').value)
        };

        const errors = Utils.validateForm(formData, ['titulo', 'dataHoraLembrete', 'notaId']);
        if (errors.length > 0) {
            Toast.show(errors.join(', '), 'error');
            return;
        }

        // Validate date is in the future
        const reminderDate = new Date(formData.dataHoraLembrete);
        if (reminderDate <= new Date()) {
            Toast.show('A data/hora do lembrete deve ser no futuro', 'error');
            return;
        }

        try {
            Loading.show();
            const reminderId = document.getElementById('reminder-id').value;
            
            if (reminderId) {
                await API.updateReminder(reminderId, formData);
                Toast.show('Lembrete atualizado com sucesso!');
            } else {
                await API.createReminder(formData);
                Toast.show('Lembrete criado com sucesso!');
            }

            Modal.hide('reminder-modal');
            await this.load();
        } catch (error) {
            console.error('Error saving reminder:', error);
            Toast.show('Erro ao salvar lembrete', 'error');
        } finally {
            Loading.hide();
        }
    },

    async delete(id) {
        if (!confirm('Tem certeza que deseja excluir este lembrete?')) {
            return;
        }

        try {
            Loading.show();
            await API.deleteReminder(id);
            Toast.show('Lembrete excluído com sucesso!');
            await this.load();
        } catch (error) {
            console.error('Error deleting reminder:', error);
            Toast.show('Erro ao excluir lembrete', 'error');
        } finally {
            Loading.hide();
        }
    },

    async toggleActive(id) {
        try {
            const reminder = AppState.reminders.find(r => r.id === id);
            if (!reminder) return;

            const updatedReminder = {
                ...reminder,
                ativo: !reminder.ativo
            };

            Loading.show();
            await API.updateReminder(id, updatedReminder);
            Toast.show(`Lembrete ${updatedReminder.ativo ? 'ativado' : 'desativado'} com sucesso!`);
            await this.load();
        } catch (error) {
            console.error('Error toggling reminder:', error);
            Toast.show('Erro ao alterar status do lembrete', 'error');
        } finally {
            Loading.hide();
        }
    },

    populateNoteSelect() {
        const select = document.getElementById('reminder-nota');
        if (!select) return;

        select.innerHTML = `
            <option value="">Selecione uma nota</option>
            ${AppState.notes.map(note => {
                const category = AppState.categories.find(c => c.id === note.categoriaId);
                const store = category ? AppState.stores.find(s => s.id === category.lojaId) : null;
                const context = store && category ? `${store.nome} > ${category.nome}` : 'Contexto não encontrado';
                return `<option value="${note.id}">${note.titulo} (${context})</option>`;
            }).join('')}
        `;
    },

    async loadUpcoming() {
        try {
            const upcomingReminders = await API.getUpcomingReminders();
            this.renderUpcomingReminders(upcomingReminders);
        } catch (error) {
            console.error('Error loading upcoming reminders:', error);
            Toast.show('Erro ao carregar lembretes próximos', 'error');
        }
    },

    renderUpcomingReminders(reminders) {
        const container = document.getElementById('upcoming-reminders');
        if (!container) return;

        if (reminders.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhum lembrete próximo</p>';
            return;
        }

        container.innerHTML = `
            <div class="upcoming-reminders-list">
                ${reminders.map(reminder => {
                    const note = AppState.notes.find(n => n.id === reminder.notaId);
                    return `
                        <div class="upcoming-reminder-item">
                            <div class="reminder-info">
                                <h4>${reminder.titulo}</h4>
                                <p class="text-small text-muted">${note ? note.titulo : 'Nota não encontrada'}</p>
                            </div>
                            <div class="reminder-time">
                                <span class="text-small">${Utils.formatDateTime(reminder.dataHoraLembrete)}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    clearFilters() {
        this.currentFilters = {
            search: '',
            status: 'all',
            note: ''
        };
        
        // Reset form inputs
        const searchInput = document.getElementById('reminders-search');
        if (searchInput) searchInput.value = '';
        
        const statusFilter = document.getElementById('reminders-status-filter');
        if (statusFilter) statusFilter.value = 'all';
        
        const noteFilter = document.getElementById('note-filter');
        if (noteFilter) noteFilter.value = '';
        
        this.render();
    },

    // Método para criar lembrete diretamente de uma nota
    createForNote(noteId) {
        this.showCreateModal();
        document.getElementById('reminder-nota').value = noteId;
        
        // Preencher título com base na nota
        const note = AppState.notes.find(n => n.id === noteId);
        if (note) {
            document.getElementById('reminder-titulo').value = `Lembrete: ${note.titulo}`;
        }
    }
};

// Expor para uso global
window.ReminderManager = ReminderManager;