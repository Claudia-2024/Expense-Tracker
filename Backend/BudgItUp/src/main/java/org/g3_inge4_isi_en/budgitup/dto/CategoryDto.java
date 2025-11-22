package org.g3_inge4_isi_en.budgitup.dto;

import lombok.Data;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String color;
    private String icon; // Add icon field
    private boolean isDefault;

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String geticon() {
        return icon;
    }

    public void seticon(String icon) {
        this.icon = icon;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public void setIsDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}