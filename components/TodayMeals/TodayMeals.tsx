import React, { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';

import { Meal } from '../../types/meal';
import {
	fetchCalendarByDate,
	fetchMeals,
	insertMeal,
	insertMealsForToday,
	removeLastMeal,
	toggleMealCheckedStatus,
	updateMealById,
} from '../../utils/database';
import CalendarMeals from '../CalendarMeals/CalendarMeals';

import Header from './Header/Header';

function TodayMeals() {
	const [isEditable, setIsEditable] = useState(false);
	const [isModalColanderVisible, setIsModalCalendarVisible] = useState(false);

	const toggleModalCalendar = () => setIsModalCalendarVisible((prev) => !prev);

	const toggleEditable = async () => setIsEditable((prev) => !prev);

	const [meals, setMeals] = useState<Meal[]>([]);

	const handleMealToggleCheckbox = async (index: number, mealId: string) => {
		if (isEditable) {
			return;
		}

		const isChecked = meals[index].isChecked;
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
		setIsEditable(false);
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
	const onPressSubmitEdit = async (id: string) => {
		const mealIndex = meals.findIndex((meal) => meal.meal_id === id);

		await updateMealById(id, meals[mealIndex]);

		toggleEditable();
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
			<CalendarMeals isVisible={isModalColanderVisible} toggleModalCalendar={toggleModalCalendar} />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					<FlatList
						style={{ paddingHorizontal: 12, paddingTop: 24 }}
						data={meals}
						ItemSeparatorComponent={() => <View style={{ borderWidth: 1, marginVertical: 8, borderColor: '#808080' }} />}
						ListEmptyComponent={
							<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
								<Feather name="plus-square" size={52} color="black" onPress={() => onPressAddMeal()} />
							</View>
						}
						renderItem={({ item, index }) => {
							return (
								<Pressable onPress={() => handleMealToggleCheckbox(index, item.meal_id ? item.meal_id : item.id)}>
									<View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
										<TextInput
											placeholder="Edit meal name"
											value={item.name}
											style={[styles.title, item.isChecked && { textDecorationLine: 'line-through' }]}
											editable={isEditable}
											onChangeText={(text: string) => onChangeTextMeal(text, 'name', item.id)}
										/>
										<Checkbox
											style={{ padding: 12 }}
											color={'#fea022'}
											value={Boolean(item.isChecked)}
											onValueChange={() => handleMealToggleCheckbox(index, item.meal_id ? item.meal_id : item.id)}
										/>
									</View>
									<View style={styles.contentContainer}>
										{isEditable && (
											<Pressable
												onPress={() => {
													onPressSubmitEdit(item.meal_id ? item.meal_id : item.id);
												}}
											>
												<Feather name="save" size={24} color="black" />
											</Pressable>
										)}
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
									{isEditable && index === meals.length - 1 && (
										<View style={styles.editButtonsContainer}>
											<Feather name="minus" size={24} color="black" onPress={onPressRemoveLastMeal} />
											<Feather name="plus" size={24} color="black" onPress={() => onPressAddMeal()} />
										</View>
									)}
								</Pressable>
							);
						}}
						keyExtractor={(item) => (item.id ? item.id.toString() : item.name)}
					/>
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
		color: '#808080',
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
