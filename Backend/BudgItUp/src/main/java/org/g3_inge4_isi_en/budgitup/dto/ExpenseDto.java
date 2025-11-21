    package org.g3_inge4_isi_en.budgitup.dto;

    import lombok.Data;
    import java.time.LocalDate;

    @Data
    public class ExpenseDto {
        private Long id;
        private double amount;
        private String currency;
        private String note;
        private LocalDate date;
        private Long categoryId;
        private Long userId;
    }
