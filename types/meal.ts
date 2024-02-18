export type Meal = {
	readonly id: string;
	readonly meal_id?: string;
	readonly name: string;
	readonly carbs: string;
	readonly protein: string;
	readonly fats: string;
	readonly isChecked?: boolean;
};

export type MealsCalendarResponse = {
	readonly id: string;
	readonly meal_id: string;
	readonly date?: Date;
	readonly isChecked?: boolean;
} & Meal;
