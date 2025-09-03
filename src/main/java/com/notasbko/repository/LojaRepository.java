package com.notasbko.repository;

import com.notasbko.entity.Loja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LojaRepository extends JpaRepository<Loja, Long> {
    
    // Buscar loja por nome (case insensitive)
    Optional<Loja> findByNomeIgnoreCase(String nome);
    
    // Buscar lojas que contenham o texto no nome
    List<Loja> findByNomeContainingIgnoreCase(String nome);
    
    // Buscar lojas por cidade (assumindo que está no endereço)
    List<Loja> findByEnderecoContainingIgnoreCase(String cidade);
    
    // Contar total de lojas
    @Query("SELECT COUNT(l) FROM Loja l")
    Long countTotalLojas();
    
    // Buscar lojas com suas categorias
    @Query("SELECT DISTINCT l FROM Loja l LEFT JOIN FETCH l.categorias")
    List<Loja> findAllWithCategorias();
    
    // Buscar loja por ID com categorias
    @Query("SELECT l FROM Loja l LEFT JOIN FETCH l.categorias WHERE l.id = :id")
    Optional<Loja> findByIdWithCategorias(@Param("id") Long id);
}