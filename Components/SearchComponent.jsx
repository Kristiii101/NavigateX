import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

const SearchComponent = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a location"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40, // Adjust based on your header's height
    left: 20,
    right: 20,
    zIndex: 1,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 1 },
    elevation: 3, // for Android shadow
  },
});

export default SearchComponent;
