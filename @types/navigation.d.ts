/* eslint-disable @typescript-eslint/no-empty-interface */
export type RootStackParamList = {
	Home: undefined;
	MealsOfDate: {
		mealsDate: string;
	};
};

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
