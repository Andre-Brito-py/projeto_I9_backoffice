package com.notasbko.controller;

import com.notasbko.entity.Lembrete;
import com.notasbko.entity.Nota;
import com.notasbko.repository.LembreteRepository;
import com.notasbko.repository.NotaRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lembretes")
@CrossOrigin(origins = "*")
public class LembreteController {
    
    @Autowired
    private LembreteRepository lembreteRepository;
    
    @Autowired
    private NotaRepository notaRepository;
    
    // Listar todos os lembretes
    @GetMapping
    public ResponseEntity<List<Lembrete>> listarLembretes() {
        List<Lembrete> lembretes = lembreteRepository.findAllByOrderByDataHoraLembreteAsc();
        return ResponseEntity.ok(lembretes);
    }
    
    // Listar lembretes por nota
    @GetMapping("/nota/{notaId}")
    public ResponseEntity<List<Lembrete>> listarLembretesPorNota(@PathVariable Long notaId) {
        List<Lembrete> lembretes = lembreteRepository.findByNotaId(notaId);
        return ResponseEntity.ok(lembretes);
    }
    
    // Listar lembretes ativos
    @GetMapping("/ativos")
    public ResponseEntity<List<Lembrete>> listarLembretesAtivos() {
        List<Lembrete> lembretes = lembreteRepository.findByAtivoTrueOrderByDataHoraLembreteAsc();
        return ResponseEntity.ok(lembretes);
    }
    
    // Listar lembretes próximos (próximas 24 horas)
    @GetMapping("/proximos")
    public ResponseEntity<List<Lembrete>> listarLembretesProximos() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusHours(24);
        List<Lembrete> lembretes = lembreteRepository.findLembretesProximos(agora, limite);
        return ResponseEntity.ok(lembretes);
    }
    
    // Listar lembretes vencidos
    @GetMapping("/vencidos")
    public ResponseEntity<List<Lembrete>> listarLembretesVencidos() {
        LocalDateTime agora = LocalDateTime.now();
        List<Lembrete> lembretes = lembreteRepository.findLembretesVencidos(agora);
        return ResponseEntity.ok(lembretes);
    }
    
    // Buscar lembrete por ID
    @GetMapping("/{id}")
    public ResponseEntity<Lembrete> buscarLembretePorId(@PathVariable Long id) {
        Optional<Lembrete> lembrete = lembreteRepository.findById(id);
        return lembrete.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // Criar novo lembrete
    @PostMapping
    public ResponseEntity<Lembrete> criarLembrete(@Valid @RequestBody LembreteRequest request) {
        Optional<Nota> nota = notaRepository.findById(request.getNotaId());
        
        if (nota.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Lembrete lembrete = new Lembrete();
            lembrete.setTitulo(request.getTitulo());
            lembrete.setDescricao(request.getDescricao());
            lembrete.setDataHoraLembrete(request.getDataHoraLembrete());
            lembrete.setNota(nota.get());
            
            if (request.getAtivo() != null) {
                lembrete.setAtivo(request.getAtivo());
            }
            
            Lembrete novoLembrete = lembreteRepository.save(lembrete);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoLembrete);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Atualizar lembrete
    @PutMapping("/{id}")
    public ResponseEntity<Lembrete> atualizarLembrete(@PathVariable Long id, @Valid @RequestBody LembreteRequest request) {
        Optional<Lembrete> lembreteExistente = lembreteRepository.findById(id);
        
        if (lembreteExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Lembrete lembrete = lembreteExistente.get();
        lembrete.setTitulo(request.getTitulo());
        lembrete.setDescricao(request.getDescricao());
        lembrete.setDataHoraLembrete(request.getDataHoraLembrete());
        
        if (request.getAtivo() != null) {
            lembrete.setAtivo(request.getAtivo());
        }
        
        Lembrete lembreteSalvo = lembreteRepository.save(lembrete);
        return ResponseEntity.ok(lembreteSalvo);
    }
    
    // Marcar lembrete como notificado
    @PatchMapping("/{id}/notificar")
    public ResponseEntity<Lembrete> marcarComoNotificado(@PathVariable Long id) {
        Optional<Lembrete> lembreteExistente = lembreteRepository.findById(id);
        
        if (lembreteExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Lembrete lembrete = lembreteExistente.get();
        lembrete.setNotificado(true);
        
        Lembrete lembreteSalvo = lembreteRepository.save(lembrete);
        return ResponseEntity.ok(lembreteSalvo);
    }
    
    // Ativar/desativar lembrete
    @PatchMapping("/{id}/ativo")
    public ResponseEntity<Lembrete> alterarStatusAtivo(@PathVariable Long id, @RequestParam Boolean ativo) {
        Optional<Lembrete> lembreteExistente = lembreteRepository.findById(id);
        
        if (lembreteExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Lembrete lembrete = lembreteExistente.get();
        lembrete.setAtivo(ativo);
        
        Lembrete lembreteSalvo = lembreteRepository.save(lembrete);
        return ResponseEntity.ok(lembreteSalvo);
    }
    
    // Excluir lembrete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirLembrete(@PathVariable Long id) {
        if (lembreteRepository.existsById(id)) {
            lembreteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Contar lembretes ativos
    @GetMapping("/count/ativos")
    public ResponseEntity<Long> contarLembretesAtivos() {
        Long total = lembreteRepository.countLembretesAtivos();
        return ResponseEntity.ok(total);
    }
    
    // Contar lembretes próximos
    @GetMapping("/count/proximos")
    public ResponseEntity<Long> contarLembretesProximos() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusHours(24);
        Long total = lembreteRepository.countLembretesProximos(agora, limite);
        return ResponseEntity.ok(total);
    }
    
    // Classe interna para request de lembrete
    public static class LembreteRequest {
        private String titulo;
        private String descricao;
        private LocalDateTime dataHoraLembrete;
        private Boolean ativo;
        private Long notaId;
        
        // Getters and Setters
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
        
        public Long getNotaId() {
            return notaId;
        }
        
        public void setNotaId(Long notaId) {
            this.notaId = notaId;
        }
    }
}