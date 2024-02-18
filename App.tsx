import { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';

import MealsOfDate from './components/MealsOfDate/MealsOfDate';
import Home from './screens/Home';
import { init } from './utils/database';

export default function App() {
	const initilizingDatatbase = async () => {
		await init();

		await SplashScreen.hideAsync();
	};

	useEffect(() => {
		initilizingDatatbase();
	}, []);

	const Stack = createStackNavigator();

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="Home" component={Home} />
				<Stack.Screen name="MealsOfDate" component={MealsOfDate} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
