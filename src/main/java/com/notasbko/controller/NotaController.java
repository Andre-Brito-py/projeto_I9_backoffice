package com.notasbko.controller;

import com.notasbko.entity.Categoria;
import com.notasbko.entity.Nota;
import com.notasbko.entity.Nota.StatusNota;
import com.notasbko.repository.CategoriaRepository;
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
@RequestMapping("/api/notas")
@CrossOrigin(origins = "*")
public class NotaController {
    
    @Autowired
    private NotaRepository notaRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    // Listar todas as notas
    @GetMapping
    public ResponseEntity<List<Nota>> listarNotas() {
        List<Nota> notas = notaRepository.findAllByOrderByDataNotaDesc();
        return ResponseEntity.ok(notas);
    }
    
    // Listar notas por categoria
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Nota>> listarNotasPorCategoria(@PathVariable Long categoriaId) {
        List<Nota> notas = notaRepository.findByCategoriaIdOrderByDataNotaDesc(categoriaId);
        return ResponseEntity.ok(notas);
    }
    
    // Listar notas por loja
    @GetMapping("/loja/{lojaId}")
    public ResponseEntity<List<Nota>> listarNotasPorLoja(@PathVariable Long lojaId) {
        List<Nota> notas = notaRepository.findByLojaId(lojaId);
        return ResponseEntity.ok(notas);
    }
    
    // Buscar nota por ID
    @GetMapping("/{id}")
    public ResponseEntity<Nota> buscarNotaPorId(@PathVariable Long id) {
        Optional<Nota> nota = notaRepository.findById(id);
        return nota.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // Buscar nota por ID com lembretes
    @GetMapping("/{id}/lembretes")
    public ResponseEntity<Nota> buscarNotaComLembretes(@PathVariable Long id) {
        Optional<Nota> nota = notaRepository.findByIdWithLembretes(id);
        return nota.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // Criar nova nota
    @PostMapping
    public ResponseEntity<Nota> criarNota(@Valid @RequestBody NotaRequest request) {
        Optional<Categoria> categoria = categoriaRepository.findById(request.getCategoriaId());
        
        if (categoria.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Nota nota = new Nota();
            nota.setTitulo(request.getTitulo());
            nota.setAnotacoes(request.getAnotacoes());
            nota.setCategoria(categoria.get());
            
            if (request.getDataNota() != null) {
                nota.setDataNota(request.getDataNota());
            }
            
            if (request.getStatus() != null) {
                nota.setStatus(request.getStatus());
            }
            
            Nota novaNota = notaRepository.save(nota);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaNota);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Atualizar nota
    @PutMapping("/{id}")
    public ResponseEntity<Nota> atualizarNota(@PathVariable Long id, @Valid @RequestBody NotaRequest request) {
        Optional<Nota> notaExistente = notaRepository.findById(id);
        
        if (notaExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Nota nota = notaExistente.get();
        nota.setTitulo(request.getTitulo());
        nota.setAnotacoes(request.getAnotacoes());
        
        if (request.getDataNota() != null) {
            nota.setDataNota(request.getDataNota());
        }
        
        if (request.getStatus() != null) {
            nota.setStatus(request.getStatus());
        }
        
        Nota notaSalva = notaRepository.save(nota);
        return ResponseEntity.ok(notaSalva);
    }
    
    // Excluir nota
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirNota(@PathVariable Long id) {
        if (notaRepository.existsById(id)) {
            notaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Buscar notas por texto (título ou anotações)
    @GetMapping("/buscar")
    public ResponseEntity<List<Nota>> buscarNotasPorTexto(@RequestParam String texto) {
        List<Nota> notas = notaRepository.findByTituloOrAnotacoesContaining(texto);
        return ResponseEntity.ok(notas);
    }
    
    // Filtrar notas por status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Nota>> filtrarNotasPorStatus(@PathVariable StatusNota status) {
        List<Nota> notas = notaRepository.findByStatus(status);
        return ResponseEntity.ok(notas);
    }
    
    // Filtrar notas por status e loja
    @GetMapping("/status/{status}/loja/{lojaId}")
    public ResponseEntity<List<Nota>> filtrarNotasPorStatusELoja(@PathVariable StatusNota status, @PathVariable Long lojaId) {
        List<Nota> notas = notaRepository.findByStatusAndLojaId(status, lojaId);
        return ResponseEntity.ok(notas);
    }
    
    // Contar notas pendentes
    @GetMapping("/count/pendentes")
    public ResponseEntity<Long> contarNotasPendentes() {
        Long total = notaRepository.countNotasPendentes();
        return ResponseEntity.ok(total);
    }
    
    // Contar notas por status
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> contarNotasPorStatus(@PathVariable StatusNota status) {
        Long total = notaRepository.countByStatus(status);
        return ResponseEntity.ok(total);
    }
    
    // Classe interna para request de nota
    public static class NotaRequest {
        private String titulo;
        private String anotacoes;
        private LocalDateTime dataNota;
        private StatusNota status;
        private Long categoriaId;
        
        // Getters and Setters
        public String getTitulo() {
            return titulo;
        }
        
        public void setTitulo(String titulo) {
            this.titulo = titulo;
        }
        
        public String getAnotacoes() {
            return anotacoes;
        }
        
        public void setAnotacoes(String anotacoes) {
            this.anotacoes = anotacoes;
        }
        
        public LocalDateTime getDataNota() {
            return dataNota;
        }
        
        public void setDataNota(LocalDateTime dataNota) {
            this.dataNota = dataNota;
        }
        
        public StatusNota getStatus() {
            return status;
        }
        
        public void setStatus(StatusNota status) {
            this.status = status;
        }
        
        public Long getCategoriaId() {
            return categoriaId;
        }
        
        public void setCategoriaId(Long categoriaId) {
            this.categoriaId = categoriaId;
        }
    }
}