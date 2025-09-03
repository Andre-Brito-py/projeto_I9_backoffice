package com.notasbko.repository;

import com.notasbko.entity.Lembrete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LembreteRepository extends JpaRepository<Lembrete, Long> {
    
    // Buscar lembretes por nota
    List<Lembrete> findByNotaId(Long notaId);
    
    // Buscar lembretes ativos
    List<Lembrete> findByAtivoTrue();
    
    // Buscar lembretes não notificados
    List<Lembrete> findByNotificadoFalse();
    
    // Buscar lembretes ativos e não notificados
    List<Lembrete> findByAtivoTrueAndNotificadoFalse();
    
    // Buscar lembretes próximos (próximas 24 horas)
    @Query("SELECT l FROM Lembrete l WHERE l.ativo = true AND l.notificado = false AND l.dataHoraLembrete BETWEEN :agora AND :limite")
    List<Lembrete> findLembretesProximos(@Param("agora") LocalDateTime agora, @Param("limite") LocalDateTime limite);
    
    // Buscar lembretes vencidos (não notificados e data já passou)
    @Query("SELECT l FROM Lembrete l WHERE l.ativo = true AND l.notificado = false AND l.dataHoraLembrete < :agora")
    List<Lembrete> findLembretesVencidos(@Param("agora") LocalDateTime agora);
    
    // Buscar lembretes por período
    @Query("SELECT l FROM Lembrete l WHERE l.dataHoraLembrete BETWEEN :dataInicio AND :dataFim")
    List<Lembrete> findByDataHoraLembreteBetween(@Param("dataInicio") LocalDateTime dataInicio, @Param("dataFim") LocalDateTime dataFim);
    
    // Buscar lembretes por loja (através da nota e categoria)
    @Query("SELECT l FROM Lembrete l WHERE l.nota.categoria.loja.id = :lojaId")
    List<Lembrete> findByLojaId(@Param("lojaId") Long lojaId);
    
    // Buscar lembretes ordenados por data/hora
    List<Lembrete> findAllByOrderByDataHoraLembreteAsc();
    
    // Buscar lembretes ativos ordenados por data/hora
    List<Lembrete> findByAtivoTrueOrderByDataHoraLembreteAsc();
    
    // Contar lembretes ativos
    @Query("SELECT COUNT(l) FROM Lembrete l WHERE l.ativo = true")
    Long countLembretesAtivos();
    
    // Contar lembretes próximos
    @Query("SELECT COUNT(l) FROM Lembrete l WHERE l.ativo = true AND l.notificado = false AND l.dataHoraLembrete BETWEEN :agora AND :limite")
    Long countLembretesProximos(@Param("agora") LocalDateTime agora, @Param("limite") LocalDateTime limite);
}