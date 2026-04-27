package com.student.expensetracker.security;

import com.student.expensetracker.users.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
	private final UserRepository users;

	public AppUserDetailsService(UserRepository users) {
		this.users = users;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		var user =
				users.findByEmailIgnoreCase(username)
						.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		return new AppUserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(), user.getRole().name());
	}
}

