import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';

//Screens
import MapScreen from './Screens/MapScreen';
import UserScreen from './Screens/UserScreen';


const App = () => {
  const Stack = createStackNavigator()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MapScreen" 
        component={MapScreen}
        options={{ headerShown: false }}  
        />
        <Stack.Screen name="UserScreen"
        component={UserScreen}
        options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
      <FlashMessage
        position="top"
      />
    </NavigationContainer>
  );
};

export default App;