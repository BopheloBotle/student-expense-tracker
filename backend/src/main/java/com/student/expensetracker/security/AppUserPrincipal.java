package com.student.expensetracker.security;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class AppUserPrincipal implements UserDetails {
	private final Long userId;
	private final String email;
	private final String passwordHash;
	private final String role; // "USER" | "ADMIN"

	public AppUserPrincipal(Long userId, String email, String passwordHash, String role) {
		this.userId = userId;
		this.email = email;
		this.passwordHash = passwordHash;
		this.role = role;
	}

	public Long userId() {
		return userId;
	}

	public String role() {
		return role;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role));
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}

