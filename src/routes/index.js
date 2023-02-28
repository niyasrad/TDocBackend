const tasksRoute = require('./tasks.routes');

const combineRoutes = (app) => {
    app.use('/tasks', tasksRoute);
}

module.exports = combineRoutes;