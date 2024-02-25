export const currentStreak = (arr: string[]) => {
	let streakCounter = 0;

	if (new Date(new Date().toDateString()).getTime() - new Date(new Date(arr[0]).toDateString()).getTime() === 0) {
		streakCounter++;
	} else if (
		streakCounter === 0 &&
		new Date(new Date().toDateString()).getTime() - (new Date(new Date(arr[0]).toDateString()).getTime() + 1000 * 60 * 60 * 24) !== 0
	) {
		return 0;
	}

	for (let i = 0; i < arr.length; i++) {
		const currentDate = new Date(arr[i]).getTime();
		const nextDate = new Date(arr[i + 1]).getTime();

		if (currentDate - nextDate === 1000 * 60 * 60 * 24) {
			streakCounter++;
		} else {
			return streakCounter;
		}
	}
};
