package org.g3_inge4_isi_en.budgitup.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String email;
    private String defaultCurrency;
    private boolean hasCompletedOnboarding;
    private String token; // JWT
}
