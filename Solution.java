
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class Solution {

    private static final int GRASS = 0;
    private static final int FIRE = 1;
    private static final int WALL = 2;
    private static final int MAX_TIME = 2 * (int) Math.pow(10, 4);
    private static final int CAN_WAIT_UNLIMITED_TIME = (int) Math.pow(10, 9);
    private static final int NOT_POSSIBLE_TO_REACH_GOAL = -1;
    private static final int[][] MOVES = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    private static record Point(int row, int column) {}
    private List<Point> initialFirePoints;
    private int[][] currentGrid;
    private int[][] personLatestSteps;
    private int ID_personLatestSteps;
    private int blockedPointsOnPersonLatestSteps;
    private int rows;
    private int columns;

    public int maximumMinutes(int[][] grid) {
        rows = grid.length;
        columns = grid[0].length;
        recordInitialFirePoints(grid);
        return findMaximumPossibleWaitingTimeAtInitialPosition(grid);
    }

    private int findMaximumPossibleWaitingTimeAtInitialPosition(int[][] grid) {
        int lowerLimit = 0;
        int upperLimit = MAX_TIME;
        int maximumPossibleWaitingTime = NOT_POSSIBLE_TO_REACH_GOAL;

        while (lowerLimit <= upperLimit) {
            int time = lowerLimit + (upperLimit - lowerLimit) / 2;
            if (goalCanBeReached(grid, time)) {
                maximumPossibleWaitingTime = Math.max(maximumPossibleWaitingTime, time);
                lowerLimit = time + 1;
            } else {
                upperLimit = time - 1;
            }
        }
        return (maximumPossibleWaitingTime != MAX_TIME) ? maximumPossibleWaitingTime : CAN_WAIT_UNLIMITED_TIME;
    }

    private boolean goalCanBeReached(int[][] grid, int time) {
        cloneInitialGridForTheNextSearch(grid);
        Queue<Point> fireQueue = new LinkedList<>();
        initiallySpreadFireForGivenTime(fireQueue, time);
        if (currentGrid[0][0] == FIRE) {
            return false;
        }

        Queue<Point> personQueue = new LinkedList<>();
        personQueue.add(new Point(0, 0));
        ID_personLatestSteps = 1;
        personLatestSteps = new int[rows][columns];
        personLatestSteps[0][0] = ID_personLatestSteps;

        while (!personQueue.isEmpty() || !fireQueue.isEmpty()) {

            boolean fireUpdate = false;
            boolean initalUpdate = false;
            ++ID_personLatestSteps;
            updateGrid(personQueue, fireUpdate, initalUpdate);
            if (personLatestSteps[rows - 1][columns - 1] == ID_personLatestSteps) {
                return true;
            }

            fireUpdate = true;
            initalUpdate = false;
            blockedPointsOnPersonLatestSteps = 0;
            updateGrid(fireQueue, fireUpdate, initalUpdate);
            if (blockedPointsOnPersonLatestSteps == personQueue.size()) {
                return false;
            }
        }
        return false;
    }

    private void initiallySpreadFireForGivenTime(Queue<Point> fireQueue, int time) {
        for (Point point : initialFirePoints) {
            fireQueue.add(point);
        }
        boolean fireUpdate = true;
        boolean initalUpdate = true;
        int countMinutes = 0;
        while (!fireQueue.isEmpty() && countMinutes < time) {
            countMinutes++;
            updateGrid(fireQueue, fireUpdate, initalUpdate);
        }
    }

    private void updateGrid(Queue<Point> queue, boolean fireUpdate, boolean initalUpdate) {
        int size = queue.size();
        while (size-- > 0) {

            Point point = queue.poll();
            for (int[] move : MOVES) {
                int nextRow = point.row + move[0];
                int nextColumn = point.column + move[1];

                if (isInGrid(nextRow, nextColumn) && currentGrid[nextRow][nextColumn] == GRASS) {

                    if (fireUpdate) {
                        queue.add(new Point(nextRow, nextColumn));
                        currentGrid[nextRow][nextColumn] = FIRE;
                        blockedPointsOnPersonLatestSteps += (!initalUpdate && personLatestSteps[nextRow][nextColumn] == ID_personLatestSteps) ? 1 : 0;
                    } else if (personLatestSteps[nextRow][nextColumn] == GRASS) {
                        queue.add(new Point(nextRow, nextColumn));
                        personLatestSteps[nextRow][nextColumn] = ID_personLatestSteps;
                    }
                }
            }
        }
    }

    private void recordInitialFirePoints(int[][] grid) {
        initialFirePoints = new ArrayList<>();
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < columns; ++c) {
                if (grid[r][c] == FIRE) {
                    initialFirePoints.add(new Point(r, c));
                }
            }
        }
    }

    private boolean isInGrid(int row, int column) {
        return row >= 0 && row < rows && column >= 0 && column < columns;
    }

    private void cloneInitialGridForTheNextSearch(int[][] grid) {
        this.currentGrid = new int[rows][columns];
        for (int r = 0; r < rows; ++r) {
            this.currentGrid[r] = Arrays.copyOf(grid[r], columns);
        }
    }
}
