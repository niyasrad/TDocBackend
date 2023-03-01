const tasksRoute = require('./tasks.routes');
const usersRoute = require('./user.routes');

const combineRoutes = (app) => {
    app.use('/tasks', tasksRoute);
    app.use('/account', usersRoute)
}

module.exports = combineRoutes;