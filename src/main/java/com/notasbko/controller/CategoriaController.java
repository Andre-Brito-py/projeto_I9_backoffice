package com.notasbko.controller;

import com.notasbko.entity.Categoria;
import com.notasbko.entity.Loja;
import com.notasbko.repository.CategoriaRepository;
import com.notasbko.repository.LojaRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private LojaRepository lojaRepository;
    
    // Listar todas as categorias
    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias() {
        List<Categoria> categorias = categoriaRepository.findAll();
        return ResponseEntity.ok(categorias);
    }
    
    // Listar categorias por loja
    @GetMapping("/loja/{lojaId}")
    public ResponseEntity<List<Categoria>> listarCategoriasPorLoja(@PathVariable Long lojaId) {
        List<Categoria> categorias = categoriaRepository.findByLojaId(lojaId);
        return ResponseEntity.ok(categorias);
    }
    
    // Buscar categoria por ID
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarCategoriaPorId(@PathVariable Long id) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        return categoria.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    // Buscar categoria por ID com notas
    @GetMapping("/{id}/notas")
    public ResponseEntity<Categoria> buscarCategoriaComNotas(@PathVariable Long id) {
        Optional<Categoria> categoria = categoriaRepository.findByIdWithNotas(id);
        return categoria.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    // Criar nova categoria
    @PostMapping
    public ResponseEntity<Categoria> criarCategoria(@Valid @RequestBody CategoriaRequest request) {
        Optional<Loja> loja = lojaRepository.findById(request.getLojaId());
        
        if (loja.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Verificar se já existe categoria com mesmo nome na loja
        Optional<Categoria> categoriaExistente = categoriaRepository
            .findByNomeIgnoreCaseAndLojaId(request.getNome(), request.getLojaId());
        
        if (categoriaExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        try {
            Categoria categoria = new Categoria();
            categoria.setNome(request.getNome());
            categoria.setDescricao(request.getDescricao());
            categoria.setLoja(loja.get());
            
            Categoria novaCategoria = categoriaRepository.save(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaCategoria);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Atualizar categoria
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizarCategoria(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);
        
        if (categoriaExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Categoria categoria = categoriaExistente.get();
        categoria.setNome(request.getNome());
        categoria.setDescricao(request.getDescricao());
        
        Categoria categoriaSalva = categoriaRepository.save(categoria);
        return ResponseEntity.ok(categoriaSalva);
    }
    
    // Excluir categoria
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCategoria(@PathVariable Long id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Buscar categorias por nome
    @GetMapping("/buscar")
    public ResponseEntity<List<Categoria>> buscarCategoriasPorNome(@RequestParam String nome) {
        List<Categoria> categorias = categoriaRepository.findByNomeContainingIgnoreCase(nome);
        return ResponseEntity.ok(categorias);
    }
    
    // Contar total de categorias
    @GetMapping("/count")
    public ResponseEntity<Long> contarCategorias() {
        Long total = categoriaRepository.countTotalCategorias();
        return ResponseEntity.ok(total);
    }
    
    // Classe interna para request de categoria
    public static class CategoriaRequest {
        private String nome;
        private String descricao;
        private Long lojaId;
        
        // Getters and Setters
        public String getNome() {
            return nome;
        }
        
        public void setNome(String nome) {
            this.nome = nome;
        }
        
        public String getDescricao() {
            return descricao;
        }
        
        public void setDescricao(String descricao) {
            this.descricao = descricao;
        }
        
        public Long getLojaId() {
            return lojaId;
        }
        
        public void setLojaId(Long lojaId) {
            this.lojaId = lojaId;
        }
    }
}