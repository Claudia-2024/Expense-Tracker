package org.g3_inge4_isi_en.budgitup.config;

import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        // Only create defaults if none exist
        if (categoryRepository.findByIsDefaultTrue().isEmpty()) {
            List<Category> defaults = Arrays.asList(
                    Category.builder().name("Food").color("#FFB3AB").icon("fast-food-outline").isDefault(true).build(),
                    Category.builder().name("Transport").color("#88C8FC").icon("car-outline").isDefault(true).build(),
                    Category.builder().name("Airtime").color("#F7D07A").icon("phone-portrait-outline").isDefault(true).build(),
                    Category.builder().name("Social Events").color("#D291BC").icon("people-outline").isDefault(true).build(),
                    Category.builder().name("Shopping").color("#E6A8D7").icon("cart-outline").isDefault(true).build(),
                    Category.builder().name("Rent").color("#A0CED9").icon("home-outline").isDefault(true).build(),
                    Category.builder().name("Bills").color("#9F8AC2").icon("document-text-outline").isDefault(true).build(),
                    Category.builder().name("Emergency").color("#FF9E9E").icon("alert-circle-outline").isDefault(true).build(),
                    Category.builder().name("Medical expenses").color("#81C784").icon("medkit-outline").isDefault(true).build()
            );

            categoryRepository.saveAll(defaults);
            System.out.println("✅ Default categories created successfully!");
        } else {
            System.out.println("✅ Default categories already exist.");
        }
    }
}