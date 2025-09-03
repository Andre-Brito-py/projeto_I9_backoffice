package com.notasbko.controller;

import com.notasbko.entity.Loja;
import com.notasbko.repository.LojaRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lojas")
@CrossOrigin(origins = "*")
public class LojaController {
    
    @Autowired
    private LojaRepository lojaRepository;
    
    // Listar todas as lojas
    @GetMapping
    public ResponseEntity<List<Loja>> listarLojas() {
        List<Loja> lojas = lojaRepository.findAll();
        return ResponseEntity.ok(lojas);
    }
    
    // Buscar loja por ID
    @GetMapping("/{id}")
    public ResponseEntity<Loja> buscarLojaPorId(@PathVariable Long id) {
        Optional<Loja> loja = lojaRepository.findById(id);
        return loja.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // Buscar loja por ID com categorias
    @GetMapping("/{id}/categorias")
    public ResponseEntity<Loja> buscarLojaComCategorias(@PathVariable Long id) {
        Optional<Loja> loja = lojaRepository.findByIdWithCategorias(id);
        return loja.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // Criar nova loja
    @PostMapping
    public ResponseEntity<Loja> criarLoja(@Valid @RequestBody Loja loja) {
        try {
            Loja novaLoja = lojaRepository.save(loja);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaLoja);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Atualizar loja
    @PutMapping("/{id}")
    public ResponseEntity<Loja> atualizarLoja(@PathVariable Long id, @Valid @RequestBody Loja lojaAtualizada) {
        Optional<Loja> lojaExistente = lojaRepository.findById(id);
        
        if (lojaExistente.isPresent()) {
            Loja loja = lojaExistente.get();
            loja.setNome(lojaAtualizada.getNome());
            loja.setDescricao(lojaAtualizada.getDescricao());
            loja.setEndereco(lojaAtualizada.getEndereco());
            loja.setTelefone(lojaAtualizada.getTelefone());
            
            Loja lojaSalva = lojaRepository.save(loja);
            return ResponseEntity.ok(lojaSalva);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Excluir loja
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirLoja(@PathVariable Long id) {
        if (lojaRepository.existsById(id)) {
            lojaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Buscar lojas por nome
    @GetMapping("/buscar")
    public ResponseEntity<List<Loja>> buscarLojasPorNome(@RequestParam String nome) {
        List<Loja> lojas = lojaRepository.findByNomeContainingIgnoreCase(nome);
        return ResponseEntity.ok(lojas);
    }
    
    // Contar total de lojas
    @GetMapping("/count")
    public ResponseEntity<Long> contarLojas() {
        Long total = lojaRepository.countTotalLojas();
        return ResponseEntity.ok(total);
    }
}