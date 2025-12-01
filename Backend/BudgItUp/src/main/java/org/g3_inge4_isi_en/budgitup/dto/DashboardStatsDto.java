package org.g3_inge4_isi_en.budgitup.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Double totalIncome;
    private Double totalExpenses;
    private Double remainingBudget;
    private Double allocatedIncome;
}