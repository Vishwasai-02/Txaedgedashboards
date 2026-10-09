package com.taxedge.task;

import com.taxedge.shared.ApiResponse;
import com.taxedge.shared.DomainType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {
    private final TaskService taskService;

    @GetMapping("/agent/queue")
    public ApiResponse<List<TaskItem>> getQueue(@RequestParam(required = false, defaultValue = "CA") String domain) {
        DomainType d = "GLOBAL".equalsIgnoreCase(domain) || "ALL".equalsIgnoreCase(domain) ? DomainType.GLOBAL : DomainType.valueOf(domain.toUpperCase());
        return ApiResponse.ok(taskService.getAgentTasks(d));
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskItem> getTask(@PathVariable String id) {
        return ApiResponse.ok(taskService.getTaskById(id));
    }
}
