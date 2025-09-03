package com.notasbko.repository;

import com.notasbko.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    // Buscar categorias por loja
    List<Categoria> findByLojaId(Long lojaId);
    
    // Buscar categoria por nome e loja
    Optional<Categoria> findByNomeIgnoreCaseAndLojaId(String nome, Long lojaId);
    
    // Buscar categorias que contenham o texto no nome
    List<Categoria> findByNomeContainingIgnoreCase(String nome);
    
    // Buscar categorias por loja com suas notas
    @Query("SELECT DISTINCT c FROM Categoria c LEFT JOIN FETCH c.notas WHERE c.loja.id = :lojaId")
    List<Categoria> findByLojaIdWithNotas(@Param("lojaId") Long lojaId);
    
    // Contar total de categorias
    @Query("SELECT COUNT(c) FROM Categoria c")
    Long countTotalCategorias();
    
    // Contar categorias por loja
    @Query("SELECT COUNT(c) FROM Categoria c WHERE c.loja.id = :lojaId")
    Long countCategoriasByLojaId(@Param("lojaId") Long lojaId);
    
    // Buscar categoria por ID com notas
    @Query("SELECT c FROM Categoria c LEFT JOIN FETCH c.notas WHERE c.id = :id")
    Optional<Categoria> findByIdWithNotas(@Param("id") Long id);
}