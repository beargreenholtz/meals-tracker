import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { deleteAllMeals, updateMealById } from '../../../utils/database';
import { type Meal } from '../../../types/meal';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
	readonly updatedMeals: Meal[];
	readonly isEditable: boolean;
	readonly toggleEditable: VoidFunction;
	readonly toggleModalCalendar: VoidFunction;
};

function Header(props: Props) {
	const onPressSubmitMeals = () => {
		props.toggleEditable();

		props.updatedMeals.forEach(async (meal) => {
			await updateMealById(meal.meal_id ? meal.meal_id : meal.id, meal);
		});
	};

	return (
		<LinearGradient colors={['#F7971E', '#F0CB69']} style={styles.container}>
			<Pressable onPress={props.toggleModalCalendar}>
				<Feather name="calendar" size={24} color="black" />
			</Pressable>
			<Text style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</Text>
			{!props.isEditable ? (
				<Pressable onPress={props.toggleEditable}>
					<Feather name="edit" size={24} color="black" />
				</Pressable>
			) : (
				<Pressable onPress={onPressSubmitMeals}>
					<Feather name="save" size={24} color="black" />
				</Pressable>
			)}
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { backgroundColor: '#fea022', height: '15%', padding: 24, alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'row' },
});

export default Header;
