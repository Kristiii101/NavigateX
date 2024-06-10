import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import { User, onAuthStateChanged } from 'firebase/auth';

// Screens
import MapScreen from './Screens/MapScreen';
import UserScreen from './Screens/UserScreen';
import LogInScreen from './Screens/LogInScreen';
import RegisterScreen from './Screens/RegisterScreen';  // Import RegisterScreen
import { Firebase_Auth } from './utils/FireBaseConfig';

const Stack = createStackNavigator();
const InsideStack = createStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ headerShown: false }} 
      />
      <InsideStack.Screen 
        name="UserScreen" 
        component={UserScreen} 
        options={{ headerShown: false }} 
      />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(Firebase_Auth, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogInScreen">
        {user ? (
          <Stack.Screen 
            name="Inside" 
            component={InsideLayout} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <Stack.Screen 
              name="LogInScreen" 
              component={LogInScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="RegisterScreen"  // Add RegisterScreen to the navigation
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
          </>
        )}
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}
