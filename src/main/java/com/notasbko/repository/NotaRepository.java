package com.notasbko.repository;

import com.notasbko.entity.Nota;
import com.notasbko.entity.Nota.StatusNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {
    
    // Buscar notas por categoria
    List<Nota> findByCategoriaId(Long categoriaId);
    
    // Buscar notas por status
    List<Nota> findByStatus(StatusNota status);
    
    // Buscar notas por loja (através da categoria)
    @Query("SELECT n FROM Nota n WHERE n.categoria.loja.id = :lojaId")
    List<Nota> findByLojaId(@Param("lojaId") Long lojaId);
    
    // Buscar notas por título (case insensitive)
    List<Nota> findByTituloContainingIgnoreCase(String titulo);
    
    // Buscar notas por conteúdo das anotações
    List<Nota> findByAnotacoesContainingIgnoreCase(String conteudo);
    
    // Buscar notas por título ou anotações
    @Query("SELECT n FROM Nota n WHERE LOWER(n.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) OR LOWER(n.anotacoes) LIKE LOWER(CONCAT('%', :texto, '%'))")
    List<Nota> findByTituloOrAnotacoesContaining(@Param("texto") String texto);
    
    // Buscar notas por status e loja
    @Query("SELECT n FROM Nota n WHERE n.status = :status AND n.categoria.loja.id = :lojaId")
    List<Nota> findByStatusAndLojaId(@Param("status") StatusNota status, @Param("lojaId") Long lojaId);
    
    // Buscar notas ordenadas por data (mais recentes primeiro)
    List<Nota> findAllByOrderByDataNotaDesc();
    
    // Buscar notas por categoria ordenadas por data
    List<Nota> findByCategoriaIdOrderByDataNotaDesc(Long categoriaId);
    
    // Buscar notas por período
    @Query("SELECT n FROM Nota n WHERE n.dataNota BETWEEN :dataInicio AND :dataFim")
    List<Nota> findByDataNotaBetween(@Param("dataInicio") LocalDateTime dataInicio, @Param("dataFim") LocalDateTime dataFim);
    
    // Contar notas por status
    @Query("SELECT COUNT(n) FROM Nota n WHERE n.status = :status")
    Long countByStatus(@Param("status") StatusNota status);
    
    // Contar total de notas pendentes
    @Query("SELECT COUNT(n) FROM Nota n WHERE n.status = 'PENDENTE'")
    Long countNotasPendentes();
    
    // Buscar nota por ID com lembretes
    @Query("SELECT n FROM Nota n LEFT JOIN FETCH n.lembretes WHERE n.id = :id")
    Optional<Nota> findByIdWithLembretes(@Param("id") Long id);
    
    // Buscar notas com lembretes ativos
    @Query("SELECT DISTINCT n FROM Nota n JOIN n.lembretes l WHERE l.ativo = true AND l.notificado = false")
    List<Nota> findNotasComLembretesAtivos();
}