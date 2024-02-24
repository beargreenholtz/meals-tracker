import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

import { type Meal, MealsCalendarResponse } from '../types/meal';

const database = SQLite.openDatabase('meals.db');

export function init() {
	return new Promise<void>((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				`CREATE TABLE IF NOT EXISTS meals(
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    carbs TEXT NOT NULL,
                    protein TEXT NOT NULL,
                    fats TEXT NOT NULL
				)`,
				[],
				() => {
					console.log("Table 'meals' created successfully.");
					tx.executeSql(
						`CREATE TABLE IF NOT EXISTS meals_calendar(
							id TEXT PRIMARY KEY NOT NULL,
							meal_id TEXT NOT NULL,
							date DATE NOT NULL,
							isChecked BIT NOT NULL DEFAULT 0,
							FOREIGN KEY (meal_id) REFERENCES meals (id)
						)`,
						[],
						() => {
							console.log("Table 'meals_calendar' created successfully.");
							resolve();
						},
						(_, error) => {
							console.log(error);
							reject(new Error(error.message));

							return true;
						},
					);
				},
				(_, error) => {
					console.log(error);
					reject(new Error(error.message));

					return true;
				},
			);
		});
	});
}

export function insertMeal(meal: Meal) {
	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				`INSERT INTO meals (id, name, carbs, protein, fats)
                VALUES (?, ?, ?, ?, ?)`,
				[meal.id, meal.name, meal.carbs, meal.protein, meal.fats],
				(_, { rowsAffected }) => {
					if (rowsAffected > 0) {
						console.log(`Meal inserted successfully with ID: ${meal.id}`);
						tx.executeSql(
							`INSERT INTO meals_calendar (id, meal_id, date)
                                 VALUES (?, ?, ?)`,
							[Crypto.randomUUID(), meal.id, new Date().toISOString().split('T')[0]],
							() => {
								console.log('Meal added to calendar successfully.');
								resolve(meal.id);
							},
							(_, error) => {
								console.log(error);
								reject(new Error('Failed to add meal to calendar.'));
								return true;
							},
						);
					} else {
						reject(new Error('Failed to insert a meal.'));
					}
				},
				(_, error) => {
					console.log(error);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function fetchMeals(): Promise<Meal[]> {
	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'SELECT * FROM meals',
				[],
				(_, result) => {
					resolve(result.rows._array);
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function deleteAllMeals(): Promise<void> {
	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'DROP TABLE IF EXISTS meals_calendar',
				[],
				(_, result) => {
					resolve();
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function removeLastMeal(): Promise<void> {
	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'DELETE FROM meals WHERE id = (SELECT MAX(id) FROM meals)',
				[],
				(_, result) => {
					if (result.rowsAffected > 0) {
						resolve();
					} else {
						reject(new Error('No meals to remove'));
					}
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function updateMealById(mealId: string, updatedMeal: Meal) {
	return new Promise<void>((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				`UPDATE meals 
				SET name = ?, carbs = ?, protein = ?, fats = ?
				WHERE id = ?`,
				[updatedMeal.name, updatedMeal.carbs, updatedMeal.protein, updatedMeal.fats, mealId],
				(_, { rowsAffected }) => {
					if (rowsAffected > 0) {
						console.log(`Meal with ID ${mealId} updated successfully.`);
						resolve();
					} else {
						console.log(`No meal found with ID ${mealId}.`);
						reject(new Error(`No meal found with ID ${mealId}.`));
					}
				},
				(_, error) => {
					console.log(error);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function fetchMealsByDate(date: string): Promise<Meal[]> {
	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				`SELECT m.id, m.name, m.carbs, m.protein, m.fats
				FROM meals m
				JOIN meals_calendar mc ON m.id = mc.meal_id
				WHERE mc.date = ?`,
				[date],
				(_, result) => {
					resolve(result.rows._array);
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function insertMealsForToday(meals: Meal[]): Promise<void> {
	const date = new Date().toISOString().slice(0, 10);

	return new Promise<void>((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'SELECT COUNT(*) as count FROM meals_calendar WHERE date = ?',
				[date],
				(_, result) => {
					const existingMealCount = result.rows.item(0).count;

					if (existingMealCount > 0) {
						console.log(`Meals for date ${date} already exist. Skipping insertion.`);
						resolve();
						return;
					}

					meals.forEach((meal) => {
						tx.executeSql(
							`INSERT INTO meals_calendar (id, meal_id, date)
							VALUES (?, ?, ?)`,
							[Crypto.randomUUID(), meal.id, date],
							(_, { rowsAffected }) => {
								if (rowsAffected > 0) {
									console.log(`Meal ${meal.id} inserted for date ${date}`);
								} else {
									console.log(`Failed to insert meal ${meal.id} for date ${date}`);
								}
							},
							(_, error) => {
								console.log(error.message);
								if (typeof error === 'string') {
									reject(new Error(error));
								}
								return true;
							},
						);
					});
					resolve();
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function fetchCalendarByDate(date: Date): Promise<MealsCalendarResponse[]> {
	const today = new Date(date).toISOString().split('T')[0];

	return new Promise((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				`SELECT mc.id, mc.meal_id, mc.date, mc.isChecked, m.name, m.carbs, m.protein, m.fats
                FROM meals_calendar mc
                INNER JOIN meals m ON mc.meal_id = m.id
                WHERE mc.date = ?`,
				[today],
				(_, result) => {
					resolve(result.rows._array);
				},
				(_, error) => {
					console.log(error.message);
					if (typeof error === 'string') {
						reject(new Error(error));
					}
					return true;
				},
			);
		});
	});
}

export function toggleMealCheckedStatus(mealId: string) {
	const today = new Date().toISOString().split('T')[0];

	return new Promise<void>((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'UPDATE meals_calendar SET isChecked = NOT isChecked WHERE meal_id = ? AND date = ?',
				[mealId, today],
				(_, { rowsAffected }) => {
					if (rowsAffected > 0) {
						console.log(`isChecked status toggled for mealId: ${mealId} and date: ${today}`);
						resolve();
					} else {
						reject(new Error(`No rows updated for mealId: ${mealId} and date: ${today}`));
					}
				},
				(_, error) => {
					console.log(error);
					reject(new Error(error.message));

					return true;
				},
			);
		});
	});
}

export function getCalendarDates(): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		database.transaction((tx) => {
			tx.executeSql(
				'SELECT DISTINCT date FROM meals_calendar',
				[],
				(_, result) => {
					const dates: string[] = [];
					for (let i = 0; i < result.rows.length; i++) {
						const date = result.rows.item(i).date;
						dates.push(date);
					}
					resolve(dates);
				},
				(_, error) => {
					console.log(error);
					reject(new Error(error.message));
					return true;
				},
			);
		});
	});
}
