import React, { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';

import { Meal } from '../../types/meal';
import {
	fetchCalendarByDate,
	fetchMeals,
	insertMeal,
	insertMealsForToday,
	insertStreakDate,
	removeLastMeal,
	toggleMealCheckedStatus,
} from '../../utils/database';
import CalendarMeals from '../CalendarMeals/CalendarMeals';
import Card from '../ui/Card';
import StreakModal from '../ui/StreakModal';

import Header from './Header/Header';

function TodayMeals() {
	const [isEditable, setIsEditable] = useState(false);
	const [isModalColanderVisible, setIsModalCalendarVisible] = useState(false);
	const [isModalStreakVisible, setIsModalStreakVisible] = useState(false);
	const [meals, setMeals] = useState<Meal[]>([]);

	const toggleModalCalendar = () => setIsModalCalendarVisible((prev) => !prev);

	const toggleModalStreak = () => setIsModalStreakVisible((prev) => !prev);
	const toggleEditable = async () => setIsEditable((prev) => !prev);

	const handleMealToggleCheckbox = async (index: number, mealId: string) => {
		if (meals.filter((item) => Boolean(item.isChecked) === true).length === meals.length - 1 && Boolean(meals[index].isChecked) === false) {
			setIsModalStreakVisible(true);
			Vibration.vibrate();
			await insertStreakDate(new Date());
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

		const isChecked = meals[index].isChecked;

		setMeals((prev) => {
			const updatedMeals = [...prev];
			updatedMeals[index] = { ...updatedMeals[index], isChecked: !isChecked ? true : false };
			return updatedMeals;
		});

		try {
			await toggleMealCheckedStatus(mealId);
		} catch (error) {
			console.log('Error occurred:', error);
			setMeals((prev) => {
				const updatedMeals = [...prev];
				updatedMeals[index] = { ...updatedMeals[index], isChecked: !isChecked ? false : true };
				return updatedMeals;
			});
		}
	};

	const onPressAddMeal = async () => {
		const id = Crypto.randomUUID();

		setMeals((prev) => {
			return [...prev, { id, name: '', carbs: '', protein: '', fats: '', isChecked: false }];
		});

		await insertMeal({
			id,
			name: '',
			carbs: '',
			protein: '',
			fats: '',
		});
	};

	const onPressRemoveLastMeal = async () => {
		setMeals((prev) => {
			const newState = [...prev];
			newState.pop();
			return newState;
		});
		await removeLastMeal();
	};

	const onChangeTextMeal = (text: string, inputName: string, id: string) => {
		setMeals((prevMeals) => {
			return prevMeals.map((meal) => {
				if (meal.id !== id) {
					return meal;
				}
				return { ...meal, [inputName]: text };
			});
		});
	};

	useEffect(() => {
		const fetchTodayCalendar = async () => {
			const mealsDB = await fetchMeals();

			await insertMealsForToday(mealsDB);

			const calendarMealsDB = await fetchCalendarByDate(new Date());

			setMeals(calendarMealsDB);
		};

		fetchTodayCalendar();
	}, []);

	return (
		<>
			<Header toggleEditable={toggleEditable} toggleModalCalendar={toggleModalCalendar} isEditable={isEditable} updatedMeals={meals} />
			<StreakModal isModalStreakVisible={isModalStreakVisible} toggleModalStreak={toggleModalStreak} />
			<CalendarMeals isVisible={isModalColanderVisible} toggleModalCalendar={toggleModalCalendar} />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					<FlatList
						style={{ paddingHorizontal: 12, paddingTop: 24 }}
						data={meals}
						ItemSeparatorComponent={() => <View style={{ marginVertical: 4 }} />}
						renderItem={({ item, index }) => {
							return (
								<>
									{index === 0 && <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 8 }}>Today meals</Text>}
									<Card>
										<Pressable onPress={() => handleMealToggleCheckbox(index, item.meal_id ? item.meal_id : item.id)}>
											<View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
												<TextInput
													placeholder="Edit meal name"
													value={item.name}
													style={[styles.title, item.isChecked && !isEditable && { textDecorationLine: 'line-through' }]}
													editable={isEditable}
													onChangeText={(text: string) => onChangeTextMeal(text, 'name', item.id)}
												/>
												{!isEditable && (
													<MotiView
														animate={{
															scale: !item.isChecked ? 1 : 1.2,
														}}
														transition={{
															type: 'spring',
														}}
													>
														<Checkbox
															style={{ padding: 12 }}
															color={'#fea022'}
															value={Boolean(item.isChecked)}
															onValueChange={() => handleMealToggleCheckbox(index, item.meal_id ? item.meal_id : item.id)}
														/>
													</MotiView>
												)}
											</View>
											<View style={styles.contentContainer}>
												<View style={{ flexDirection: 'column' }}>
													<TextInput
														scrollEnabled={false}
														multiline={true}
														placeholder="Edit carbs"
														value={item.carbs}
														style={[{ color: item.isChecked ? '#808080' : '#000' }, styles.content]}
														editable={isEditable}
														onChangeText={(text: string) => onChangeTextMeal(text, 'carbs', item.id)}
													/>
													<TextInput
														scrollEnabled={false}
														multiline={true}
														placeholder="Edit proteins"
														value={item.protein}
														style={[{ color: item.isChecked ? '#808080' : '#000' }, styles.content]}
														editable={isEditable}
														onChangeText={(text: string) => onChangeTextMeal(text, 'protein', item.id)}
													/>
													<TextInput
														scrollEnabled={false}
														placeholder="Edit fats"
														value={item.fats}
														style={[{ color: item.isChecked ? '#808080' : '#000' }, styles.content]}
														editable={isEditable}
														onChangeText={(text: string) => onChangeTextMeal(text, 'fats', item.id)}
													/>
												</View>
											</View>
										</Pressable>
									</Card>
									{isEditable && index === meals.length - 1 && (
										<View style={styles.editButtonsContainer}>
											<Feather name="minus" size={24} color="black" onPress={onPressRemoveLastMeal} />
											<Feather name="plus" size={24} color="black" onPress={() => onPressAddMeal()} />
										</View>
									)}
								</>
							);
						}}
						keyExtractor={(item) => (item.id ? item.id.toString() : item.name)}
					/>
					{meals.length === 0 && (
						<>
							<View
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Pressable onPress={() => onPressAddMeal()}>
									<Feather name="plus-square" size={52} color="black" />
								</Pressable>
							</View>
						</>
					)}
				</SafeAreaView>
			</KeyboardAvoidingView>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: {
		paddingHorizontal: 24,
		paddingVertical: 6,
	},
	title: {
		fontSize: 16,
		color: '#000',
	},
	contentContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	editButtonsContainer: {
		paddingBottom: 44,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	checkbox: {
		padding: 12,
	},
});

export default React.memo(TodayMeals);
