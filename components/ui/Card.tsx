import React, { useEffect, useRef, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
	readonly children: React.ReactNode;
};

function StreakModal(props: Props) {
	return (
		<LinearGradient style={styles.container} colors={['#ffe2bd', '#ffdbad']}>
			<MotiView>{props.children}</MotiView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 12,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 6,
		},
		shadowOpacity: 0.37,
		shadowRadius: 7.49,

		elevation: 12,
	},
});

export default React.memo(StreakModal);
