import CategoryCard from '../../components/Cards/categoryCard';
import { CategoryName } from '../../components/Cards/categoryIcons';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';

// Inside CategorySelectionPage
const router = useRouter();

const handleContinue = () => {
  router.replace('/(tabs)'); // Navigate to the page
};


const categories: CategoryName[] = [
  'Food',
  'Transport',
  'Airtime',
  'Social Events',
  'Shopping',
  'Rent',
  'Bills',
  'Emergency',
  'Medical expenses',
];

const CategorySelectionPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryName[]>([]);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const handleSelect = (category: CategoryName, selected: boolean) => {
    setSelectedCategories(prev =>
      selected ? [...prev, category] : prev.filter(c => c !== category)
    );
  };

  const selectAll = () => setSelectedCategories([...categories]);
  const clearAll = () => setSelectedCategories([]);

  const handleContinue = () => {
    // Replace with navigation or next action
    console.log('Selected categories:', selectedCategories);
  };

  // Bounce animation whenever Continue becomes enabled
  useEffect(() => {
    if (selectedCategories.length > 0) {
      Animated.sequence([
        Animated.spring(bounceAnim, { toValue: 1.05, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedCategories.length]);

  const continueBackgroundColor = selectedCategories.length > 0 ? '#4CAF50' : '#A5D6A7';

  return (
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''} selected
          </Text>

          {selectedCategories.length > 0 && (
            <Text style={styles.selectedList}>
              {selectedCategories.join(', ')}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={selectAll}>
              <Text style={styles.buttonText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAll}>
              <Text style={[styles.buttonText, styles.clearButtonText]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Cards Grid */}
        <View style={styles.grid}>
          {categories.map(cat => (
            <CategoryCard
              key={cat}
              category={cat}
              selected={selectedCategories.includes(cat)}
              onPress={selected => handleSelect(cat, selected)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Continue Button with Bounce Animation */}
      <View style={styles.continueContainer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: continueBackgroundColor }]}
            disabled={selectedCategories.length === 0}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default CategorySelectionPage;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  container: {
    padding: 12,
    paddingBottom: 100, // Space for continue button
  },
  summary: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedList: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: '#E0E0E0',
  },
  clearButtonText: {
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  continueContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});