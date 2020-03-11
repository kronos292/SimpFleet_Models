module.exports = {
    "LC-3": [
        {
            size: '14',
            type: 'OPEN',
            costs: {
                "WH": {
                    start: {
                        numHours: 3,
                        cost: 70
                    },
                    sub: {
                        numHours: 1,
                        cost: 30
                    }
                },
                "AWH": {
                    start: {
                        numHours: 3,
                        cost: 90
                    },
                    sub: {
                        numHours: 1,
                        cost: 30
                    }
                }
            }
        },
        {
            size: '24',
            type: 'OPEN',
            costs: {
                "WH": {
                    start: {
                        numHours: 4,
                        cost: 100
                    },
                    sub: {
                        numHours: 1,
                        cost: 30
                    }
                },
                "AWH": {
                    start: {
                        numHours: 4,
                        cost: 120
                    },
                    sub: {
                        numHours: 1,
                        cost: 30
                    }
                }
            }
        }
    ]
};
