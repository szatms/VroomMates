package com.vroommates.VroomMates.security;

import com.vroommates.VroomMates.model.usermodel.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class SecurityUser implements UserDetails {

    private final User user;

    public User getUser() {
        return this.user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> roles = new ArrayList<>();

        if (Boolean.TRUE.equals(user.getIsAdmin())) {
            roles.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        if (Boolean.TRUE.equals(user.getIsDriver())) {
            roles.add(new SimpleGrantedAuthority("ROLE_DRIVER"));
        }

        roles.add(new SimpleGrantedAuthority("ROLE_USER"));
        return roles;
    }

    @Override public String getPassword() { return user.getPasswordHash(); }
    @Override public String getUsername() { return user.getEmail(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return user.getEnabled() == null || user.getEnabled(); // null → true
    }
}
