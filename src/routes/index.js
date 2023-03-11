const tasksRoute = require('./tasks.routes');
const usersRoute = require('./user.routes');
const categoriesRoute = require('./categories.routes');

const combineRoutes = (app) => {
    app.use('/categories', categoriesRoute)
    app.use('/tasks', tasksRoute);
    app.use('/account', usersRoute)
}

module.exports = combineRoutes;