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
                    Category.builder().name("Food").color("#FF6B6B").isDefault(true).build(),
                    Category.builder().name("Transport").color("#4ECDC4").isDefault(true).build(),
                    Category.builder().name("Entertainment").color("#45B7D1").isDefault(true).build(),
                    Category.builder().name("Rent").color("#96CEB4").isDefault(true).build(),
                    Category.builder().name("Utilities").color("#FFEAA7").isDefault(true).build(),
                    Category.builder().name("Healthcare").color("#DFE6E9").isDefault(true).build(),
                    Category.builder().name("Shopping").color("#A29BFE").isDefault(true).build(),
                    Category.builder().name("Taxi").color("#FD79A8").isDefault(true).build(),
                    Category.builder().name("Mobile Data").color("#FDCB6E").isDefault(true).build(),
                    Category.builder().name("Girlfriend").color("#FF7675").isDefault(true).build()
            );

            categoryRepository.saveAll(defaults);
            System.out.println("✅ Default categories created successfully!");
        } else {
            System.out.println("✅ Default categories already exist.");
        }
    }
}
