package com.student.expensetracker.auth;

import com.student.expensetracker.auth.dto.AuthResponse;
import com.student.expensetracker.auth.dto.LoginRequest;
import com.student.expensetracker.auth.dto.RegisterRequest;
import com.student.expensetracker.security.JwtService;
import com.student.expensetracker.users.Role;
import com.student.expensetracker.users.User;
import com.student.expensetracker.users.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final UserRepository users;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwt;
	private final AuthenticationManager authenticationManager;

	public AuthController(
			UserRepository users,
			PasswordEncoder passwordEncoder,
			JwtService jwt,
			AuthenticationManager authenticationManager) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.jwt = jwt;
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
		var email = req.email().toLowerCase();
		if (users.existsByEmailIgnoreCase(email)) {
			throw new IllegalArgumentException("Email is already registered");
		}
		var u = new User();
		u.setEmail(email);
		u.setPasswordHash(passwordEncoder.encode(req.password()));
		u.setRole(Role.USER);
		u = users.save(u);

		var token = jwt.issueAccessToken(u.getId(), u.getEmail(), u.getRole().name());
		return AuthResponse.bearer(token);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest req) {
		var email = req.email().toLowerCase();
		Authentication auth;
		try {
			auth =
					authenticationManager.authenticate(
							new UsernamePasswordAuthenticationToken(email, req.password()));
		} catch (BadCredentialsException ex) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		var principal = (com.student.expensetracker.security.AppUserPrincipal) auth.getPrincipal();
		var token = jwt.issueAccessToken(principal.userId(), principal.getUsername(), principal.role());
		return AuthResponse.bearer(token);
	}
}

