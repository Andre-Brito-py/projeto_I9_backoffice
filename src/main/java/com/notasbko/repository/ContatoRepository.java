package com.notasbko.repository;

import com.notasbko.entity.Contato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContatoRepository extends JpaRepository<Contato, Long> {
    
    List<Contato> findByLojaId(Long lojaId);
    
    List<Contato> findByLojaIdOrderByNomeAsc(Long lojaId);
    
    List<Contato> findByCargo(Contato.Cargo cargo);
    
    List<Contato> findByLojaIdAndCargo(Long lojaId, Contato.Cargo cargo);
    
    @Query("SELECT c FROM Contato c WHERE c.loja.id = :lojaId AND (c.nome LIKE %:nome% OR c.email LIKE %:nome%)")
    List<Contato> findByLojaIdAndNomeOrEmailContaining(@Param("lojaId") Long lojaId, @Param("nome") String nome);
    
    boolean existsByEmailAndLojaId(String email, Long lojaId);
    
    boolean existsByEmailAndLojaIdAndIdNot(String email, Long lojaId, Long id);
    
    boolean existsByMatricula(String matricula);
    
    boolean existsByMatriculaAndIdNot(String matricula, Long id);
}