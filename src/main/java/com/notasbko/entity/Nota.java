package com.notasbko.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notas")
public class Nota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Título da nota é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(name = "data_nota", nullable = false)
    private LocalDateTime dataNota;
    
    @Column(columnDefinition = "TEXT")
    private String anotacoes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusNota status;
    
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
    
    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lembrete> lembretes = new ArrayList<>();
    
    // Enum para Status
    public enum StatusNota {
        PENDENTE("Pendente"),
        EM_ANDAMENTO("Em Andamento"),
        CONCLUIDO("Concluído");
        
        private final String descricao;
        
        StatusNota(String descricao) {
            this.descricao = descricao;
        }
        
        public String getDescricao() {
            return descricao;
        }
    }
    
    // Constructors
    public Nota() {
        this.dataCriacao = LocalDateTime.now();
        this.dataNota = LocalDateTime.now();
        this.status = StatusNota.PENDENTE;
    }
    
    public Nota(String titulo, String anotacoes, Categoria categoria) {
        this();
        this.titulo = titulo;
        this.anotacoes = anotacoes;
        this.categoria = categoria;
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
    
    public LocalDateTime getDataNota() {
        return dataNota;
    }
    
    public void setDataNota(LocalDateTime dataNota) {
        this.dataNota = dataNota;
    }
    
    public String getAnotacoes() {
        return anotacoes;
    }
    
    public void setAnotacoes(String anotacoes) {
        this.anotacoes = anotacoes;
    }
    
    public StatusNota getStatus() {
        return status;
    }
    
    public void setStatus(StatusNota status) {
        this.status = status;
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
    
    public Categoria getCategoria() {
        return categoria;
    }
    
    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
    
    public List<Lembrete> getLembretes() {
        return lembretes;
    }
    
    public void setLembretes(List<Lembrete> lembretes) {
        this.lembretes = lembretes;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}