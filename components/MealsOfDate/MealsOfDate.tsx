import { type RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { type Meal } from '../../types/meal';
import { RouteParams } from '../../types/routes';
import { fetchCalendarByDate } from '../../utils/database';
import CircularProgress from 'react-native-circular-progress-indicator';

function MealsOfDate() {
	const route = useRoute<RouteProp<{ params: RouteParams }>>();

	const [meals, setMeals] = useState<Meal[]>();

	const { mealsDate } = route.params;

	useEffect(() => {
		const getData = async () => {
			try {
				const calendarMealsDB = await fetchCalendarByDate(new Date(mealsDate));

				setMeals(calendarMealsDB);
			} catch {
				Alert.alert('Cant find event');
			}
		};
		getData();
	}, []);

	return meals ? (
		<View style={styles.container}>
			<Text style={styles.title}>{`${meals.filter((item) => Boolean(item.isChecked) === true).length} of ${meals.length} meals`}</Text>
			<CircularProgress
				radius={120}
				value={100 / (meals.length / meals.filter((item) => Boolean(item.isChecked) === true).length)}
				inActiveStrokeColor="#FF9733"
				activeStrokeColor="#fea022"
				inActiveStrokeOpacity={0.2}
				progressValueColor={'#000'}
				valueSuffix={'%'}
			/>
		</View>
	) : (
		<ActivityIndicator style={styles.loader} />
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	loader: {
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
	},
	title: {
		alignSelf: 'center',
		marginBottom: 12,
		fontSize: 24,
	},
});

export default MealsOfDate;
