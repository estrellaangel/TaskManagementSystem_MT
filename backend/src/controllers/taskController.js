const taskService = require('../services/taskService');

exports.getTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasks(req.query, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};