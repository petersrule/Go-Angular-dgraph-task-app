package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/google/uuid"
)

type Task struct {
	ID          string `json:"ID"`
	Task        string `json:"Task"`
	IsCompleted bool   `json:"IsCompleted"`
}

var tasks = []Task{}

func main() {
	// Create a new Fiber instance
	app := fiber.New()

	// Add the logger middleware
	app.Use(logger.New())

	// GET ALL TASKS ROUTE
	// Define a simple GET route
	app.Get("/api/tasks", func(c *fiber.Ctx) error {
		return c.JSON(tasks)
	})

	// CREATE NEW TASK ROUTE
	// Define a POST route to add a new task
	app.Post("/api/add/task", func(c *fiber.Ctx) error {
		var newTask Task

		// Parse the request body into the newTask struct
		if err := c.BodyParser(&newTask); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON",
			})
		}

		// Generate a new ID for the new task
		newTask.ID = uuid.New().String()

		// Set IsCompleted to false, standard for a new task
		newTask.IsCompleted = false

		// Append the new task to the tasks slice
		tasks = append([]Task{newTask}, tasks...)

		// Return the new task as a response
		return c.Status(fiber.StatusCreated).JSON(newTask)
	})

	// UPDATE TASK COMPLETION STATUS ROUTE
	// Define a PUT route to update the completion status of a task
	app.Put("/api/update/task/completion/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var task Task
		var found bool
		var index int

		for i, t := range tasks {
			if t.ID == id {
				task = t
				found = true
				index = i
				break
			}
		}

		if !found {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Task not found",
			})
		}

		// Update the task
		task.IsCompleted = !task.IsCompleted
		tasks[index] = task

		// Return the updated task as a response
		return c.JSON(task)
	})

	// UPDATE TASK ROUTE
	// Define a PUT route to update a task
	app.Put("/api/update/task/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var task Task
		var found bool
		var index int

		// Find the index of the task to update
		for i, t := range tasks {
			if t.ID == id {
				task = t
				found = true
				index = i
				break
			}
		}
		fmt.Println("Task: ", task)

		// If task not found, return an error
		if !found {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Task not found",
			})
		}
		fmt.Println("Found: ", found)

		// Parse the request body into the task struct
		if err := c.BodyParser(&task); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON",
			})
		}
		fmt.Println("Parsed: ", task)

		// Update the task
		tasks[index] = task

		// Return the updated task as a response
		return c.JSON(task)
	})

	// DELETE TASK ROUTE
	// Define a DELETE route to delete a task
	app.Delete("/api/delete/task/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		// Find the index of the task to delete
		index := -1
		for i, task := range tasks {
			if task.ID == id {
				index = i
				break
			}
		}

		// If task not found, return an error
		if index == -1 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Task not found",
			})
		}

		// Remove the task from the slice
		tasks = append(tasks[:index], tasks[index+1:]...)

		// Return a success message
		return c.JSON(fiber.Map{
			"message": "Task deleted",
		})
	})

	// Start the server on port 3000
	app.Listen(":3000")
}
