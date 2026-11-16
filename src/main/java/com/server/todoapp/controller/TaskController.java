package com.server.todoapp.controller;

import com.server.todoapp.model.Task;
import com.server.todoapp.model.User;
import com.server.todoapp.repository.TaskRepository;
import com.server.todoapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public List<Task> getTasksByUser(@PathVariable Long userId) {
        return taskRepository.findByUserId(userId);
    }

    @PostMapping("/user/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody Task task) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        task.setUser(user);
        return taskRepository.save(task);
    }
}