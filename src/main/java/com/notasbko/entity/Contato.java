package com.notasbko.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contatos")
public class Contato {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nome;
    
    @Column(nullable = false, unique = true, length = 8)
    private String matricula;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Cargo cargo;
    
    private String telefone;
    
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String observacoes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loja_id", nullable = false)
    private Loja loja;
    
    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    public enum Cargo {
        GERENTE, PROPRIETARIO, VENDEDOR
    }
    
    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
    
    // Constructors
    public Contato() {}
    
    public Contato(String nome, String matricula, Cargo cargo, String telefone, String email, String observacoes, Loja loja) {
        this.nome = nome;
        this.matricula = matricula;
        this.cargo = cargo;
        this.telefone = telefone;
        this.email = email;
        this.observacoes = observacoes;
        this.loja = loja;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getMatricula() {
        return matricula;
    }
    
    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }
    
    public Cargo getCargo() {
        return cargo;
    }
    
    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }
    
    public String getTelefone() {
        return telefone;
    }
    
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getObservacoes() {
        return observacoes;
    }
    
    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
    
    public Loja getLoja() {
        return loja;
    }
    
    public void setLoja(Loja loja) {
        this.loja = loja;
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
}