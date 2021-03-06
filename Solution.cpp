
#include <iterator>
#include <numeric>
#include <array>
#include <vector>
using namespace std;

class Solution {

    struct Point {
        size_t row;
        size_t column;
        Point(size_t row, size_t column) : row {row}, column {column}{}
        Point() = default;
        ~Point() = default;
    };

    inline static const int GRASS = 0;
    inline static const int FIRE = 1;
    inline static const int WALL = 2;
    inline static const int MAX_TIME = 2 * pow(10, 4);
    inline static const int CAN_WAIT_UNLIMITED_TIME = pow(10, 9);
    inline static const int NOT_POSSIBLE_TO_REACH_GOAL = -1;
    inline static const array<array<int8_t, 2>, 4> MOVES{ {{-1, 0}, {1, 0}, {0, -1}, {0, 1}} };

    vector<Point> initialFirePoints;
    vector<vector<int>> currentGrid;
    vector<vector<int>> personLatestSteps;
    int ID_personLatestSteps;
    int blockedPointsOnPersonLatestSteps;
    size_t rows;
    size_t columns;

public:
    int maximumMinutes(const vector<vector<int>>& grid) {
        rows = grid.size();
        columns = grid[0].size();
        recordInitialFirePoints(grid);
        return findMaximumPossibleWaitingTimeAtInitialPosition(grid);
    }

private:
    int findMaximumPossibleWaitingTimeAtInitialPosition(const vector<vector<int>>& grid) {
        int lowerLimit = 0;
        int upperLimit = MAX_TIME;
        int maximumPossibleWaitingTime = NOT_POSSIBLE_TO_REACH_GOAL;

        while (lowerLimit <= upperLimit) {
            int time = lowerLimit + (upperLimit - lowerLimit) / 2;
            if (goalCanBeReached(grid, time)) {
                maximumPossibleWaitingTime = max(maximumPossibleWaitingTime, time);
                lowerLimit = time + 1;
            } else {
                upperLimit = time - 1;
            }
        }
        return (maximumPossibleWaitingTime != MAX_TIME) ? maximumPossibleWaitingTime : CAN_WAIT_UNLIMITED_TIME;
    }

    bool goalCanBeReached(const vector<vector<int>>& grid, int time) {
        cloneInitialGridForTheNextSearch(grid);
        queue<Point> fireQueue;
        initiallySpreadFireForGivenTime(fireQueue, time);
        if (currentGrid[0][0] == FIRE) {
            return false;
        }

        queue<Point> personQueue;
        personQueue.push(Point(0, 0));

        ID_personLatestSteps = 1;
        personLatestSteps.assign(rows, vector<int>(columns));
        personLatestSteps[0][0] = ID_personLatestSteps;

        while (!personQueue.empty() || !fireQueue.empty()) {

            bool fireUpdate = false;
            bool initalUpdate = false;
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

    void initiallySpreadFireForGivenTime(queue<Point>& fireQueue, int time) {
        for (const auto& point : initialFirePoints) {
            fireQueue.push(point);
        }
        bool fireUpdate = true;
        bool initalUpdate = true;
        int countMinutes = 0;
        while (!fireQueue.empty() && countMinutes < time) {
            countMinutes++;
            updateGrid(fireQueue, fireUpdate, initalUpdate);
        }
    }

    void updateGrid(queue<Point>& queue, bool fireUpdate, bool initalUpdate) {
        size_t size = queue.size();
        while (size-- > 0) {

            Point point = queue.front();
            queue.pop();

            for (const auto& move : MOVES) {
                int nextRow = point.row + move[0];
                int nextColumn = point.column + move[1];

                if (isInGrid(nextRow, nextColumn) && currentGrid[nextRow][nextColumn] == GRASS) {

                    if (fireUpdate) {
                        queue.push(Point(nextRow, nextColumn));
                        currentGrid[nextRow][nextColumn] = FIRE;
                        blockedPointsOnPersonLatestSteps += (!initalUpdate && personLatestSteps[nextRow][nextColumn] == ID_personLatestSteps) ? 1 : 0;
                    } else if (personLatestSteps[nextRow][nextColumn] == GRASS) {
                        queue.push(Point(nextRow, nextColumn));
                        personLatestSteps[nextRow][nextColumn] = ID_personLatestSteps;
                    }
                }
            }
        }
    }

    void recordInitialFirePoints(const vector<vector<int>>& grid) {
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < columns; ++c) {
                if (grid[r][c] == FIRE) {
                    initialFirePoints.push_back(Point(r, c));
                }
            }
        }
    }

    bool isInGrid(int row, int column) {
        return row >= 0 && row < rows && column >= 0 && column < columns;
    }

    void cloneInitialGridForTheNextSearch(const vector<vector<int>>& grid) {
        currentGrid.resize(rows);
        size_t indexRow = 0;
        for (const auto& row : grid) {
            currentGrid[indexRow].resize(columns);
            currentGrid[indexRow].assign(row.begin(), row.end());
            ++indexRow;
        }
    }
};
