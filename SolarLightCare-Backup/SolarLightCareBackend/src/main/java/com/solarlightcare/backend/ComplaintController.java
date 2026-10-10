
        package com.solarlightcare.backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;

    public ComplaintController(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    // Create a new complaint
    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    // Get all complaints
    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Get a complaint by ID
    @GetMapping("/{id}")
    public Complaint getComplaintById(@PathVariable Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"
                ));
    }

    // Update status and technician repair information
    @PatchMapping("/{id}/status")
    public Complaint updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"
                ));

        String newStatus = request.get("status");

        if (newStatus == null || newStatus.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status is required"
            );
        }

        newStatus = newStatus.trim().toUpperCase();

        List<String> allowedStatuses = List.of(
                "SUBMITTED",
                "VERIFIED",
                "ASSIGNED",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED",
                "REJECTED"
        );

        if (!allowedStatuses.contains(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid complaint status"
            );
        }

        complaint.setStatus(newStatus);

        String inspectionResult = request.get("inspectionResult");
        String repairDetails = request.get("repairDetails");
        String partsReplaced = request.get("partsReplaced");

        if (inspectionResult != null) {
            complaint.setInspectionResult(inspectionResult);
        }

        if (repairDetails != null) {
            complaint.setRepairDetails(repairDetails);
        }

        if (partsReplaced != null) {
            complaint.setPartsReplaced(partsReplaced);
        }

        return complaintRepository.save(complaint);
    }
}
