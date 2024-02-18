import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { Dimensions, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { getCalendarDates } from '../../utils/database';

type Props = {
	readonly isVisible: boolean;
	readonly toggleModalCalendar: VoidFunction;
};

const CalendarMeals = (props: Props) => {
	const windowWidth = Dimensions.get('window').width;
	const [dates, setDates] = useState<string[]>([]);
	const navigation = useNavigation();

	const customStyles = {
		container: {
			backgroundColor: '#fea022',
		},
		text: {
			color: 'black',
		},
	};

	const onDayPress = async (e: { dateString: string }) => {
		navigation.navigate('MealsOfDate', { mealsDate: e.dateString });
		props.toggleModalCalendar();
	};

	useEffect(() => {
		const fetchDates = async () => {
			const datesDB = await getCalendarDates();

			setDates(datesDB);
		};
		fetchDates();
	}, []);

	return (
		<View style={styles.container}>
			<Modal visible={props.isVisible} animationType="slide">
				<SafeAreaView style={styles.centeredView}>
					<Pressable onPress={props.toggleModalCalendar}>
						<Text>Close</Text>
					</Pressable>
					<CalendarList
						current={new Date().toISOString().split('T')[0]}
						pastScrollRange={200}
						futureScrollRange={200}
						calendarWidth={windowWidth * 0.7}
						markedDates={dates.reduce(
							(acc, shift) => ({
								...acc,
								[new Date(shift).toISOString().split('T')[0]]: {
									marked: true,
									color: 'green',
									customStyles,
								},
							}),
							{},
						)}
						theme={{ dotColor: '#000' }}
						markingType={'custom'}
						onDayPress={onDayPress}
					/>
				</SafeAreaView>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default CalendarMeals;
