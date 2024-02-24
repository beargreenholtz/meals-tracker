import React, { useState } from 'react';

import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { currentStreak } from '../../utils/streak-counter';

type Props = {
	readonly isModalStreakVisible: boolean;
	readonly toggleModalStreak: VoidFunction;
};

function StreakModal(props: Props) {
	const [modalVisible, setModalVisible] = useState(true);
	const arr = ['2024-02-22', '2024-02-21', '2024-02-19', '2024-02-16', '2019-09-23'];

	// const streak = currentStreak(arr) || 0;
	const streak = 999;

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={props.isModalStreakVisible}
			onRequestClose={() => {
				Alert.alert('Modal has been closed.');
				setModalVisible(!modalVisible);
			}}
		>
			<MotiView
				from={{ backgroundColor: 'transparent' }}
				animate={{ backgroundColor: ['#fea022', { value: 'transparent', delay: 1500 }] }}
				style={styles.centeredView}
			>
				<View style={[styles.modalView]}>
					<LottieView
						onAnimationFinish={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
						autoPlay
						loop={false}
						style={{
							width: 200,
							height: 200,
						}}
						source={require('../../assets/fire-animated.json')}
					/>
					<View style={{ flexDirection: 'row' }}>
						<LottieView
							onAnimationFinish={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
							autoPlay
							loop={false}
							style={{
								width: 60,
								height: 60,
							}}
							source={require('../../assets/calendar-streak.json')}
						/>
						{(streak + 1).toString().split('').length > streak.toString().split('').length && (
							<MotiView
								delay={400 * streak.toString().split('').length + 600}
								from={{ translateY: 10, opacity: 0 }}
								animate={{ translateY: 0, opacity: 1 }}
								transition={{ type: 'timing' }}
							>
								<Text style={[styles.modalText]}>{(streak + 1).toString().split('')[0]}</Text>
							</MotiView>
						)}
						{streak
							.toString()
							.split('')
							.map((number, index) => {
								if ((streak + 1).toString().split('')[index] === number) {
									return (
										<Text key={index} style={[styles.modalText]}>
											{number}
										</Text>
									);
								}

								return (
									<View key={index} style={{ width: 30 }}>
										<MotiView
											delay={400 * (streak.toString().split('').length - index)}
											from={{ translateY: 0, opacity: 1 }}
											animate={{ translateY: -10, opacity: 0 }}
											transition={{ type: 'timing' }}
										>
											<Text style={[styles.modalText, { position: 'absolute' }]}>{number}</Text>
										</MotiView>
										<MotiView
											style={{}}
											delay={400 * (streak.toString().split('').length - index) + 200}
											from={{ translateY: 10, opacity: 0 }}
											animate={{ translateY: 0, opacity: 1 }}
											transition={{ type: 'timing' }}
										>
											<Text style={[styles.modalText]}>
												{
													(streak + 1).toString().split('')[
														(streak + 1).toString().split('').length > streak.toString().split('').length && index === 0
															? index + 1
															: index
													]
												}
											</Text>
										</MotiView>
									</View>
								);
							})}
					</View>
					<Pressable style={[styles.button, styles.buttonClose]} onPress={props.toggleModalStreak}>
						<Text style={styles.textStyle}>Hide Streak</Text>
					</Pressable>
				</View>
			</MotiView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonClose: {
		backgroundColor: '#fea022',
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalText: {
		marginBottom: 15,
		fontSize: 48,
		fontWeight: 'bold',
	},
});

export default React.memo(StreakModal);
