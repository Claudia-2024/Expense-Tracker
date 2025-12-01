package org.g3_inge4_isi_en.budgitup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class AuthRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String name;
    private String phone;

    private List<Long> defaultCategoryIds;
}