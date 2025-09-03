package com.notasbko.controller;

import com.notasbko.repository.CategoriaRepository;
import com.notasbko.repository.LembreteRepository;
import com.notasbko.repository.LojaRepository;
import com.notasbko.repository.NotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private LojaRepository lojaRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private NotaRepository notaRepository;
    
    @Autowired
    private LembreteRepository lembreteRepository;
    
    // Obter resumo geral do dashboard
    @GetMapping("/resumo")
    public ResponseEntity<Map<String, Object>> obterResumo() {
        Map<String, Object> resumo = new HashMap<>();
        
        // Contadores principais
        resumo.put("totalLojas", lojaRepository.countTotalLojas());
        resumo.put("totalCategorias", categoriaRepository.countTotalCategorias());
        resumo.put("notasPendentes", notaRepository.countNotasPendentes());
        resumo.put("lembretesAtivos", lembreteRepository.countLembretesAtivos());
        
        // Lembretes próximos (próximas 24 horas)
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusHours(24);
        resumo.put("lembretesProximos", lembreteRepository.countLembretesProximos(agora, limite));
        
        return ResponseEntity.ok(resumo);
    }
    
    // Obter estatísticas detalhadas das notas
    @GetMapping("/estatisticas/notas")
    public ResponseEntity<Map<String, Object>> obterEstatisticasNotas() {
        Map<String, Object> estatisticas = new HashMap<>();
        
        // Contar notas por status
        estatisticas.put("pendentes", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.PENDENTE));
        estatisticas.put("emAndamento", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.EM_ANDAMENTO));
        estatisticas.put("concluidas", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.CONCLUIDO));
        
        // Total de notas
        Long totalNotas = notaRepository.count();
        estatisticas.put("total", totalNotas);
        
        return ResponseEntity.ok(estatisticas);
    }
    
    // Obter estatísticas por loja
    @GetMapping("/estatisticas/loja/{lojaId}")
    public ResponseEntity<Map<String, Object>> obterEstatisticasPorLoja(@PathVariable Long lojaId) {
        Map<String, Object> estatisticas = new HashMap<>();
        
        // Verificar se a loja existe
        if (!lojaRepository.existsById(lojaId)) {
            return ResponseEntity.notFound().build();
        }
        
        // Contar categorias da loja
        estatisticas.put("totalCategorias", categoriaRepository.countCategoriasByLojaId(lojaId));
        
        // Contar notas por status na loja
        estatisticas.put("notasPendentes", 
            notaRepository.findByStatusAndLojaId(com.notasbko.entity.Nota.StatusNota.PENDENTE, lojaId).size());
        estatisticas.put("notasEmAndamento", 
            notaRepository.findByStatusAndLojaId(com.notasbko.entity.Nota.StatusNota.EM_ANDAMENTO, lojaId).size());
        estatisticas.put("notasConcluidas", 
            notaRepository.findByStatusAndLojaId(com.notasbko.entity.Nota.StatusNota.CONCLUIDO, lojaId).size());
        
        // Total de notas da loja
        estatisticas.put("totalNotas", notaRepository.findByLojaId(lojaId).size());
        
        // Lembretes da loja
        estatisticas.put("totalLembretes", lembreteRepository.findByLojaId(lojaId).size());
        
        return ResponseEntity.ok(estatisticas);
    }
    
    // Obter atividades recentes (últimas notas criadas)
    @GetMapping("/atividades-recentes")
    public ResponseEntity<Map<String, Object>> obterAtividadesRecentes() {
        Map<String, Object> atividades = new HashMap<>();
        
        // Últimas 5 notas criadas
        atividades.put("ultimasNotas", notaRepository.findAllByOrderByDataNotaDesc()
            .stream().limit(5).toList());
        
        // Próximos lembretes
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusDays(7); // Próximos 7 dias
        atividades.put("proximosLembretes", lembreteRepository.findLembretesProximos(agora, limite)
            .stream().limit(5).toList());
        
        return ResponseEntity.ok(atividades);
    }
    
    // Obter dados para gráficos
    @GetMapping("/graficos")
    public ResponseEntity<Map<String, Object>> obterDadosGraficos() {
        Map<String, Object> graficos = new HashMap<>();
        
        // Distribuição de notas por status
        Map<String, Long> distribuicaoStatus = new HashMap<>();
        distribuicaoStatus.put("PENDENTE", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.PENDENTE));
        distribuicaoStatus.put("EM_ANDAMENTO", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.EM_ANDAMENTO));
        distribuicaoStatus.put("CONCLUIDO", notaRepository.countByStatus(com.notasbko.entity.Nota.StatusNota.CONCLUIDO));
        graficos.put("distribuicaoStatus", distribuicaoStatus);
        
        // Notas por loja (top 5)
        Map<String, Long> notasPorLoja = new HashMap<>();
        lojaRepository.findAll().forEach(loja -> {
            Long count = (long) notaRepository.findByLojaId(loja.getId()).size();
            notasPorLoja.put(loja.getNome(), count);
        });
        graficos.put("notasPorLoja", notasPorLoja);
        
        return ResponseEntity.ok(graficos);
    }
}