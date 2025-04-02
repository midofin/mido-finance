export function calculateRewardPoints(
    stakedAmount: number,
    startTime: Date,
    lastCalculationTime: Date,
    currentTime: Date
): number {
    // Base points per SOL per hour
    const BASE_POINTS_PER_SOL_PER_HOUR = 10;

    // Calculate time difference in hours
    const hoursSinceLastCalculation =
        (currentTime.getTime() - lastCalculationTime.getTime()) / (1000 * 60 * 60);

    // Calculate points earned during this period
    const pointsEarned = stakedAmount * BASE_POINTS_PER_SOL_PER_HOUR * hoursSinceLastCalculation;

    // Apply time multiplier (optional): reward longer staking periods
    const totalStakingHours =
        (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const timeMultiplier = 1 + Math.min(totalStakingHours / 720, 0.5); // Max 50% bonus after 30 days

    return Math.round(pointsEarned * timeMultiplier);
}