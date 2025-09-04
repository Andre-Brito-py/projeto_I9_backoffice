package com.notasbko.controller;

import com.notasbko.entity.Contato;
import com.notasbko.entity.Loja;
import com.notasbko.repository.ContatoRepository;
import com.notasbko.repository.LojaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contatos")
@CrossOrigin(origins = "*")
public class ContatoController {
    
    @Autowired
    private ContatoRepository contatoRepository;
    
    @Autowired
    private LojaRepository lojaRepository;
    
    @GetMapping
    public ResponseEntity<List<Contato>> getAllContatos() {
        try {
            List<Contato> contatos = contatoRepository.findAll();
            return ResponseEntity.ok(contatos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/loja/{lojaId}")
    public ResponseEntity<List<Contato>> getContatosByLoja(@PathVariable Long lojaId) {
        try {
            List<Contato> contatos = contatoRepository.findByLojaIdOrderByNomeAsc(lojaId);
            return ResponseEntity.ok(contatos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Contato> getContatoById(@PathVariable Long id) {
        try {
            Optional<Contato> contato = contatoRepository.findById(id);
            return contato.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Contato> createContato(@RequestBody Contato contato) {
        try {
            // Validar se a loja existe
            if (contato.getLoja() == null || contato.getLoja().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Optional<Loja> loja = lojaRepository.findById(contato.getLoja().getId());
            if (loja.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validar matrícula
            if (contato.getMatricula() == null || !contato.getMatricula().matches("^T\\d{7}$")) {
                return ResponseEntity.badRequest().build();
            }
            
            // Verificar se já existe um contato com a mesma matrícula
            boolean matriculaExists = contatoRepository.existsByMatricula(contato.getMatricula());
            if (matriculaExists) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            // Verificar se já existe um contato com o mesmo email na loja
            if (contato.getEmail() != null && !contato.getEmail().trim().isEmpty()) {
                boolean emailExists = contatoRepository.existsByEmailAndLojaId(
                    contato.getEmail(), contato.getLoja().getId());
                if (emailExists) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).build();
                }
            }
            
            contato.setLoja(loja.get());
            Contato savedContato = contatoRepository.save(contato);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedContato);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Contato> updateContato(@PathVariable Long id, @RequestBody Contato contatoDetails) {
        try {
            Optional<Contato> optionalContato = contatoRepository.findById(id);
            if (optionalContato.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Contato contato = optionalContato.get();
            
            // Validar matrícula
            if (contatoDetails.getMatricula() == null || !contatoDetails.getMatricula().matches("^T\\d{7}$")) {
                return ResponseEntity.badRequest().build();
            }
            
            // Verificar se já existe um contato com a mesma matrícula (exceto o atual)
            boolean matriculaExists = contatoRepository.existsByMatriculaAndIdNot(contatoDetails.getMatricula(), id);
            if (matriculaExists) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            // Verificar se o email já existe para outro contato na mesma loja
            if (contatoDetails.getEmail() != null && !contatoDetails.getEmail().trim().isEmpty()) {
                boolean emailExists = contatoRepository.existsByEmailAndLojaIdAndIdNot(
                    contatoDetails.getEmail(), contato.getLoja().getId(), id);
                if (emailExists) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).build();
                }
            }
            
            // Atualizar campos
            contato.setNome(contatoDetails.getNome());
            contato.setMatricula(contatoDetails.getMatricula());
            contato.setCargo(contatoDetails.getCargo());
            contato.setTelefone(contatoDetails.getTelefone());
            contato.setEmail(contatoDetails.getEmail());
            contato.setObservacoes(contatoDetails.getObservacoes());
            
            Contato updatedContato = contatoRepository.save(contato);
            return ResponseEntity.ok(updatedContato);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContato(@PathVariable Long id) {
        try {
            if (!contatoRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            contatoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/cargo/{cargo}")
    public ResponseEntity<List<Contato>> getContatosByCargo(@PathVariable String cargo) {
        try {
            Contato.Cargo cargoEnum = Contato.Cargo.valueOf(cargo.toUpperCase());
            List<Contato> contatos = contatoRepository.findByCargo(cargoEnum);
            return ResponseEntity.ok(contatos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/loja/{lojaId}/cargo/{cargo}")
    public ResponseEntity<List<Contato>> getContatosByLojaAndCargo(
            @PathVariable Long lojaId, @PathVariable String cargo) {
        try {
            Contato.Cargo cargoEnum = Contato.Cargo.valueOf(cargo.toUpperCase());
            List<Contato> contatos = contatoRepository.findByLojaIdAndCargo(lojaId, cargoEnum);
            return ResponseEntity.ok(contatos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}