// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/dto/BudgetDto.java
// NEW FILE - Add this to your backend
package org.g3_inge4_isi_en.budgitup.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;
    private double amount;
    private String currency;
    private Long categoryId;
    private Long userId;
}