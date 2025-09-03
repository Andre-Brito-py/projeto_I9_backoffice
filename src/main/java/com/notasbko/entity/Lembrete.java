package com.notasbko.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "lembretes")
public class Lembrete {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    @Column(length = 200)
    private String titulo;
    
    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    @Column(length = 500)
    private String descricao;
    
    @NotNull(message = "Data/hora do lembrete é obrigatória")
    @Column(name = "data_hora_lembrete", nullable = false)
    private LocalDateTime dataHoraLembrete;
    
    @Column(name = "ativo", nullable = false)
    private Boolean ativo;
    
    @Column(name = "notificado", nullable = false)
    private Boolean notificado;
    
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_id", nullable = false)
    private Nota nota;
    
    // Constructors
    public Lembrete() {
        this.dataCriacao = LocalDateTime.now();
        this.ativo = true;
        this.notificado = false;
    }
    
    public Lembrete(String titulo, String descricao, LocalDateTime dataHoraLembrete, Nota nota) {
        this();
        this.titulo = titulo;
        this.descricao = descricao;
        this.dataHoraLembrete = dataHoraLembrete;
        this.nota = nota;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitulo() {
        return titulo;
    }
    
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public LocalDateTime getDataHoraLembrete() {
        return dataHoraLembrete;
    }
    
    public void setDataHoraLembrete(LocalDateTime dataHoraLembrete) {
        this.dataHoraLembrete = dataHoraLembrete;
    }
    
    public Boolean getAtivo() {
        return ativo;
    }
    
    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public Boolean getNotificado() {
        return notificado;
    }
    
    public void setNotificado(Boolean notificado) {
        this.notificado = notificado;
    }
    
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    
    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    public Nota getNota() {
        return nota;
    }
    
    public void setNota(Nota nota) {
        this.nota = nota;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    // Método utilitário para verificar se o lembrete está próximo
    public boolean isProximo() {
        if (!ativo || notificado) {
            return false;
        }
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusHours(24); // Próximas 24 horas
        return dataHoraLembrete.isAfter(agora) && dataHoraLembrete.isBefore(limite);
    }
}