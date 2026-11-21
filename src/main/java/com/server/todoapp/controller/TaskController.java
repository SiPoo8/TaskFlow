package com.server.todoapp.controller;

import com.server.todoapp.model.Task;
import com.server.todoapp.model.User;
import com.server.todoapp.repository.TaskRepository;
import com.server.todoapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping
    public List<Task> getAllTasks(Authentication auth) {
        return taskRepository.findByUser_Id(currentUser(auth).getId());
    }

    @GetMapping("/{taskId}")
    public Task getTaskById(@PathVariable Long taskId, Authentication auth) {
        return ownTask(taskId, auth);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task, Authentication auth) {
        User user = currentUser(auth);
        task.setId(null);
        task.setUser(user);
        if (task.getCompleted() == null) task.setCompleted(false);
        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepository.save(task));
    }

    @PutMapping("/{taskId}")
    public Task updateTask(@PathVariable Long taskId,
                           @RequestBody Task updated,
                           Authentication auth) {
        Task existing = ownTask(taskId, auth);
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getCompleted() != null) existing.setCompleted(updated.getCompleted());
        return taskRepository.save(existing);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, Authentication auth) {
        taskRepository.delete(ownTask(taskId, auth));
        return ResponseEntity.noContent().build();
    }

    private Task ownTask(Long taskId, Authentication auth) {
        User user = currentUser(auth);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your task");
        }
        return task;
    }
}