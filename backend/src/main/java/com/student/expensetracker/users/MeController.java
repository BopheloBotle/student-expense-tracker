package com.student.expensetracker.users;

import com.student.expensetracker.security.AppUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class MeController {
	public record MeResponse(long id, String email, String role) {}

	@GetMapping("/me")
	public MeResponse me(@AuthenticationPrincipal AppUserPrincipal principal) {
		return new MeResponse(principal.userId(), principal.getUsername(), principal.role());
	}
}

